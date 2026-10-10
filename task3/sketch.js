// Задание 3. Текст с интерактивностью: «бегущая строка с бегущим силуэтом».
// Не просто двигающийся текст, а текст, который СТАНОВИТСЯ
// бегуном. Тело (торс, руки, ноги, голова) собрано из букв заданной строки,
// каждая буква повёрнута вдоль своей «кости». Поза считается по фазе бега:
// ноги и руки качаются в противофазе, колено сгибается в замахе.
// Внизу бежит та же строка — «беговая дорожка».

let phrase = 'БЕГУ ВПЕРЁД · ';   // строку можно печатать с клавиатуры
const SIZE = 16;      // кегль букв
const SCALE = 1.6;    // размер бегуна
const TRAIL = 0.55;   // длина шлейфа (0 — нет, 0.9 — очень длинный)
let speed = 1;        // темп: управляется мышью по X
let hue = 160;        // оттенок: управляется мышью по Y

const THIGH = 58, SHIN = 58, UPPER = 40, FORE = 38, TORSO = 78, HEAD_R = 21;

function setup() {
  createCanvas(900, 560);
  colorMode(HSB, 360, 100, 100, 100);
  textAlign(CENTER, CENTER);
  textFont('Arial');
  textStyle(BOLD);
  background(0, 0, 6);
}

// Координаты точек: ось Y вниз, 0 — бедро. Угол отсчитывается от вертикали, плюс — вперёд.
function legPoints(hip, ph) {
  const theta = radians(48) * sin(ph) + radians(6);
  const flex = radians(14) + radians(100) * pow(max(0, cos(ph - 0.35)), 1.4);
  const knee = { x: hip.x + sin(theta) * THIGH, y: hip.y + cos(theta) * THIGH };
  const shinA = theta - flex;
  const foot = { x: knee.x + sin(shinA) * SHIN, y: knee.y + cos(shinA) * SHIN };
  return [hip, knee, foot];
}

function armPoints(sh, ph) {
  const a = -radians(52) * sin(ph);
  const bend = radians(70) + radians(22) * sin(ph + 1);
  const elbow = { x: sh.x + sin(a) * UPPER, y: sh.y + cos(a) * UPPER };
  const hand = { x: elbow.x + sin(a + bend) * FORE, y: elbow.y + cos(a + bend) * FORE };
  return [sh, elbow, hand];
}

// Расставляет буквы вдоль ломаной. Возвращает индекс следующей буквы.
function inkAlong(points, idx, shift, alpha, sat) {
  const word = phrase.length ? phrase : ' ';
  const step = SIZE * 0.64;
  for (let s = 0; s < points.length - 1; s++) {
    const a = points[s], b = points[s + 1];
    const len = dist(a.x, a.y, b.x, b.y);
    const n = max(1, floor(len / step));
    const ang = atan2(b.y - a.y, b.x - a.x);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const ch = word[(idx + shift) % word.length];
      push();
      translate(lerp(a.x, b.x, t), lerp(a.y, b.y, t));
      rotate(ang + HALF_PI);                       // верх буквы смотрит наружу от «кости»
      fill((hue + idx * 6) % 360, sat, 100, alpha);
      textSize(SIZE);
      text(ch, 0, 0);
      pop();
      idx++;
    }
  }
  return idx;
}

function draw() {
  speed = map(mouseX, 0, width, 0.3, 2.5);   // мышь по X — темп бега
  hue = map(mouseY, 0, height, 0, 360);      // мышь по Y — оттенок
  noStroke();
  background(0, 0, 6, 100 * (1 - TRAIL));

  const t = millis() / 1000;
  const phase = t * TWO_PI * 1.55 * speed;
  const shift = floor(t * 7 * speed);            // текст «течёт» по телу
  const ground = height * 0.74;

  // Беговая дорожка: та же строка едет влево.
  const word = (phrase.length ? phrase : ' ');
  textSize(SIZE * 0.8);
  const unit = textWidth(word);
  const off = (t * 260 * speed) % unit;
  fill(hue, 25, 90, 40);
  for (let x = -off; x < width; x += unit) text(word, x + unit / 2, ground + 56);
  stroke(hue, 40, 100, 25);
  line(0, ground + 30, width, ground + 30);
  noStroke();

  push();
  translate(width / 2 + sin(t * 0.8) * 40, ground - (THIGH + SHIN) * SCALE * 0.92);
  scale(SCALE);
  const bob = -abs(cos(phase)) * 9;
  translate(0, bob);

  const hip = { x: 0, y: 0 };
  const lean = radians(14);
  const sh = { x: sin(lean) * TORSO, y: -cos(lean) * TORSO };

  // Дальние конечности — тусклее, ближние — ярче.
  let idx = 0;
  idx = inkAlong(legPoints(hip, phase + PI), idx, shift, 38, 55);
  idx = inkAlong(armPoints(sh, phase), idx, shift, 38, 55);
  idx = inkAlong([hip, sh], idx, shift, 95, 70);

  // Голова: кольцо букв.
  const hc = { x: sh.x + sin(lean) * (HEAD_R + 8), y: sh.y - cos(lean) * (HEAD_R + 8) };
  const ring = [];
  for (let i = 0; i <= 9; i++) {
    const a = (i / 9) * TWO_PI;
    ring.push({ x: hc.x + cos(a) * HEAD_R, y: hc.y + sin(a) * HEAD_R });
  }
  idx = inkAlong(ring, idx, shift, 95, 60);

  idx = inkAlong(legPoints(hip, phase), idx, shift, 100, 78);
  inkAlong(armPoints(sh, phase + PI), idx, shift, 100, 78);
  pop();
}

// Печатаемые символы дописываются к строке (до 24 знаков), Backspace стирает.
function keyTyped() {
  if (key.length === 1 && phrase.length < 24) phrase += key.toUpperCase();
}

function keyPressed() {
  if (keyCode === BACKSPACE) phrase = phrase.slice(0, -1);
  if (keyCode === ENTER) phrase = 'БЕГУ ВПЕРЁД · ';
}
