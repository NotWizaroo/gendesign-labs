// Задание 3 · вариант C. «Слово из частиц».
// Слово рисуется в невидимый буфер, из него берутся опорные точки по сетке,
// и каждая точка становится частицей на пружинке. Курсор отталкивает частицы,
// а при смене строки они не исчезают, а перетекают в новые буквы.

const P = params({
  text:     { value: 'ФОРМА', label: 'Слово' },
  gap:      { value: 6,   min: 3,  max: 12,  step: 1,    label: 'Шаг точек' },
  radius:   { value: 90,  min: 30, max: 260, step: 5,    label: 'Радиус курсора' },
  force:    { value: 1.1, min: 0.2, max: 3,  step: 0.1,  label: 'Сила' },
  spring:   { value: 0.08, min: 0.02, max: 0.3, step: 0.01, label: 'Упругость' },
  hue:      { value: 28,  min: 0,  max: 360, step: 1,    label: 'Оттенок' },
  shatter:  { button: 'Взорвать', fn: () => parts.forEach((p) => {
    const a = random(TWO_PI), s = random(6, 20);
    p.vx += cos(a) * s; p.vy += sin(a) * s;
  }) },
});

let parts = [];
let buffer;

function setup() {
  createCanvas(900, 560);
  colorMode(HSB, 360, 100, 100, 100);
  buffer = createGraphics(width, height);
  buffer.pixelDensity(1);
  rebuild();
}

// Цели пересобираем только при смене слова или шага; остальные ползунки читаются в draw().
function onParam(key) { if (key === 'text' || key === 'gap') rebuild(); }

// Собирает цели частиц из пикселей буфера.
function rebuild() {
  const word = (P.text || ' ').toUpperCase();
  buffer.clear();
  buffer.background(0);
  buffer.fill(255);
  buffer.noStroke();
  buffer.textAlign(CENTER, CENTER);
  buffer.textStyle(BOLD);
  buffer.textFont('Arial');
  buffer.textSize(100);
  const w100 = max(1, buffer.textWidth(word));
  buffer.textSize(min(height * 0.7, 100 * (width * 0.88) / w100));   // слово влезает по ширине
  buffer.text(word, width / 2, height / 2);
  buffer.loadPixels();

  const targets = [];
  for (let y = 0; y < height; y += P.gap) {
    for (let x = 0; x < width; x += P.gap) {
      if (buffer.pixels[(y * width + x) * 4] > 128) targets.push({ x, y });
    }
  }

  // Старые частицы переиспользуем — они плавно перетекают в новые цели.
  shuffleArray(targets);
  while (parts.length < targets.length) {
    parts.push({ x: random(width), y: random(height), vx: 0, vy: 0, tx: 0, ty: 0, h: random(-25, 25) });
  }
  parts.length = targets.length;
  parts.forEach((p, i) => { p.tx = targets[i].x; p.ty = targets[i].y; });
}

function shuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = floor(random(i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

function draw() {
  background(235, 25, 7);
  const m = pointer();
  strokeWeight(max(2, P.gap * 0.55));
  strokeCap(ROUND);

  for (const p of parts) {
    // Пружина к цели.
    p.vx += (p.tx - p.x) * P.spring;
    p.vy += (p.ty - p.y) * P.spring;
    // Отталкивание от курсора.
    const dx = p.x - m.x, dy = p.y - m.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < P.radius * P.radius && d2 > 1) {
      const d = sqrt(d2);
      const f = (1 - d / P.radius) * P.force * 4;
      p.vx += (dx / d) * f;
      p.vy += (dy / d) * f;
    }
    p.vx *= 0.82; p.vy *= 0.82;
    p.x += p.vx; p.y += p.vy;

    const speed = min(1, sqrt(p.vx * p.vx + p.vy * p.vy) / 8);
    stroke((P.hue + p.h + speed * 50 + 360) % 360, lerp(55, 90, speed), lerp(85, 100, speed));
    point(p.x, p.y);
  }
}
