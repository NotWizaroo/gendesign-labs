// «Нити». Задание 5: интерактивная композиция.
// Идея: вселенная как сеть тонких светящихся нитей, похожих на волосы. Космос тёмный,
// а ты освещаешь его фонарём, который идёт за мышью с задержкой. Над всем этим хаотично летает
// неопознанный объект и оставляет за собой короткий шлейф.
//
// Этап 1: звёзды, нити-галактики, фонарь, летающий объект.
// Этап 2: звук. Всё генерируется кодом через Web Audio, файлов нет.
// Этап 3 (сейчас): переход-коллаж. Когда объект прилетает к центру галактики, с краёв экрана слетаются куски
// бумаги (фрагменты настоящих снимков NASA, вырезанные случайными многоугольниками, как в листинге 14 лабы),
// собираются в коллаж с подписью и быстро разлетаются обратно. Снимки: images/, авторы: images/credits.json.
//
// Звук:
//  - тихий гул: высота и «яркость» зависят от положения фонаря (левее/правее, выше/ниже);
//  - клик: нота из пентатоники (любое сочетание звучит мягко); первый клик ещё и включает звук;
//  - когда объект подлетает к лучу фонаря, он звенит мягким тоном;
//  - пробел или M — выключить/включить звук.
//
// Цифры 0–9: новое расположение звёзд и нитей. Каждая цифра — свой «жребий», поэтому нравящийся вид можно вернуть.
//
// Управление: двигай мышью; клик — позвать объект в эту точку и сыграть ноту (клик у центра галактики запускает коллаж);
// Enter — показать коллаж сразу.

const BG = '#05060d';
const LAMP_R = 260;          // радиус света фонаря

let galaxies = [];           // каждая галактика — центр, размер и набор нитей
let stars = [];
let lamp;                    // фонарь: плавно едет к мыши
let ufo;                     // летающий объект
let goal = null;             // куда позвали объект кликом
let mouseWasMoved = false;
let pics = [];                 // загруженные снимки NASA
let tr = null;                 // текущий переход-коллаж (null — его нет)
let nextVisit = 0;             // когда объект в следующий раз сам полетит к галактике
let layoutSeed;                // какая цифра сейчас задаёт расположение (undefined — случайное)

// Снимки NASA (авторы и ссылки в images/credits.json) и их русские названия для подписи.
const IMAGES = [
  { file: 'n-01.jpg', name: 'Галактика Водоворот' },
  { file: 'n-02.jpg', name: 'Галактика Андромеды' },
  { file: 'n-03.jpg', name: 'Космические утёсы · Киль' },
  { file: 'n-04.jpg', name: 'Туманность Южное Кольцо' },
  { file: 'n-05.jpg', name: 'Крабовидная туманность' },
  { file: 'n-06.jpg', name: 'Туманность Ориона' },
  { file: 'n-07.jpg', name: 'Кольца Сатурна' },
  { file: 'n-08.jpg', name: 'Юпитер' },
  { file: 'n-09.jpg', name: 'Туманность Улитка' },
  { file: 'n-10.jpg', name: 'Галактика Сомбреро' },
  { file: 'n-12.jpg', name: 'Квинтет Стефана' },
];

function preload() {
  pics = IMAGES.map((im) => loadImage('images/' + im.file));
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  lamp = { x: width / 2, y: height / 2 };
  ufo = { x: width * 0.3, y: height * 0.4, a: random(TWO_PI), trail: [] };
  build();
  nextVisit = millis() + 9000;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  build(layoutSeed);
}

// Создаём звёзды и галактики заново (при старте, смене размера окна и по цифрам).
// Если seed задан, расположение всегда одинаковое для одной цифры; без seed — случайное.
function build(seed) {
  if (seed !== undefined) { randomSeed(seed); noiseSeed(seed); }   // фиксируем «жребий», чтобы цифра давала один и тот же вид
  layoutSeed = seed;
  stars = [];
  for (let i = 0; i < 220; i++) {
    stars.push({ x: random(width), y: random(height), r: random(0.6, 1.8), ph: random(TWO_PI) });
  }
  const m = min(width, height);
  galaxies = [
    makeGalaxy(width * 0.42, height * 0.52, m * 0.38, 240, 0),
    makeGalaxy(width * 0.82, height * 0.28, m * 0.18, 200, 1),
    makeGalaxy(width * 0.14, height * 0.82, m * 0.15, 160, 2),
  ];
  if (seed !== undefined) randomSeed(millis());   // дальше случайность снова обычная
}

