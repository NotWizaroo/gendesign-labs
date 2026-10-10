// Задание 3. Текстура "вода" на основе шума Перлина.
// Базовый слой — синий 3D-шум (глубина/волны). Поверх него — упрощённые
// "блики-каустики": там, где два слегка смещённых шумовых поля почти
// совпадают по значению, получается яркая тонкая линия (аналог отражений
// на дне бассейна).

let t = 0;

function setup() {
  createCanvas(500, 500);
  pixelDensity(1);
}

function draw() {
  loadPixels();
  const scale = 0.012;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const base = noise(x * scale, y * scale, t);

      const n1 = noise(x * scale * 2.2, y * scale * 2.2, t * 1.4);
      const n2 = noise(x * scale * 2.2 + 40, y * scale * 2.2 + 40, t * 1.4);
      const caustic = 1 - constrain(abs(n1 - n2) * 14, 0, 1);

      const depth = map(base, 0, 1, 0, 1);
      let r = lerp(5, 40, depth);
      let g = lerp(60, 140, depth);
      let b = lerp(120, 220, depth);

      const glow = pow(caustic, 6) * 180;
      r += glow;
      g += glow;
      b += glow * 0.9;

      const index = (x + y * width) * 4;
      pixels[index] = constrain(r, 0, 255);
      pixels[index + 1] = constrain(g, 0, 255);
      pixels[index + 2] = constrain(b, 0, 255);
      pixels[index + 3] = 255;
    }
  }
  updatePixels();

  t += 0.006;
}

function keyPressed() {
  if (key === 's' || key === 'S') saveCanvas('lab2_task3_water', 'png');
}
