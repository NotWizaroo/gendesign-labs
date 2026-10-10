// Задание 1 · вариант A. «Гомаж квадрату» (по мотивам Йозефа Альберса).
// Цветовой контраст из методички, но как наблюдение: центральный квадрат
// во всех трёх панелях — ОДИН И ТОТ ЖЕ цвет, а выглядит по-разному,
// потому что его окружают разные цвета. Это и есть одновременный контраст.

const P = params({
  rings:  { value: 4,  min: 2,  max: 8,   step: 1, label: 'Квадратов' },
  hue:    { value: 24, min: 0,  max: 360, step: 1, label: 'Оттенок центра' },
  spread: { value: 38, min: 0,  max: 120, step: 1, label: 'Разброс окружения' },
  sat:    { value: 72, min: 10, max: 100, step: 1, label: 'Насыщенность' },
  drift:  { value: true, label: 'Мышь двигает оттенок' },
});

function setup() {
  createCanvas(900, 560);
  colorMode(HSB, 360, 100, 100);
  noStroke();
  textFont('sans-serif');
}

function draw() {
  background(0, 0, 12);

  const m = pointer();
  const hue0 = P.drift ? (P.hue + map(m.x, 0, width, -50, 50) + 360) % 360 : P.hue;
  const size = 250;
  const gap = (width - size * 3) / 4;

  const center = color(hue0, P.sat, 82);

  for (let i = 0; i < 3; i++) {
    const x = gap + i * (size + gap);
    const y = 150;
    // Окружение смещается по кругу на -spread, 0, +spread — кроме центра.
    const dir = i - 1;

    for (let r = 0; r < P.rings; r++) {
      const t = r / (P.rings - 1);                 // 0 — внешний, 1 — центр
      const s = size * (1 - t * 0.72);             // квадраты вложены друг в друга
      const bottom = y + size;
      const sx = x + (size - s) / 2;
      const sy = bottom - s - size * 0.04 * r;     // «посадка» вниз, как у Альберса

      if (r === P.rings - 1) {
        fill(center);
      } else {
        const h = (hue0 + dir * P.spread * (1 - t) + 360) % 360;
        const b = lerp(38, 74, t) + dir * 8 * (1 - t);
        fill(h, P.sat * lerp(0.55, 0.9, t), constrain(b, 0, 100));
      }
      rect(sx, sy, s, s);
    }
  }

  fill(0, 0, 80);
  textAlign(CENTER, TOP);
  textSize(15);
  text('Центральный квадрат везде одного цвета ' + center.toString('#rrggbb').toUpperCase(), width / 2, 70);
  fill(0, 0, 55);
  textSize(12);
  text('сузь глаза или закрой окружение пальцем — разницы не останется', width / 2, 94);
}
