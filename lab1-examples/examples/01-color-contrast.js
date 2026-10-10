// 01. Одновременный цветовой контраст (Листинг 2 методички).
// Идея: фон и центральный квадрат — дополнительные (комплементарные) цвета
// в модели HSB. Положение мыши по X управляет размером квадрата, по Y —
// оттенком. Наглядно показывает, как один и тот же цвет "читается"
// по-разному в зависимости от окружающего фона.

window.EXAMPLES = window.EXAMPLES || [];
window.EXAMPLES.push({
  file: '01-color-contrast.js',
  title: '01 · Цветовой контраст',
  hint: 'двигай мышью по канвасу',
  desc: 'Фон и квадрат — дополнительные цвета в HSB (оттенки различаются на 180°). По X — размер квадрата, по Y — оттенок пары.',
  keyCode: `
function draw() {
  background(mouseY / 2, 100, 100);
  fill(360 - mouseY / 2, 100, 100);
  rect(360, 360, mouseX + 1, mouseX + 1);
}
`,
  sketch: function (p) {
    p.setup = function () {
      p.createCanvas(280, 280);
      p.colorMode(p.HSB, 360, 100, 100);
      p.noCursor();
      p.rectMode(p.CENTER);
      p.noStroke();
    };
    p.draw = function () {
      p.background(p.mouseY / 2, 100, 100);
      p.fill(360 - p.mouseY / 2, 100, 100);
      const s = p.map(p.mouseX, 0, p.width, 1, p.width);
      p.rect(p.width / 2, p.height / 2, s, s);
    };
  },
});
