// 02. Интерполяция цвета по сетке (Листинг 3 методички).
// Для каждой строки сетки заданы два случайных цвета (левый/правый),
// между ними по lerpColor() строится плавный градиент. Положение мыши
// управляет числом столбцов/строк сетки. Клик — новая случайная пара
// цветов для каждой строки.

window.EXAMPLES = window.EXAMPLES || [];
window.EXAMPLES.push({
  file: '02-color-tiles.js',
  title: '02 · Плитки-градиенты',
  hint: 'двигай мышью, кликни для новых цветов',
  desc: 'lerpColor(col1, col2, amount) строит промежуточный цвет между двумя случайными по каждой строке — получается ряд плавных градиентов.',
  keyCode: `
function draw() {
  tileCountX = int(map(mouseX, 0, width, 2, 40));
  for (let gy = 0; gy < tileCountY; gy++) {
    const col1 = colorsLeft[gy];
    const col2 = colorsRight[gy];
    for (let gx = 0; gx < tileCountX; gx++) {
      const amount = map(gx, 0, tileCountX - 1, 0, 1);
      fill(lerpColor(col1, col2, amount));
      rect(gx * tileWidth, gy * tileHeight, tileWidth, tileHeight);
    }
  }
}
`,
  sketch: function (p) {
    let colorsLeft = [];
    let colorsRight = [];
    const tileCountY = 8;

    function shakeColors() {
      colorsLeft = [];
      colorsRight = [];
      for (let i = 0; i < tileCountY; i++) {
        colorsLeft.push(p.color(p.random(0, 60), p.random(40, 100), p.random(60, 100)));
        colorsRight.push(p.color(p.random(160, 260), p.random(40, 100), p.random(60, 100)));
      }
    }

    p.setup = function () {
      p.createCanvas(280, 280);
      p.colorMode(p.HSB, 360, 100, 100);
      p.noStroke();
      shakeColors();
    };
    p.draw = function () {
      const tileCountX = p.int(p.map(p.mouseX, 0, p.width, 2, 40));
      const tileW = p.width / tileCountX;
      const tileH = p.height / tileCountY;
      for (let gy = 0; gy < tileCountY; gy++) {
        const col1 = colorsLeft[gy];
        const col2 = colorsRight[gy];
        for (let gx = 0; gx < tileCountX; gx++) {
          const amount = p.map(gx, 0, tileCountX - 1, 0, 1);
          p.fill(p.lerpColor(col1, col2, amount));
          p.rect(gx * tileW, gy * tileH, tileW + 1, tileH + 1);
        }
      }
    };
    p.mousePressed = function () {
      if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
        shakeColors();
      }
    };
  },
});
