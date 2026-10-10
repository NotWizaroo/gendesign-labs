// Задание 4 · вариант A. «Фото из букв».
// Фото уменьшается до сетки (одна клетка — один пиксель), яркость клетки
// выбирает символ: в режиме «Градации» — от точки до «@», в режиме «Буквы слова»
// — буквы слова, чей размер растёт с яркостью. Курсор — линза, сквозь неё
// видно настоящее фото. Результат рисуется в отдельный буфер только при смене
// параметров, поэтому линза двигается плавно.

const P = params({
  mode:   { value: 'ramp', label: 'Режим', options: { 'Градации символов': 'ramp', 'Буквы слова': 'word' } },
  word:   { value: 'СОБОР', label: 'Слово' },
  cell:   { value: 9,   min: 5, max: 20, step: 1, label: 'Размер клетки' },
  color:  { value: true,  label: 'Цвет фото' },
  invert: { value: false, label: 'Светлый фон' },
  gamma:  { value: 0.55, min: 0.25, max: 1.2, step: 0.01, label: 'Подсветка теней' },
  lens:   { value: 110, min: 0, max: 300, step: 5, label: 'Линза (радиус)' },
});

const RAMP = ' .:-=+*#%@';
let img, fx;
let dirty = true;

function preload() {
  img = loadImage(asset('sobor.jpg'));
}

function setup() {
  createCanvas(600, 797);
  pixelDensity(1);
  fx = createGraphics(width, height);
  fx.pixelDensity(1);
}

function onParam(key) { if (key !== 'lens') dirty = true; }

function render() {
  const cols = ceil(width / P.cell);
  const rows = ceil(height / P.cell);
  const s = img.get();
  s.resize(cols, rows);
  s.loadPixels();

  fx.background(P.invert ? 244 : 10);
  fx.noStroke();
  fx.textAlign(CENTER, CENTER);
  fx.textFont('Courier New');
  fx.textStyle(BOLD);
  const word = (P.word || '•').toUpperCase();

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const i = (gy * cols + gx) * 4;
      const r = s.pixels[i], g = s.pixels[i + 1], b = s.pixels[i + 2];
      const raw = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      let lum = pow(raw, P.gamma);                       // gamma < 1 вытягивает тёмные участки
      const boost = min(4, lum / max(raw, 0.01));        // во сколько раз осветлили — так же осветляем цвет
      if (P.invert) lum = 1 - lum;

      if (P.color) fx.fill(min(255, r * boost), min(255, g * boost), min(255, b * boost));
      else fx.fill(P.invert ? 25 : 235);

      let ch, size;
      if (P.mode === 'ramp') {
        ch = RAMP[floor(lum * (RAMP.length - 1))];
        size = P.cell * 1.05;
      } else {
        ch = word[(gx + gy) % word.length];
        size = P.cell * lerp(0.35, 1.3, lum);
      }
      fx.textSize(size);
      fx.text(ch, gx * P.cell + P.cell / 2, gy * P.cell + P.cell / 2);
    }
  }
}

function draw() {
  if (dirty) { render(); dirty = false; }
  image(fx, 0, 0);

  if (P.lens > 0) {
    const m = pointer();
    const ctx = drawingContext;
    ctx.save();
    ctx.beginPath();
    ctx.arc(m.x, m.y, P.lens, 0, TWO_PI);
    ctx.clip();
    image(img, 0, 0, width, height);
    ctx.restore();
    noFill();
    stroke(255, 200);
    strokeWeight(2);
    circle(m.x, m.y, P.lens * 2);
  }
}
