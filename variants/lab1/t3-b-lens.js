// Задание 3 · вариант B. «Типографская линза».
// Холст залит сеткой букв строки. Курсор работает как увеличительное стекло:
// рядом с ним буквы растут, выталкиваются из центра (эффект «рыбьего глаза»),
// закручиваются и меняют оттенок. Далеко от курсора — спокойный мелкий шрифт.

const P = params({
  phrase: { value: 'ГЕНЕРАТИВНЫЙ ДИЗАЙН ', label: 'Строка' },
  cell:   { value: 26,  min: 16, max: 48, step: 1,   label: 'Шаг сетки' },
  radius: { value: 190, min: 60, max: 420, step: 5,  label: 'Радиус линзы' },
  bulge:  { value: 2.6, min: 1,  max: 5,  step: 0.1, label: 'Увеличение' },
  push:   { value: 0.7, min: 0,  max: 1.5, step: 0.05, label: 'Выталкивание' },
  twist:  { value: 0.5, min: -2, max: 2,  step: 0.05, label: 'Закрутка' },
  hue:    { value: 195, min: 0,  max: 360, step: 1,  label: 'Оттенок' },
});

function setup() {
  createCanvas(900, 560);
  colorMode(HSB, 360, 100, 100, 100);
  textAlign(CENTER, CENTER);
  textFont('Arial');
  textStyle(BOLD);
  noStroke();
}

function draw() {
  background(230, 30, 8);
  const word = P.phrase.length ? P.phrase : ' ';
  const m = pointer();
  const cols = ceil(width / P.cell) + 1;
  const rows = ceil(height / P.cell) + 1;

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      let x = gx * P.cell + P.cell / 2;
      let y = gy * P.cell + P.cell / 2;
      const dx = x - m.x, dy = y - m.y;
      const d = sqrt(dx * dx + dy * dy);
      // k: 1 у курсора, 0 на краю линзы; smoothstep даёт мягкий край.
      const k0 = constrain(1 - d / P.radius, 0, 1);
      const k = k0 * k0 * (3 - 2 * k0);

      // Сдвиг от центра линзы и поворот вокруг него.
      if (d > 0.001) {
        x += (dx / d) * k * P.push * P.cell * 2.2;
        y += (dy / d) * k * P.push * P.cell * 2.2;
      }
      const ch = word[(gx + gy * cols) % word.length];
      const sz = P.cell * lerp(0.62, P.bulge * 0.62, k);
      const hue = (P.hue + k * 140 + gx * 0.8) % 360;

      push();
      translate(x, y);
      rotate(k * P.twist * PI);
      fill(hue, lerp(25, 85, k), lerp(55, 100, k), lerp(55, 100, k));
      textSize(sz);
      text(ch, 0, 0);
      pop();
    }
  }
}
