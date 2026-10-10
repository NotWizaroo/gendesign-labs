// Задание 4. Изображение + генеративный эффект.
// Полутоновый эффект (halftone): исходное фото сканируется по сетке,
// в каждой ячейке рисуется круг цвета пикселя, радиус зависит от яркости.
// Горизонтальное положение мыши управляет плотностью сетки.

let img;

function preload() {
  img = loadImage('data/sobor.jpg');
}

function setup() {
  createCanvas(600, 795);
  noStroke();
}

function draw() {
  background(15);

  const tileCount = floor(map(mouseX, 0, width, 12, 90));
  const step = width / tileCount;

  img.loadPixels();

  for (let gy = 0; gy < height; gy += step) {
    for (let gx = 0; gx < width; gx += step) {
      const ix = floor(map(gx, 0, width, 0, img.width));
      const iy = floor(map(gy, 0, height, 0, img.height));
      const c = img.get(ix, iy);
      const b = brightness(color(c));

      fill(c);
      const d = map(b, 0, 255, step * 0.15, step * 0.95);
      circle(gx + step / 2, gy + step / 2, d);
    }
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') saveCanvas('task4_halftone', 'png');
}
