// Задание 3. Текстура "облака" на основе шума Перлина.
// noiseDetail(октавы, затухание) складывает несколько слоёв шума: крупные формы
// облака и мелкие «завитки» по краям. Значение шума выше порога становится
// белым облаком, ниже — голубым небом. Третий аргумент noise() (время) медленно
// меняет форму, а сдвиг по X тянет облака по небу.

let t = 0;

function setup() {
  createCanvas(500, 500);
  pixelDensity(1);
  noiseDetail(6, 0.5);
}

function draw() {
  loadPixels();
  const scale = 0.006;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const n = noise(x * scale + t * 2, y * scale, t);

      // плотность облака: всё, что ниже 0.42, — чистое небо
      const cloud = constrain(map(n, 0.42, 0.72, 0, 1), 0, 1);

      // небо темнее вверху и светлее у горизонта
      const sky = map(y, 0, height, 0, 1);
      const r = lerp(lerp(40, 120, sky), 255, cloud);
      const g = lerp(lerp(110, 180, sky), 255, cloud);
      const b = lerp(lerp(200, 235, sky), 255, cloud);

      const index = (x + y * width) * 4;
      pixels[index] = r;
      pixels[index + 1] = g;
      pixels[index + 2] = b;
      pixels[index + 3] = 255;
    }
  }
  updatePixels();

  t += 0.002;
}

function keyPressed() {
  if (key === 's' || key === 'S') saveCanvas('lab2_task3_clouds', 'png');
}
