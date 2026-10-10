// Задание 5 · вариант C. «Калейдоскоп».
// Концепция: один жест — много отражений. Каждое движение курсора рисуется
// сразу в N секторах, а в каждом ещё и зеркально, поэтому любая каракуля
// превращается в мандалу. Цвет плавно идёт по кругу, а след медленно тает.
// C — очистить, S — сохранить кадр.

const P = params({
  sectors: { value: 8,  min: 2, max: 24, step: 1, label: 'Секторов' },
  mirror:  { value: true, label: 'Зеркало внутри сектора' },
  brush:   { value: 3.5, min: 1, max: 14, step: 0.5, label: 'Толщина' },
  glow:    { value: 40, min: 0, max: 100, step: 1, label: 'Свечение' },
  fade:    { value: 0.012, min: 0, max: 0.08, step: 0.002, label: 'Таяние следа' },
  hueRate: { value: 40, min: 0, max: 200, step: 1, label: 'Скорость цвета' },
  onlyDown: { value: false, label: 'Рисовать только с кнопкой' },
  wipe:    { button: 'Очистить', fn: () => { layer.background(240, 25, 5); } },
});

let layer;
let prev = null;

function setup() {
  createCanvas(720, 720);
  layer = createGraphics(width, height);
  layer.pixelDensity(1);
  layer.colorMode(HSB, 360, 100, 100, 100);
  layer.background(240, 25, 5);
  colorMode(HSB, 360, 100, 100, 100);
}

function keyPressed() {
  if (key === 'c' || key === 'C') layer.background(240, 25, 5);
  if (key === 's' || key === 'S') saveCanvas('kaleidoscope', 'png');
}

function draw() {
  // Таяние: поверх накладываем почти прозрачный фон.
  layer.noStroke();
  layer.fill(240, 25, 5, P.fade * 100);
  layer.rect(0, 0, width, height);

  const m = pointer();
  const cur = createVector(m.x - width / 2, m.y - height / 2);
  const drawing = !P.onlyDown || mouseIsPressed || m.auto;

  if (prev && drawing) {
    const hue = (millis() / 1000 * P.hueRate) % 360;
    const step = TWO_PI / P.sectors;
    layer.strokeCap(ROUND);
    layer.push();
    layer.translate(width / 2, height / 2);
    for (let i = 0; i < P.sectors; i++) {
      layer.push();
      layer.rotate(i * step);
      stroke_(prev, cur, hue, false);
      if (P.mirror) { layer.scale(1, -1); stroke_(prev, cur, hue, true); }
      layer.pop();
    }
    layer.pop();
  }
  prev = cur;

  background(240, 25, 5);
  image(layer, 0, 0);
}

// Один штрих: мягкое широкое свечение под тонкой яркой линией.
function stroke_(a, b, hue, flip) {
  const h = (hue + (flip ? 30 : 0)) % 360;
  if (P.glow > 0) {
    layer.stroke(h, 60, 100, P.glow * 0.25);
    layer.strokeWeight(P.brush * 3.2);
    layer.line(a.x, a.y, b.x, b.y);
  }
  layer.stroke(h, 55, 100, 95);
  layer.strokeWeight(P.brush);
  layer.line(a.x, a.y, b.x, b.y);
}