// Нить задаётся стартовой точкой в полярных координатах: на каком расстоянии от центра и под каким углом.
function makeGalaxy(cx, cy, R, count, id) {
  const strands = [];
  for (let i = 0; i < count; i++) {
    strands.push({ r: pow(random(), 0.7), a: random(TWO_PI) });   // pow(...) сгущает нити к центру
  }
  return { cx, cy, R, strands, id, pic: [0, 4, 9][id] };   // pic — номер её «главного» снимка в IMAGES
}

function draw() {
  background(BG);

  moveLamp();
  moveUfo();
  updateSound();

  // 1. нити рисуем режимом ADD: светлое складывается и «светится» там, где нити густые
  blendMode(ADD);
  galaxies.forEach(drawGalaxy);
  blendMode(BLEND);

  // 2. тёмная вуаль с «дыркой» вокруг фонаря: везде, кроме луча, нити почти не видны
  veil();

  // 3. звёзды: чуть ярче внутри луча
  drawStars();

  // 4. объект и шлейф рисуем поверх всего, он светится сам
  drawUfo();

  updateCollage();
  drawCollage();

  caption();
}

// ---------- фонарь ----------
function moveLamp() {
  let tx = mouseX, ty = mouseY;
  if (!mouseWasMoved) {                       // пока мышь не трогали, фонарь сам плавает по экрану
    const t = millis() / 1000;
    tx = width * (0.5 + 0.3 * sin(t * 0.4));
    ty = height * (0.5 + 0.25 * sin(t * 0.31 + 1));
  }
  lamp.x += (tx - lamp.x) * 0.06;             // 0.06 — «тяжесть»: фонарь догоняет мышь с задержкой
  lamp.y += (ty - lamp.y) * 0.06;
}

function mouseMoved() { mouseWasMoved = true; }

function veil() {
  const g = drawingContext.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, LAMP_R * 1.4);
  g.addColorStop(0, 'rgba(5,6,13,0)');
  g.addColorStop(0.45, 'rgba(5,6,13,0.4)');
  g.addColorStop(1, 'rgba(5,6,13,0.9)');
  drawingContext.fillStyle = g;
  noStroke();
  drawingContext.fillRect(0, 0, width, height);
}

// насколько точка освещена: 1 в центре луча, 0 за его границей
function light(x, y) {
  return constrain(1 - dist(x, y, lamp.x, lamp.y) / LAMP_R, 0, 1);
}

// ---------- нити ----------
// Нить — это путь по «течению»: из стартовой точки идём маленькими шагами,
// на каждом шаге поворачивая по полю (кружение вокруг центра + шум), поэтому линии изгибаются, как волосы.
function drawGalaxy(g) {
  const t = millis() / 9000;                  // время для медленного изменения шума
  const STEPS = 38;
  noFill();
  strokeWeight(1);
  g.strands.forEach((s) => {
    let x = g.cx + cos(s.a) * s.r * g.R;
    let y = g.cy + sin(s.a) * s.r * g.R;
    // цвет зависит от расстояния до центра: тёплое ядро, холодные края
    // оттенок идёт 40° (золотой) → 0° (красный) → 330° (розовый) → 270° (фиолетовый): обходим зелёный
    stroke((40 - s.r * 130 + 360) % 360, lerp(45, 75, s.r), 100, 0.16);
    beginShape();
    for (let k = 0; k < STEPS; k++) {
      vertex(x, y);
      const around = atan2(y - g.cy, x - g.cx) + HALF_PI + 0.35;   // направление «вокруг центра» и чуть внутрь
      const wobble = (noise(x * 0.004, y * 0.004, t + g.id * 10) - 0.5) * 3.2;
      x += cos(around + wobble) * 5;
      y += sin(around + wobble) * 5;
    }
    endShape();
  });
}

