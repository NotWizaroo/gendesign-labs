// Задание 1. Базовый пример генерации шума Перлина в p5.js.
// Двумерное шумовое поле (каждый пиксель — яркость от noise(x, y, t)),
// плюс "блуждающая" точка, чьи x/y координаты берутся из независимых
// участков шумового пространства (классический приём с Walker).

let t = 0;

function setup() {
  createCanvas(640, 480);
  noStroke();
}

function draw() {
  loadPixels();
  const scale = 0.01;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const bright = map(noise(x * scale, y * scale, t), 0, 1, 0, 255);
      const index = (x + y * width) * 4;
      pixels[index] = bright;
      pixels[index + 1] = bright;
      pixels[index + 2] = bright;
      pixels[index + 3] = 255;
    }
  }
  updatePixels();

  // Блуждающая точка: x и y берутся из разных участков шумового
  // пространства (смещение по третьему аргументу noise), чтобы
  // движение по осям было независимым, а не строго по диагонали.
  const wx = map(noise(1000, 1000, t * 3), 0, 1, 40, width - 40);
  const wy = map(noise(2000, 2000, t * 3), 0, 1, 40, height - 40);
  fill(20, 140, 255);
  circle(wx, wy, 26);

  t += 0.006;
}

function keyPressed() {
  if (key === 's' || key === 'S') saveCanvas('lab2_task1_noise', 'png');
}
