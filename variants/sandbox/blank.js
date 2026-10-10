// Заготовка для экспериментов. Скопируй файл, переименуй, добавь запись в
// studio/manifest.json — и скетч появится в студии со своими ползунками.
//
// Что даёт студия скетчу:
//   params({...})  — объявляет ползунки; возвращает живой объект со значениями
//   asset('x.jpg') — путь к файлу из assets/
//   pointer()      — мышь в координатах холста; пока мышь не двигали — «автопилот»
//   onParam(key)   — (необязательно) вызывается при изменении ползунка
//
// Если скетч остановлен через noLoop(), он сам перерисуется при смене ползунка.

const P = params({
  count: { value: 24,  min: 3, max: 80, step: 1,    label: 'Кругов' },
  size:  { value: 36,  min: 4, max: 120, step: 1,   label: 'Размер' },
  hue:   { value: 210, min: 0, max: 360, step: 1,   label: 'Оттенок' },
  wave:  { value: 0.8, min: 0, max: 3,   step: 0.05, label: 'Волна' },
  tint:  { value: '#ffcc66', label: 'Цвет акцента' },
  fresh: { button: 'Перемешать', fn: () => { seed = floor(random(1e6)); } },
});

let seed = 1;

function setup() {
  createCanvas(800, 600);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
}

function draw() {
  background(230, 25, 8);
  randomSeed(seed);
  const m = pointer();
  const t = millis() / 1000;

  for (let i = 0; i < P.count; i++) {
    const x = random(width);
    const y = random(height) + sin(t * P.wave + i) * 30;
    const d = dist(x, y, m.x, m.y);
    const s = P.size * map(d, 0, 400, 1.6, 0.4, true);
    fill((P.hue + i * 4) % 360, 70, 95, 80);
    circle(x, y, s);
  }

  fill(P.tint);
  circle(m.x, m.y, 14);
}