// ---------- звёзды ----------
function drawStars() {
  noStroke();
  const t = millis() / 1000;
  stars.forEach((s) => {
    const twinkle = 0.5 + 0.5 * sin(t * 1.3 + s.ph);
    const a = (0.25 + 0.75 * light(s.x, s.y)) * (0.4 + 0.6 * twinkle);
    fill(215, 15, 100, a);
    circle(s.x, s.y, s.r * 2);
  });
}

// ---------- неопознанный объект ----------
function moveUfo() {
  // хаотичный полёт: угол поворота плавно меняется по шуму
  ufo.a += (noise(frameCount * 0.008, 50) - 0.5) * 0.14;
  let speed = 1.5;

  // время от времени объект сам летит к центру случайной галактики
  if (!goal && !tr && millis() > nextVisit) {
    const g = random(galaxies);
    goal = { x: g.cx, y: g.cy, g };
  }

  if (goal) {                                 // позвали (кликом или сам): поворачиваем к точке
    const want = atan2(goal.y - ufo.y, goal.x - ufo.x);
    ufo.a += sin(want - ufo.a) * 0.06;
    speed = 2.4;
    if (dist(ufo.x, ufo.y, goal.x, goal.y) < 30) {
      if (goal.g && !tr) startCollage(goal.g);   // долетели до центра галактики: запускаем коллаж
      goal = null;
    }
  }

  // у края экрана разворачиваем к центру
  const margin = 80;
  if (ufo.x < margin || ufo.x > width - margin || ufo.y < margin || ufo.y > height - margin) {
    const back = atan2(height / 2 - ufo.y, width / 2 - ufo.x);
    ufo.a += sin(back - ufo.a) * 0.05;
  }

  ufo.x += cos(ufo.a) * speed;
  ufo.y += sin(ufo.a) * speed;

  ufo.trail.push({ x: ufo.x, y: ufo.y });
  if (ufo.trail.length > 45) ufo.trail.shift();
}

function drawUfo() {
  // шлейф: мелкие точки, чем старше — тем бледнее и меньше
  noStroke();
  ufo.trail.forEach((p, i) => {
    const k = i / ufo.trail.length;
    fill(190, 40, 100, k * 0.5);
    circle(p.x, p.y, 1 + k * 4);
  });

  // мягкое свечение вокруг
  const g = drawingContext.createRadialGradient(ufo.x, ufo.y, 0, ufo.x, ufo.y, 46);
  g.addColorStop(0, 'rgba(160,230,255,0.35)');
  g.addColorStop(1, 'rgba(160,230,255,0)');
  drawingContext.fillStyle = g;
  drawingContext.fillRect(ufo.x - 46, ufo.y - 46, 92, 92);

  // тарелка: купол + корпус + огоньки; чуть наклоняется по направлению полёта
  push();
  translate(ufo.x, ufo.y);
  rotate(cos(ufo.a) * 0.15);
  fill(200, 25, 100, 0.9);
  arc(0, -2, 16, 14, PI, TWO_PI);             // купол
  fill(220, 30, 85, 1);
  ellipse(0, 0, 34, 9);                       // корпус
  fill(45, 60, 100, 1);
  for (let i = -1; i <= 1; i++) circle(i * 9, 0.5, 2.2);   // три огонька
  pop();
}

// ---------- подпись ----------
function caption() {
  // подсказка: пока звук выключен, висит всегда; после включения исчезает через несколько секунд
  const a = audio ? constrain(1 - (millis() - audioStart) / 7000, 0, 1) * 0.7 : 0.7;
  if (a <= 0) return;
  noStroke();
  fill(0, 0, 100, a);
  textFont('Helvetica');
  textAlign(LEFT, BOTTOM);
  textSize(13);
  const hint = audio
    ? 'двигай мышью — свети фонарём · клик — нота и зов · пробел — звук · цифры 0–9 — новое небо'
    : 'Нити · клик — включить звук и позвать объект · цифры 0–9 — новое небо';
  text(hint, 24, height - 20);
}

