// Реконструкция по гифке @M_Pierini (#p5js, пост от 24.09.2026). Это не код автора: исходника у меня нет,
// я восстановил картинку по кадру. Как именно двигается гифка, я не видел, анимация придумана мной.
//
// Что на кадре: сетка 7×7 плиток Трюше. В каждой плитке две четверти круга светлого цвета
// на тёмном фоне, плитка повёрнута на 0/90/180/270°. Узор зеркально симметричен.
// Ближе к краю сетки светлые формы разъезжаются по каналам R, G, B (хроматическая аберрация).
// В правом нижнем углу три квадрата синий/зелёный/красный.

const P = params({
  speed:  { value: 0.5, min: 0,  max: 3,  step: 0.05, label: 'Скорость' },
  aberr:  { value: 4,   min: 0,  max: 16, step: 0.5,  label: 'Аберрация, px' },
  wave:   { value: 0.6, min: 0,  max: 2,  step: 0.05, label: 'Задержка от центра' },
  mirror: { value: true, label: 'Зеркальная симметрия' },
  again:  { button: 'Новый узор', fn: () => { seed = floor(random(1e6)); } },
});

const N = 7;                       // клеток по стороне
const CELL = 62;
const PAD = 44;
const INK = '#0b0f1a';
const PAPER = [244, 240, 230];     // кремовый
let seed = 24;

function setup() {
  createCanvas(N * CELL + PAD * 2, N * CELL + PAD * 2);
  noStroke();
}

// Псевдослучайное число для клетки: один seed — один узор.
function hash(i, j) {
  const s = Math.sin(i * 127.1 + j * 311.7 + seed * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

function draw() {
  const ctx = drawingContext;
  const t = millis() / 1000 * P.speed;
  background(PAPER[0], PAPER[1], PAPER[2]);

  // Рамка и тёмное поле под плитками
  fill(INK);
  rect(PAD, PAD, N * CELL, N * CELL);

  const c = (N - 1) / 2;
  const far = dist(0, 0, c, c);

  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      // зеркало: берём клетку из одной четверти
      const mi = P.mirror ? min(i, N - 1 - i) : i;
      const mj = P.mirror ? min(j, N - 1 - j) : j;
      const d = dist(i, j, c, c);
      // тип плитки сдвигается волной от центра к краям
      const step = floor(t - d * P.wave);
      const type = (floor(hash(mi, mj) * 4) + step + 400) % 4;
      // в зеркальной половине поворот зеркалится
      const flip = P.mirror && (i > c) !== (j > c);
      const rot = flip ? (4 - type) % 4 : type;
      // у половины плиток фон светлый, а круги тёмные: так соседние круги сливаются в большие завитки
      const inv = hash(mi + 9, mj + 5) > 0.5;

      const k = pow(d / far, 2) * P.aberr;                 // сильнее к краям
      const ph = (t - d * P.wave) % 1;                     // сразу после поворота — всплеск
      const kick = ph < 0.25 ? (1 - ph / 0.25) * 0.8 : 0;
      const off = k * (1 + kick);

      ctx.save();
      ctx.beginPath();
      ctx.rect(PAD + i * CELL, PAD + j * CELL, CELL, CELL);
      ctx.clip();
      ctx.globalCompositeOperation = 'lighter';
      // три канала светлой формы с разным сдвигом
      [[0, -1, 0.7], [1, 0, 0], [2, 1, -0.7]].forEach(([ch, sx, sy]) => {
        const rgb = [0, 0, 0];
        rgb[ch] = PAPER[ch];
        ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
        petals(PAD + i * CELL + sx * off, PAD + j * CELL + sy * off, rot, inv);
      });
      ctx.restore();
    }
  }

  // тонкая сетка
  stroke(120, 120, 130, 140);
  strokeWeight(0.6);
  noFill();
  for (let k = 0; k <= N; k++) {
    line(PAD + k * CELL, PAD, PAD + k * CELL, PAD + N * CELL);
    line(PAD, PAD + k * CELL, PAD + N * CELL, PAD + k * CELL);
  }
  noStroke();

  // подпись-квадраты каналов
  const s = 17, x0 = width - PAD / 2 - 3 * s, y0 = height - s - 6;
  fill(0, 0, 255); rect(x0, y0, s, s);
  fill(0, 255, 0); rect(x0 + s, y0, s, s);
  fill(255, 0, 0); rect(x0 + 2 * s, y0, s, s);
}

// Две четверти круга радиусом в полклетки в противоположных углах плитки.
// inv = false: светлые круги на тёмном; inv = true: тёмные круги на светлом (дырки в светлой плитке).
function petals(x, y, rot, inv) {
  const ctx = drawingContext;
  const r = CELL / 2;
  ctx.save();
  ctx.translate(x + r, y + r);
  ctx.rotate(rot * HALF_PI);
  ctx.translate(-r, -r);
  ctx.beginPath();
  if (inv) ctx.rect(0, 0, CELL, CELL);
  [[0, 0, 0], [CELL, CELL, PI]].forEach(([cx, cy, a0]) => {
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, a0, a0 + HALF_PI);
    ctx.closePath();
  });
  ctx.fill(inv ? 'evenodd' : 'nonzero');
  ctx.restore();
}
