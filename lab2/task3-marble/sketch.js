// Задание 3. Текстура "мрамор" на основе шума Перлина.
// Классический приём: берём турбулентность (сумма нескольких октав шума
// с уменьшающейся амплитудой) и подмешиваем её внутрь sin(), формируя
// извилистые прожилки вместо простых волн.

function turbulence(x, y, size) {
  let value = 0;
  let initialSize = size;
  while (size >= 8) {
    value += noise(x / size, y / size) * size;
    size /= 2;
  }
  return value / initialSize;
}

function setup() {
  createCanvas(500, 500);
  noLoop();
  pixelDensity(1);
}

function draw() {
  loadPixels();

  const xPeriod = 3;
  const yPeriod = 6;
  const turbPower = 1.6;
  const turbSize = 48;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const xyValue =
        (x * xPeriod) / width +
        (y * yPeriod) / height +
        turbPower * turbulence(x, y, turbSize);

      const s = sin(xyValue * PI);
      // Смягчаем контраст (s^3 держит крайние значения дольше около 0,
      // из-за чего веерных полос меньше, а плавных переходов больше).
      const softened = Math.sign(s) * pow(abs(s), 0.6);
      const bright = map(softened, -1, 1, 60, 250);

      // Тёплый мраморный оттенок: от тёплого светлого к серо-графитовому.
      const index = (x + y * width) * 4;
      pixels[index] = bright;
      pixels[index + 1] = bright * 0.97;
      pixels[index + 2] = bright * 0.9;
      pixels[index + 3] = 255;
    }
  }
  updatePixels();
}

function keyPressed() {
  if (key === 's' || key === 'S') saveCanvas('lab2_task3_marble', 'png');
}
