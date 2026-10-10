// Задание 3. Текстура "древесина" (срез ствола с годовыми кольцами).
// Кольца — это расстояние от центра, пропущенное через sin(). Чтобы кольца не были
// идеальными окружностями, к расстоянию добавляется шум Перлина: края «плывут».
// Мелкий шум, вытянутый в одну сторону, даёт волокна.

function setup() {
  createCanvas(500, 500);
  pixelDensity(1);
  noLoop();
}

function draw() {
  loadPixels();
  const light = [222, 176, 112];
  const dark = [128, 78, 36];

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      // расстояние до центра, искажённое шумом
      let d = dist(x, y, width * 0.45, height * 0.55);
      d += noise(x * 0.008, y * 0.008) * 90;

      // кольца: волна от расстояния, плюс неровность толщины колец
      let ring = 0.5 + 0.5 * sin(d * 0.28 + noise(x * 0.02, y * 0.02) * 6);
      ring = pow(ring, 1.6);

      // волокна: шум, сильно растянутый по вертикали
      const grain = noise(x * 0.35, y * 0.02) * 0.25;
      const k = constrain(ring + grain - 0.1, 0, 1);

      const index = (x + y * width) * 4;
      pixels[index] = lerp(light[0], dark[0], k);
      pixels[index + 1] = lerp(light[1], dark[1], k);
      pixels[index + 2] = lerp(light[2], dark[2], k);
      pixels[index + 3] = 255;
    }
  }
  updatePixels();
}

function keyPressed() {
  if (key === 'n' || key === 'N') {
    noiseSeed(floor(random(1e6)));
    redraw();
  }
  if (key === 's' || key === 'S') saveCanvas('lab2_task3_wood', 'png');
}