function mousePressed() {
  goal = { x: mouseX, y: mouseY };
  // клик рядом с центром галактики: объект прилетит туда и запустит коллаж
  galaxies.forEach((g) => { if (dist(mouseX, mouseY, g.cx, g.cy) < 90) goal = { x: g.cx, y: g.cy, g }; });
  if (!audio) startAudio();                    // браузер разрешает звук только после клика
  // нота зависит от высоты клика: выше на экране — выше нота
  playNote(noteFor(1 - mouseY / height), 0.22, 2.6);
}

function keyPressed() {
  if (keyCode === ENTER && !tr) startCollage(random(galaxies));   // показать коллаж сразу
  if ((key === 'm' || key === 'M' || key === ' ') && audio) {
    muted = !muted;
    master.gain.setTargetAtTime(muted ? 0 : 0.5, audio.currentTime, 0.1);   // плавно, без щелчка
  }
  if (key === ' ') return false;               // чтобы пробел не прокручивал страницу

  // цифры 0–9: новое расположение звёзд и нитей; одна и та же цифра всегда даёт один и тот же вид
  if (key >= '0' && key <= '9') {
    build(int(key) * 101 + 7);
    playNote(SCALE[int(key)], 0.12, 2.2);      // нота по номеру цифры: звуковое подтверждение
  }
}

// ---------- звук ----------
let audio = null;            // AudioContext — «звуковая студия» браузера
let audioStart = 0;
let master;                  // общая громкость
let humFilter, humGain;      // фильтр и громкость гула
let echo;                    // эхо: даёт ощущение большого пространства
let muted = false;
let lastChime = 0;
let noiseBuf;                // буфер шума

// Пентатоника (ноты ля-минора без полутонов): любые ноты вместе звучат спокойно.
const SCALE = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99];

function noteFor(t) {                          // t от 0 до 1 → одна из нот
  return SCALE[constrain(floor(t * SCALE.length), 0, SCALE.length - 1)];
}

function startAudio() {
  audio = new (window.AudioContext || window.webkitAudioContext)();
  audioStart = millis();
  master = audio.createGain();
  master.gain.value = 0.5;
  master.connect(audio.destination);

  // эхо: задержка 0.45 с с затуханием; сигнал обходит её по кругу несколько раз
  echo = audio.createDelay(1);
  echo.delayTime.value = 0.45;
  const fb = audio.createGain();
  fb.gain.value = 0.45;
  echo.connect(fb); fb.connect(echo);
  const echoOut = audio.createGain();
  echoOut.gain.value = 0.5;
  echo.connect(echoOut); echoOut.connect(master);

  // шум для «шелеста бумаги» при сборке коллажа: секунда случайных значений
  noiseBuf = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = random(-1, 1);

  // гул: две низкие синусоиды чуть врозь по частоте (дают медленное «биение»), через фильтр
  humFilter = audio.createBiquadFilter();
  humFilter.type = 'lowpass';
  humFilter.frequency.value = 400;
  humGain = audio.createGain();
  humGain.gain.value = 0.0;
  humFilter.connect(humGain); humGain.connect(master);
  [55, 55.7, 82.4].forEach((f) => {
    const o = audio.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    o.connect(humFilter);
    o.start();
  });
}

// Одна нота: синусоида с быстрым «ударом» и долгим затуханием.
function playNote(freq, vol, len) {
  if (!audio) return;
  const t = audio.currentTime;
  const o = audio.createOscillator();
  const g = audio.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.02);           // быстрое нарастание
  g.gain.exponentialRampToValueAtTime(0.001, t + len);     // долгое затухание
  o.connect(g);
  g.connect(master);
  g.connect(echo);                                         // часть сигнала уходит в эхо
  o.start(t);
  o.stop(t + len + 0.1);
}

