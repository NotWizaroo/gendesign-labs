// Задание 4. Рисунок в духе Джексона Поллока («Серый №14», дриппинг).
// Каждая «струя краски» — длинная траектория: направление меняется ПЛАВНО
// (поворот на каждом шаге берётся из шума Перлина), поэтому получаются большие дуги,
// а не мелкие закорючки. Скорость руки тоже из шума: где рука «медлит», линия толще
// и иногда остаётся густая лужа. Вдоль линии летят брызги, по холсту — мелкая россыпь.
// Клавиша R — нарисовать заново, S — сохранить PNG.

const N = 85;                  // число струй краски
const K = 520;                 // максимум шагов одной струи
const SPLATTER_PROB = 0.02;    // вероятность брызг на шаге
const BLOB_PROB = 0.007;       // вероятность густой лужи на шаге
const BLACK = [15, 15, 15];
const GRAY = [60, 55, 50];
const WHITE = [235, 232, 220];
const OCHRE = [150, 110, 40];
// повторы задают «вес» цвета: случайный выбор из массива чаще попадает в чёрный
const palette = [BLACK, BLACK, BLACK, BLACK, BLACK, BLACK, GRAY, GRAY, GRAY, WHITE, WHITE, OCHRE];

function setup() {
  createCanvas(900, 650);
  noLoop();
}

function draw() {
  background(228, 220, 200);
  noiseSeed(floor(random(1e6)));   // у каждой перерисовки свой шум, а значит, свой рисунок

  let i = 1;
  while (i <= N) {
    drawDrip(i);
    i = i + 1;
  }

  drawBackgroundSpeckles();
}

// Одна струя: идём шагами, поворачивая по шуму, и рисуем отрезки.
function drawDrip(dripIndex) {
  let x = random(width * 0.05, width * 0.95);
  let y = random(height * 0.05, height * 0.95);
  let angle = random(TWO_PI);
  const col = random(palette);
  const seed = dripIndex * 1000;

  let step = 1;
  while (step <= K) {
    // поворот = плавный крупный изгиб (медленный шум) + быстрая «дрожь руки» (быстрый шум)
    angle += (noise(seed + step * 0.012) - 0.5) * 0.24
           + (noise(seed + 300 + step * 0.06) - 0.5) * 0.16;
    const speed = map(noise(seed + 500 + step * 0.02), 0, 1, 1.2, 7.5);
    const nx = x + cos(angle) * speed;
    const ny = y + sin(angle) * speed;

    // медленнее рука — толще линия; отдельный шум добавляет «нажим»
    const thickness = map(speed, 1.2, 7.5, 8, 0.8) * map(noise(seed + 900 + step * 0.03), 0, 1, 0.6, 1.4);
    stroke(col[0], col[1], col[2], 235);
    strokeWeight(thickness);
    line(x, y, nx, ny);

    if (random(1) < SPLATTER_PROB) drawSplatter(nx, ny, col);
    if (random(1) < BLOB_PROB) drawBlob(nx, ny, col);

    x = nx;
    y = ny;
    if (x < -40 || x > width + 40 || y < -40 || y > height + 40) break;  // ушли за холст
    step = step + 1;
  }
}

// Россыпь капель вокруг точки.
function drawSplatter(x, y, col) {
  noStroke();
  fill(col[0], col[1], col[2], 220);
  const count = floor(random(4, 12));
  for (let k = 0; k < count; k++) {
    const a = random(TWO_PI);
    const d = random(4, 55);
    circle(x + cos(a) * d, y + sin(a) * d, random(1, 4.5));
  }
}

// Густая лужа: несколько перекрывающихся кругов, как упавшая «клякса».
function drawBlob(x, y, col) {
  noStroke();
  fill(col[0], col[1], col[2], 240);
  const count = floor(random(4, 9));
  for (let k = 0; k < count; k++) {
    circle(x + random(-9, 9), y + random(-9, 9), random(6, 20));
  }
  // короткий потёк вниз от лужи
  const len = floor(random(2, 7));
  for (let k = 1; k <= len; k++) circle(x + random(-2, 2), y + 10 + k * 5, random(2, 5));
}

// Мелкие брызги по всему холсту.
function drawBackgroundSpeckles() {
  noStroke();
  for (let k = 0; k < 900; k++) {
    const col = random(palette);
    fill(col[0], col[1], col[2], random(60, 170));
    circle(random(width), random(height), random(0.5, 2.4));
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') redraw();
  if (key === 's' || key === 'S') saveCanvas('lab2_task4_pollock', 'png');
}
