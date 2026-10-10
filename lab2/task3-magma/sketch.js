// Задание 3. Текстура "магма/лава" на основе шума Перлина.
// Трёхмерный шум (третий аргумент — время) даёт медленно "текущее" поле.
// Яркость шума отображается в тёплую цветовую шкалу: чёрный → тёмно-красный
// → оранжевый → жёлтый, как остывающая/раскалённая лава.

let t = 0;

function setup() {
  createCanvas(500, 500);
  pixelDensity(1);
  colorMode(RGB, 255);
}

function lavaColor(v) {
  // v в диапазоне [0, 1] -> тёплый градиент по трём отрезкам.
  if (v < 0.5) {
    const k = map(v, 0, 0.5, 0, 1);
    return [lerp(10, 160, k), lerp(0, 20, k), 0];
  } else if (v < 0.8) {
    const k = map(v, 0.5, 0.8, 0, 1);
    return [lerp(160, 255, k), lerp(20, 110, k), 0];
  } else {
    const k = map(v, 0.8, 1, 0, 1);
    return [255, lerp(110, 230, k), lerp(0, 90, k)];
  }
}

function draw() {
  loadPixels();
  const scale = 0.015;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const n = noise(x * scale, y * scale, t);
      const [r, g, b] = lavaColor(n);
      const index = (x + y * width) * 4;
      pixels[index] = r;
      pixels[index + 1] = g;
      pixels[index + 2] = b;
      pixels[index + 3] = 255;
    }
  }
  updatePixels();

  t += 0.004;
}

function keyPressed() {
  if (key === 's' || key === 'S') saveCanvas('lab2_task3_magma', 'png');
}