// Каждый кадр: гул следует за фонарём, объект звенит рядом с лучом.
function updateSound() {
  if (!audio) return;
  const x = lamp.x / width, y = 1 - lamp.y / height;       // 0..1; y — выше на экране = больше
  humFilter.frequency.setTargetAtTime(200 + x * 900, audio.currentTime, 0.2);   // правее — ярче гул
  humGain.gain.setTargetAtTime(0.05 + y * 0.1, audio.currentTime, 0.3);         // выше — громче

  // объект подлетел к лучу: тихий звон, но не чаще раза в 1.3 с
  if (millis() - lastChime > 1300 && dist(ufo.x, ufo.y, lamp.x, lamp.y) < LAMP_R * 0.5) {
    lastChime = millis();
    playNote(noteFor(1 - ufo.y / height) * 2, 0.08, 2);    // на октаву выше, тише
  }
}


// ---------- коллаж-переход ----------
// Фазы: in — куски слетаются с краёв; hold — коллаж стоит; out — куски разлетаются обратно.
const T_IN = 1300, T_HOLD = 2000, T_OUT = 900;       // длительности, мс
const TINTS = ['#e07a5f', '#3d5a80', '#f2cc8f', '#81b29a', '#6d597a'];

function startCollage(g) {
  const m = min(width, height);
  const N = 24;
  const pieces = [];
  for (let i = 0; i < N; i++) {
    const k = i / N;                                   // 0 — самый нижний слой, 1 — самый верхний
    // три самых нижних куска из «главного» снимка галактики, остальные из случайных
    const img = pics[i < 3 ? g.pic : floor(random(pics.length))];
    const w = lerp(m * 0.6, m * 0.2, k) * random(0.85, 1.15);   // нижние куски крупные, верхние мелкие
    const h = w * random(0.75, 1.3);
    // какой кусок снимка вырезать
    const cw = random(0.3, 0.8) * img.width;
    const ch = min(img.height, cw * h / w);
    // многоугольник-вырезка: вершины по кругу со случайным радиусом
    const n = floor(random(3, 8));
    const pts = [];
    for (let j = 0; j < n; j++) {
      const a = TWO_PI * j / n + random(-0.35, 0.35);
      const r = random(0.55, 1);
      pts.push([cos(a) * w / 2 * r, sin(a) * h / 2 * r]);
    }
    pieces.push({
      img, w, h, pts, cw, ch,
      sx: random(0, max(1, img.width - cw)), sy: random(0, max(1, img.height - ch)),
      tx: width / 2 + random(-0.26, 0.26) * width * (0.4 + 0.6 * (1 - k)),   // нижние куски разбросаны шире, верхние кучнее
      ty: height / 2 + random(-0.24, 0.24) * height * (0.4 + 0.6 * (1 - k)),
      ta: random(-0.5, 0.5),
      from: edgePoint(), fa: random(-3, 3),
      delay: random(0, 0.4),                           // кому-то лететь начинать позже
      tint: random(TINTS),
    });
  }
  tr = { t0: millis(), pieces, phase: 'in', name: IMAGES[g.pic].name };
  soundSwish(T_IN / 1000, 500, 3500);
}

// точка за краем экрана, откуда прилетает кусок
function edgePoint() {
  const side = floor(random(4));
  const out = 180;
  if (side === 0) return { x: random(width), y: -out };
  if (side === 1) return { x: random(width), y: height + out };
  if (side === 2) return { x: -out, y: random(height) };
  return { x: width + out, y: random(height) };
}

const easeOut = (t) => 1 - pow(1 - t, 3);
const easeIn = (t) => t * t * t;

function updateCollage() {
  if (!tr) return;
  const t = millis() - tr.t0;
  const phase = t < T_IN ? 'in' : t < T_IN + T_HOLD ? 'hold' : t < T_IN + T_HOLD + T_OUT ? 'out' : 'done';
  if (phase !== tr.phase) {                            // на смене фазы — звук
    tr.phase = phase;
    if (phase === 'hold') { playNote(SCALE[2], 0.14, 3); playNote(SCALE[5], 0.1, 3); }
    if (phase === 'out') soundSwish(T_OUT / 1000, 3000, 400);
  }
  if (phase === 'done') {
    tr = null;
    nextVisit = millis() + random(14000, 22000);       // следующий визит нескоро
  }
}

