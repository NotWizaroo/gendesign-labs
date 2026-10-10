// Задание 2 · вариант B. «Золотое сечение».
// Прямоугольник делится рекурсивно: от него отрезается квадрат, остаток
// снова делится в пропорции φ ≈ 1.618. В каждом квадрате — четверть круга,
// вместе они складываются в логарифмическую спираль. Цвет идёт по спирали
// от холодного к тёплому — гармоничный градиент по оттенку.

const P = params({
  depth: { value: 11, min: 3, max: 16, step: 1, label: 'Глубина' },
  hue0:  { value: 205, min: 0, max: 360, step: 1, label: 'Начальный оттенок' },
  hue1:  { value: 20,  min: 0, max: 360, step: 1, label: 'Конечный оттенок' },
  arcs:  { value: true, label: 'Четверти круга' },
  lines: { value: true, label: 'Линии сечения' },
});

const PHI = (1 + Math.sqrt(5)) / 2;

function setup() {
  createCanvas(900, 556);          // 900 / 556 ≈ φ
  colorMode(HSB, 360, 100, 100);
  noLoop();
}

function draw() {
  background(230, 20, 9);
  strokeJoin(ROUND);

  let x = 20, y = 20, w = width - 40, h = w / PHI;
  y = (height - h) / 2;

  // dir — в какую сторону от остатка отрезается квадрат: 0 слева, 1 сверху, 2 справа, 3 снизу.
  let dir = 0;
  for (let i = 0; i < P.depth; i++) {
    const t = i / (P.depth - 1);
    const hue = lerp(P.hue0, P.hue1, t);
    const s = (dir % 2 === 0) ? h : w;     // сторона отрезаемого квадрата
    let qx, qy;

    if (dir === 0) { qx = x; qy = y; x += s; w -= s; }
    else if (dir === 1) { qx = x; qy = y; y += s; h -= s; }
    else if (dir === 2) { qx = x + w - s; qy = y; w -= s; }
    else { qx = x; qy = y + h - s; h -= s; }

    noStroke();
    fill(hue, 62, lerp(55, 96, t));
    rect(qx, qy, s, s);

    if (P.arcs) {
      // центр дуги — угол квадрата, ближайший к «следующему» шагу спирали
      const corners = [
        [qx + s, qy + s, PI, PI * 1.5],       // слева: центр справа-снизу
        [qx, qy + s, PI * 1.5, TWO_PI],       // сверху: центр слева-снизу
        [qx, qy, 0, HALF_PI],                 // справа: центр слева-сверху
        [qx + s, qy, HALF_PI, PI],            // снизу: центр справа-сверху
      ][dir];
      noFill();
      stroke(0, 0, 100, 88);
      strokeWeight(map(i, 0, P.depth, 3, 1));
      arc(corners[0], corners[1], s * 2, s * 2, corners[2], corners[3]);
    }

    if (P.lines) {
      noFill();
      stroke(230, 20, 9, 70);
      strokeWeight(1);
      rect(qx, qy, s, s);
    }
    dir = (dir + 1) % 4;
  }
}
