// Задание 2 · вариант C. «Слои гор».
// Только простые фигуры — круги и треугольники, но из них складывается
// пейзаж: солнце, дымка и несколько горных гряд. Чем дальше гряда, тем она
// светлее и холоднее (воздушная перспектива) — приём из живописи,
// показывающий глубину без единой тени.

const P = params({
  layers: { value: 6, min: 2, max: 9, step: 1, label: 'Слоёв' },
  hue:    { value: 262, min: 0, max: 360, step: 1, label: 'Оттенок неба' },
  warm:   { value: 18, min: 0, max: 360, step: 1, label: 'Оттенок солнца' },
  size:   { value: 120, min: 40, max: 220, step: 1, label: 'Размер гор' },
  sun:    { value: 0.34, min: 0, max: 1, step: 0.01, label: 'Высота солнца' },
  fresh:  { button: 'Новый пейзаж', fn: () => { seed = floor(random(1e6)); } },
});

let seed = 77;

function setup() {
  createCanvas(900, 560);
  colorMode(HSB, 360, 100, 100);
  noLoop();
  noStroke();
}

function draw() {
  randomSeed(seed);

  // Небо: вертикальный градиент из полос.
  const warmTop = (P.warm + 20) % 360;
  for (let y = 0; y < height; y += 4) {
    const t = y / height;
    fill(lerp(P.hue, warmTop, pow(t, 1.6)), lerp(55, 38, t), lerp(26, 98, pow(t, 1.4)));
    rect(0, y, width, 4);
  }

  // Солнце и ореол из полупрозрачных кругов.
  const sx = width * random(0.3, 0.7);
  const sy = height * (0.15 + P.sun * 0.5);
  for (let i = 9; i > 0; i--) {
    fill(P.warm, 40, 100, 5 + (9 - i) * 1.6);
    circle(sx, sy, 90 + i * 46);
  }
  fill(P.warm - 6, 30, 100);
  circle(sx, sy, 92);

  // Гряды: от дальней к ближней.
  for (let l = 0; l < P.layers; l++) {
    const t = l / (P.layers - 1);                   // 0 — дальняя, 1 — ближняя
    const baseY = lerp(height * 0.52, height * 0.96, t);
    const peak = P.size * lerp(0.7, 1.6, t);
    const hue = lerp(P.hue + 10, P.hue - 20, t);
    fill(hue, lerp(22, 62, t), lerp(88, 18, pow(t, 0.8)));

    let x = -peak;
    while (x < width + peak) {
      const w = random(peak * 0.9, peak * 1.9);
      const h = random(peak * 0.5, peak);
      triangle(x, baseY, x + w / 2, baseY - h, x + w, baseY);
      x += w * random(0.45, 0.7);                   // треугольники перекрывают друг друга
    }
    rect(0, baseY - 1, width, height - baseY + 1);  // подошва, чтобы не было просветов
  }
}
