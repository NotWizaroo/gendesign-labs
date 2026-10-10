// Задание 5 · вариант B. «Силовое поле».
// Концепция: невидимое делаем видимым. Холст — поле коротких штрихов, каждый
// повёрнут по направлению силы в этой точке. Источники — «заряды»: два
// кружатся сами, третий — курсор. Заряды разного знака притягивают линии друг
// к другу, одного знака — отталкивают. Клик ставит новый заряд (знак чередуется),
// клавиша C убирает поставленные.

const P = params({
  spacing:  { value: 20,  min: 10, max: 42, step: 1,    label: 'Шаг штрихов' },
  length:   { value: 1.0, min: 0.4, max: 2, step: 0.05, label: 'Длина' },
  cursor:   { value: 1.4, min: -3, max: 3, step: 0.1,   label: 'Заряд курсора' },
  orbit:    { value: 1,   min: 0,  max: 2, step: 0.1,   label: 'Скорость орбит' },
  hue:      { value: 205, min: 0,  max: 360, step: 1,   label: 'Холодный оттенок' },
  clear:    { button: 'Убрать заряды', fn: () => { placed = []; } },
});

let placed = [];      // поставленные кликом: { x, y, q }
let nextSign = 1;

function setup() {
  createCanvas(900, 560);
  colorMode(HSB, 360, 100, 100, 100);
  strokeCap(ROUND);
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    placed.push({ x: mouseX, y: mouseY, q: 2.2 * nextSign });
    nextSign *= -1;
  }
}
function keyPressed() { if (key === 'c' || key === 'C') placed = []; }

function charges() {
  const t = millis() / 1000 * P.orbit;
  const m = pointer();
  return [
    { x: width * 0.5 + cos(t * 0.8) * 230, y: height * 0.5 + sin(t * 1.1) * 130, q: 2 },
    { x: width * 0.5 + cos(t * 0.6 + PI) * 200, y: height * 0.5 + sin(t * 0.9 + 1) * 150, q: -2 },
    { x: m.x, y: m.y, q: P.cursor },
    ...placed,
  ];
}

function draw() {
  background(235, 30, 6);
  const cs = charges();
  const L = P.spacing * 0.9 * P.length;

  for (let y = P.spacing / 2; y < height; y += P.spacing) {
    for (let x = P.spacing / 2; x < width; x += P.spacing) {
      // Сумма сил от всех зарядов (закон обратных квадратов, смягчённый).
      let fx = 0, fy = 0;
      for (const c of cs) {
        const dx = x - c.x, dy = y - c.y;
        const r2 = dx * dx + dy * dy + 900;
        const k = c.q / (r2 * sqrt(r2)) * 90000;
        fx += dx * k;
        fy += dy * k;
      }
      const mag = sqrt(fx * fx + fy * fy);
      const a = atan2(fy, fx);
      const s = constrain(mag / 9, 0, 1);              // «сила» 0..1 → яркость и толщина
      const half = L * (0.35 + 0.65 * s) / 2;

      stroke((P.hue + (1 - s) * 0 + s * 160) % 360, lerp(55, 90, s), lerp(35, 100, pow(s, 0.6)), lerp(55, 100, s));
      strokeWeight(lerp(1.2, 3.2, s));
      line(x - cos(a) * half, y - sin(a) * half, x + cos(a) * half, y + sin(a) * half);
    }
  }

  // Заряды: красный «+», синий «−».
  noStroke();
  for (const c of cs) {
    fill(c.q > 0 ? 8 : 205, 80, 100, 90);
    circle(c.x, c.y, 10 + abs(c.q) * 4);
  }
}
