// Задание 4. Рисунок в духе Джексона Поллока (техника дриппинга),
// сгенерированный на основе шума Перлина. Алгоритм в точности повторяет
// блок-схему flowchart.svg — номера блоков указаны в комментариях.

const N = 9;                // число "клякс" (потёков краски)
const K = 260;               // шагов на одну кляксу
const SPLATTER_PROB = 0.05;  // вероятность p добавить всплеск капель на шаге
const palette = [
  [15, 15, 15],       // чёрный
  [235, 232, 220],    // белый/кремовый
  [60, 55, 50],        // тёмно-серый
  [150, 110, 40],       // охра
];

function setup() {
  createCanvas(800, 800);       // блок 2: размер холста
  noLoop();
}

function draw() {
  background(228, 220, 200);    // фон-холст (небелёный лён)

  let i = 1;                    // блок 3: i := 1
  while (i <= N) {               // блок 4: i <= N ?
    drawDrip(i);                 // блоки 5-8: одна клякса целиком
    i = i + 1;                   // блок 9: i := i + 1
  }

  drawBackgroundSpeckles();      // блок 10: фоновые точечные брызги
}

function drawDrip(dripIndex) {
  // блок 5: случайная точка старта и цвет капли i
  let x = random(width * 0.15, width * 0.85);
  let y = random(height * 0.15, height * 0.85);
  const col = random(palette);
  const seed = dripIndex * 1000;

  let step = 1;                  // блок 6: step := 1
  while (step <= K) {            // блок 7: step <= K ?
    // блок 8: направление и толщина по шуму Перлина
    const angle = noise(seed + step * 0.04) * TWO_PI * 2;
    const speed = map(noise(seed + 500 + step * 0.02), 0, 1, 1.5, 5);
    const nx = x + cos(angle) * speed;
    const ny = y + sin(angle) * speed;

    const thickness = map(noise(seed + 1000 + step * 0.05), 0, 1, 0.8, 7);
    stroke(col[0], col[1], col[2], 230);
    strokeWeight(thickness);
    line(x, y, nx, ny);

    // блок 8: с вероятностью p — всплеск капель
    if (random(1) < SPLATTER_PROB) {
      drawSplatter(nx, ny, col);
    }

    x = nx;
    y = ny;
    step = step + 1;             // step++
  }
}

function drawSplatter(x, y, col) {
  noStroke();
  fill(col[0], col[1], col[2], 210);
  const count = floor(random(4, 12));
  for (let k = 0; k < count; k++) {
    const a = random(TWO_PI);
    const d = random(4, 40);
    const r = random(1, 4);
    circle(x + cos(a) * d, y + sin(a) * d, r);
  }
}

function drawBackgroundSpeckles() {
  noStroke();
  for (let k = 0; k < 500; k++) {
    const col = random(palette);
    fill(col[0], col[1], col[2], random(60, 160));
    circle(random(width), random(height), random(0.5, 2.2));
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') redraw();
  if (key === 's' || key === 'S') saveCanvas('lab2_task4_pollock', 'png');
}
