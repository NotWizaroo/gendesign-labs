// Задание 2. Простая статичная композиция из фигур.
// Модульная сетка кругов и треугольников, гармоничная HSB-палитра
// (аналоговая гамма + один акцентный комплементарный цвет).

const cols = 8;
const rows = 6;
let cellSize;

function setup() {
  createCanvas(800, 600);
  colorMode(HSB, 360, 100, 100);
  noStroke();
  noLoop();
  cellSize = width / cols;
}

function draw() {
  background(230, 15, 12);

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const cx = gx * cellSize + cellSize / 2;
      const cy = gy * cellSize + cellSize / 2;

      const onDiagonal = (gx + gy) % 5 === 0;
      const hue = onDiagonal ? 28 : 205 + (gx * 6) % 45;
      const sat = onDiagonal ? 70 : 55;
      const bri = onDiagonal ? 95 : 70 + (gy * 4) % 20;

      fill(hue, sat, bri);

      const distFromCenter = dist(gx, gy, cols / 2, rows / 2);
      const size = map(distFromCenter, 0, 6, cellSize * 0.85, cellSize * 0.45);

      if ((gx + gy) % 2 === 0) {
        circle(cx, cy, size);
      } else {
        triangle(
          cx, cy - size / 2,
          cx - size / 2, cy + size / 2,
          cx + size / 2, cy + size / 2
        );
      }
    }
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') saveCanvas('task2_composition', 'png');
}