function drawCollage() {
  if (!tr) return;
  const t = millis() - tr.t0;
  const ctx = drawingContext;

  // затемнение фона, чтобы коллаж читался: растёт при сборке, спадает при разборке
  let veilK = 1;
  if (tr.phase === 'in') veilK = easeOut(t / T_IN);
  if (tr.phase === 'out') veilK = 1 - (t - T_IN - T_HOLD) / T_OUT;
  ctx.fillStyle = `rgba(5,6,13,${0.6 * constrain(veilK, 0, 1)})`;
  ctx.fillRect(0, 0, width, height);

  tr.pieces.forEach((pc) => {
    let x, y, a;
    if (tr.phase === 'in') {
      const p = easeOut(constrain((t / T_IN - pc.delay) / (1 - pc.delay), 0, 1));
      x = lerp(pc.from.x, pc.tx, p); y = lerp(pc.from.y, pc.ty, p); a = lerp(pc.fa, pc.ta, p);
    } else if (tr.phase === 'hold') {
      x = pc.tx; y = pc.ty; a = pc.ta + sin(t / 700 + pc.tx) * 0.01;   // чуть «дышит»
    } else {
      const p = easeIn(constrain(((t - T_IN - T_HOLD) / T_OUT - pc.delay * 0.5) / (1 - pc.delay * 0.5), 0, 1));
      x = lerp(pc.tx, pc.from.x, p); y = lerp(pc.ty, pc.from.y, p); a = lerp(pc.ta, pc.fa, p);
    }
    drawPiece(pc, x, y, a);
  });

  // подпись на бумажной полоске, появляется, когда коллаж собрался
  if (tr.phase === 'hold') {
    const k = constrain((t - T_IN) / 400, 0, 1);
    push();
    translate(width / 2, height / 2 + min(width, height) * 0.3);
    rotate(-0.02);
    ctx.globalAlpha = k;
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#efe9dc';
    ctx.fillRect(-170, -26, 340, 52);
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#16161a';
    ctx.textAlign = 'center';
    ctx.font = '600 20px Helvetica, Arial, sans-serif';
    ctx.fillText(tr.name, 0, -2);
    ctx.font = '11px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#6b665a';
    ctx.fillText('снимок NASA', 0, 16);
    ctx.globalAlpha = 1;
    pop();
  }
}

// Один кусок бумаги: тень, вырезка из снимка по многоугольнику, цветная подкладка, светлая кромка.
function drawPiece(pc, x, y, ang) {
  const ctx = drawingContext;
  const path = () => {
    ctx.beginPath();
    pc.pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.closePath();
  };
  push();
  translate(x, y);
  rotate(ang);

  ctx.save();                                     // тень и «бумага» под снимком
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#e8e2d4';
  path(); ctx.fill();
  ctx.restore();

  ctx.save();                                     // снимок, обрезанный многоугольником
  path(); ctx.clip();
  image(pc.img, -pc.w / 2, -pc.h / 2, pc.w, pc.h, pc.sx, pc.sy, pc.cw, pc.ch);
  ctx.globalCompositeOperation = 'multiply';      // цветной оттенок поверх снимка
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = pc.tint;
  ctx.fillRect(-pc.w / 2, -pc.h / 2, pc.w, pc.h);
  ctx.restore();

  ctx.save();                                     // светлая кромка
  path();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
  pop();
}

// Шелест бумаги: шум через полосовой фильтр, частота которого плавно едет вверх или вниз.
function soundSwish(len, f0, f1) {
  if (!audio || !noiseBuf) return;
  const t = audio.currentTime;
  const src = audio.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const f = audio.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 1.2;
  f.frequency.setValueAtTime(f0, t);
  f.frequency.exponentialRampToValueAtTime(f1, t + len);
  const g = audio.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.18, t + len * 0.5);
  g.gain.linearRampToValueAtTime(0, t + len);
  src.connect(f); f.connect(g); g.connect(master);
  src.start(t);
  src.stop(t + len + 0.1);
}
