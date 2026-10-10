// Задание 4. Изображение с генеративным эффектом: «Фото из букв».
// Фото уменьшается до сетки (одна клетка — один пиксель), яркость клетки
// выбирает символ: в режиме «Градации» — от точки до «@», в режиме «Буквы слова»
// — буквы слова, чей размер растёт с яркостью. Курсор — линза, сквозь неё
// видно настоящее фото. Результат рисуется в отдельный буфер только при
// нажатии клавиш (а не каждый кадр), поэтому линза двигается плавно.
// Управление: пробел — режим (градации / буквы слова), C — цвет, I — светлый фон, S — сохранить.

let mode = 'ramp';     // 'ramp' — градации символов, 'word' — буквы слова
const WORD = 'СОБОР';
const CELL = 9;        // размер клетки в пикселях
const GAMMA = 0.55;    // подсветка теней (меньше 1 — светлее)
let useColor = true;   // цвет фото или монохром
let invert = false;    // светлый фон
const LENS = 110;      // радиус «линзы» у курсора

const RAMP = ' .:-=+*#%@';
let img, fx;
let dirty = true;

function preload() {
  img = loadImage('data/sobor.jpg');
}

function setup() {
  createCanvas(600, 797);
  pixelDensity(1);
  fx = createGraphics(width, height);
  fx.pixelDensity(1);
}

function render() {
  const cols = ceil(width / CELL);
  const rows = ceil(height / CELL);
  const s = img.get();
  s.resize(cols, rows);
  s.loadPixels();

  fx.background(invert ? 244 : 10);
  fx.noStroke();
  fx.textAlign(CENTER, CENTER);
  fx.textFont('Courier New');
  fx.textStyle(BOLD);
  const word = WORD.toUpperCase();

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const i = (gy * cols + gx) * 4;
      const r = s.pixels[i], g = s.pixels[i + 1], b = s.pixels[i + 2];
      const raw = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      let lum = pow(raw, GAMMA);                       // gamma < 1 вытягивает тёмные участки
      const boost = min(4, lum / max(raw, 0.01));        // во сколько раз осветлили — так же осветляем цвет
      if (invert) lum = 1 - lum;

      if (useColor) fx.fill(min(255, r * boost), min(255, g * boost), min(255, b * boost));
      else fx.fill(invert ? 25 : 235);

      let ch, size;
      if (mode === 'ramp') {
        ch = RAMP[floor(lum * (RAMP.length - 1))];
        size = CELL * 1.05;
      } else {
        ch = word[(gx + gy) % word.length];
        size = CELL * lerp(0.35, 1.3, lum);
      }
      fx.textSize(size);
      fx.text(ch, gx * CELL + CELL / 2, gy * CELL + CELL / 2);
    }
  }
}

function draw() {
  if (dirty) { render(); dirty = false; }
  image(fx, 0, 0);

  if (LENS > 0) {
    const m = { x: mouseX, y: mouseY };
    const ctx = drawingContext;
    ctx.save();
    ctx.beginPath();
    ctx.arc(m.x, m.y, LENS, 0, TWO_PI);
    ctx.clip();
    image(img, 0, 0, width, height);
    ctx.restore();
    noFill();
    stroke(255, 200);
    strokeWeight(2);
    circle(m.x, m.y, LENS * 2);
  }
}

function keyPressed() {
  if (key === ' ') mode = mode === 'ramp' ? 'word' : 'ramp';
  if (key === 'c' || key === 'C') useColor = !useColor;
  if (key === 'i' || key === 'I') invert = !invert;
  if (key === 's' || key === 'S') saveCanvas(fx, 'lab1_task4_glyphs', 'png');
  dirty = true;
  return false;   // чтобы пробел не прокручивал страницу
}
