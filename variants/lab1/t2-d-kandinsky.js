// Задание 2 · вариант D. «Кандинский».
// Идея в духе «Композиции VIII»: на светлом фоне несколько крупных форм (круг, треугольник, прямоугольник),
// через всю картину проходят тонкие линии-«лучи», вокруг рассыпаны мелкие круги и дуги.
// Код простой: у каждого вида фигур есть своя маленькая функция, а draw() только вызывает их по порядку.

const P = params({
  big:    { value: 3, min: 1, max: 6,  step: 1, label: 'Крупных фигур' },
  lines:  { value: 7, min: 0, max: 20, step: 1, label: 'Линий' },
  dots:   { value: 16, min: 0, max: 50, step: 1, label: 'Мелких кружков' },
  fresh:  { button: 'Новая композиция', fn: () => { seed = floor(random(1e6)); } },
});

const PAPER = '#f1e9d6';
const COLORS = ['#d8452f', '#e9b441', '#2a4d9b', '#1a1a1d', '#7fb59a', '#e7a5b3'];
let seed = 1912;

function setup() {
  createCanvas(720, 720);
  noLoop();      // картина статичная: перерисовываем только при смене параметра или кнопке
}

function draw() {
  background(PAPER);
  randomSeed(seed);   // тот же seed — та же композиция

  // порядок рисования = порядок слоёв: сначала крупное, потом линии, сверху мелочь
  for (let i = 0; i < P.big; i++) bigShape();
  for (let i = 0; i < P.lines; i++) ray();
  for (let i = 0; i < P.dots; i++) dot();
  checker(random(60, width - 200), random(60, height - 200), 4);
}

// Одна крупная фигура: круг, треугольник или повёрнутый прямоугольник.
function bigShape() {
  const x = random(width);
  const y = random(height);
  const s = random(130, 300);
  const kind = floor(random(3));

  noStroke();
  fill(random(COLORS));
  push();
  translate(x, y);
  rotate(random(-0.6, 0.6));
  if (kind === 0) circle(0, 0, s);
  if (kind === 1) triangle(-s / 2, s / 2, s / 2, s / 2, 0, -s / 2);
  if (kind === 2) rect(-s / 2, -s / 3, s, s * 0.66);
  pop();

  // тонкий контур-«эхо» чуть в стороне, как у Кандинского
  noFill();
  stroke(COLORS[3]);
  strokeWeight(1.5);
  if (kind === 0) circle(x + 14, y + 10, s);
}

// Тонкая чёрная линия: из случайной точки в случайную, иногда с кружком на конце.
function ray() {
  const x1 = random(width), y1 = random(height);
  const x2 = random(width), y2 = random(height);
  stroke(COLORS[3]);
  strokeWeight(random(1, 3));
  line(x1, y1, x2, y2);
  if (random() < 0.5) {
    noStroke();
    fill(random(COLORS));
    circle(x2, y2, random(10, 22));
  }
}

// Маленький кружок или дуга, чтобы композиция не была пустой по краям.
function dot() {
  const x = random(width), y = random(height);
  const d = random(8, 28);
  if (random() < 0.7) {
    noStroke();
    fill(random(COLORS));
    circle(x, y, d);
  } else {
    noFill();
    stroke(COLORS[3]);
    strokeWeight(2);
    arc(x, y, d * 2, d * 2, 0, PI);   // полукруг
  }
}

// Мини-шахматка n×n: «ритм» среди свободных форм.
function checker(x, y, n) {
  const s = 18;
  noStroke();
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      fill((i + j) % 2 ? COLORS[3] : PAPER);
      rect(x + i * s, y + j * s, s, s);
    }
  }
}
