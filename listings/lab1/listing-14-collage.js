// Листинг 14 (РЕКОНСТРУКЦИЯ по тексту и рисунку 14 методички). Это не дословный код из PDF.
//
// Почему так: в PDF под листингом 14 лежит код сетки из кадров видео (см. «Листинг 14 · Кадры видео»),
// а текст и рисунок рядом описывают другое — коллаж: изображения делятся на несколько слоёв,
// каждый слой обрабатывается по-своему (свой размер, поворот, положение), первый слой рисуется
// первым и поэтому лежит на заднем плане.
//
// Вырезать картинки руками не нужно: «вырезку» делает код. Берём случайный кусок картинки
// и обрезаем его выбранной формой (многоугольник / овал / прямоугольник) через clip().
// Исключение — слой «вырезки»: там уже готовые PNG с прозрачным фоном, они кладутся целиком.
//
// Управление: клик — новый коллаж · M — форма вырезки · 1–4 — показать/скрыть слой · S — сохранить PNG

// Картинки лежат в listings/lab1/data/collage/. Свои файлы кладёшь туда и дописываешь имя в нужную группу.
const SOURCES = {
  photos:  ['p-sobor.jpg', 'p-wall.jpg', 'p-portrait.jpg'],
  illustr: ['i-01.jpg', 'i-02.jpg', 'i-03.jpg', 'i-04.jpg', 'i-05.jpg', 'i-06.jpg',
            'i-07.jpg', 'i-08.jpg', 'i-09.jpg', 'i-10.jpg', 'i-11.jpg', 'i-12.jpg'],
  cutouts: ['c-01.png', 'c-02.png', 'c-03.png', 'c-04.png', 'c-05.png', 'c-06.png', 'c-07.png', 'c-08.png'],
};

// Слои — как в методичке: чем раньше слой в списке, тем глубже он лежит.
// from — из каких групп брать картинки, count — сколько кусков, size — размер, rot — максимальный поворот (радианы).
const LAYERS = [
  { name: 'фон',     from: ['photos'],            count: 4,  size: [380, 640], rot: 0.12, tint: 0.35 },
  { name: 'средний', from: ['photos', 'illustr'], count: 10, size: [150, 320], rot: 0.9,  tint: 0.45 },
  { name: 'акценты', from: ['illustr', 'photos'], count: 14, size: [70, 190],  rot: 3.14, tint: 0.6 },
  { name: 'вырезки', from: ['cutouts'],           count: 6,  size: [110, 240], rot: 0.5,  cutout: true },
];
const PALETTE = ['#e07a5f', '#3d5a80', '#f2cc8f', '#81b29a', '#6d597a'];
const PAPER = '#efe9dc';
const MASKS = ['многоугольник', 'овал', 'прямоугольник'];

const imgs = {};                // группа -> массив загруженных картинок
let seed = 14;
let maskMode = 0;
const visible = LAYERS.map(() => true);

function preload() {
  for (const group in SOURCES) {
    imgs[group] = SOURCES[group].map((name) => loadImage('data/collage/' + name));
  }
}

function setup() {
  createCanvas(900, 680);
  noLoop();                     // коллаж статичный: перерисовываем только по событиям
  textFont('Arial');
}

function draw() {
  randomSeed(seed);             // один и тот же seed — один и тот же коллаж
  background(PAPER);

  LAYERS.forEach((layer, li) => {
    const pool = layer.from.flatMap((group) => imgs[group]);   // все картинки, доступные слою
    for (let i = 0; i < layer.count; i++) {
      const w = random(layer.size[0], layer.size[1]);
      // random() вызываем всегда, даже когда слой скрыт: иначе при переключении слоёв поменялся бы весь коллаж
      fragment(random(pool), random(width), random(height), w, w * random(0.7, 1.4),
               random(-layer.rot, layer.rot), layer, visible[li]);
    }
  });

  legend();
}

// Один фрагмент: кусок картинки, обрезанный формой, с цветной подкладкой.
function fragment(src, x, y, w, h, angle, layer, show) {
  // какой кусок исходной картинки взять
  const cw = random(0.25, 0.7) * src.width;
  const ch = min(src.height, cw * h / w);
  const sx = random(0, max(1, src.width - cw));
  const sy = random(0, max(1, src.height - ch));
  const color = random(PALETTE);
  const pts = polygon(w, h);    // вершины многоугольника (нужны всегда, чтобы не сбить random)

  if (!show) return;

  push();
  translate(x, y);
  rotate(angle);
  const ctx = drawingContext;

  if (layer.cutout) {
    // готовая вырезка с прозрачным фоном: кладём целиком, с мягкой тенью
    const ch2 = w * src.height / src.width;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 6;
    image(src, -w / 2, -ch2 / 2, w, ch2);
    ctx.restore();
    pop();
    return;
  }

  ctx.save();
  trace(ctx, pts, w, h);        // контур вырезки
  ctx.clip();                   // всё, что рисуем дальше, видно только внутри контура

  image(src, -w / 2, -h / 2, w, h, sx, sy, cw, ch);

  ctx.globalCompositeOperation = 'multiply';   // цветная подкладка: оттенок поверх картинки
  ctx.globalAlpha = layer.tint;
  ctx.fillStyle = color;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.restore();

  // тонкая светлая кромка, как у вырезанной бумаги
  ctx.save();
  trace(ctx, pts, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
  pop();
}

// Неровный многоугольник: углы по кругу с небольшим разбросом и разным радиусом.
function polygon(w, h) {
  const n = floor(random(3, 8));
  const pts = [];
  for (let k = 0; k < n; k++) {
    const a = TWO_PI * k / n + random(-0.35, 0.35);
    const r = random(0.55, 1);
    pts.push([cos(a) * w / 2 * r, sin(a) * h / 2 * r]);
  }
  return pts;
}

function trace(ctx, pts, w, h) {
  ctx.beginPath();
  if (MASKS[maskMode] === 'овал') {
    ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, TWO_PI);
  } else if (MASKS[maskMode] === 'прямоугольник') {
    ctx.rect(-w / 2, -h / 2, w, h);
  } else {
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.closePath();
  }
}

// Подсказка управления прямо на холсте.
function legend() {
  noStroke();
  fill(0, 150);
  rect(0, height - 28, width, 28);
  fill(255);
  textSize(13);
  textAlign(LEFT, CENTER);
  const layers = LAYERS.map((l, i) => `${i + 1} ${l.name}${visible[i] ? '' : ' (скрыт)'}`).join(' · ');
  text(`клик — новый коллаж · M — форма: ${MASKS[maskMode]} · слои: ${layers} · S — PNG`, 12, height - 14);
}

function mousePressed() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;
  seed = floor(Math.random() * 1e6);
  redraw();
}

function keyPressed() {
  if (key === 'm' || key === 'M') maskMode = (maskMode + 1) % MASKS.length;
  const n = int(key);
  if (n >= 1 && n <= LAYERS.length) visible[n - 1] = !visible[n - 1];
  if (key === 's' || key === 'S') saveCanvas(gd.timestamp(), 'png');
  redraw();
}
