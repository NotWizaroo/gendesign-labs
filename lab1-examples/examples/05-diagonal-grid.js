// 05. Сетка случайных диагоналей (Листинг 6 методички).
// В каждой клетке сетки случайно выбирается одно из двух направлений
// диагонали (toggle 0/1). randomSeed() фиксирует результат между кадрами,
// новый узор — только по клику (mousePressed меняет actRandomSeed).

window.EXAMPLES = window.EXAMPLES || [];
window.EXAMPLES.push({
  file: '05-diagonal-grid.js',
  title: '05 · Диагональная сетка',
  hint: 'кликни для нового узора',
  desc: 'В каждой ячейке — линия A (из левого верхнего угла) либо B (из левого нижнего), направление выбирается случайно один раз через randomSeed().',
  keyCode: `
function draw() {
  randomSeed(actRandomSeed);
  for (let gy = 0; gy < tileCount; gy++) {
    for (let gx = 0; gx < tileCount; gx++) {
      const toggle = int(random(0, 2));
      if (toggle === 0) line(posX, posY, posX + w, posY + h);
      else line(posX, posY + h, posX + w, posY);
    }
  }
}
function mousePressed() {
  actRandomSeed = random(100000);
}
`,
  sketch: function (p) {
    const tileCount = 14;
    let actRandomSeed = 0;

    p.setup = function () {
      p.createCanvas(280, 280);
      p.strokeCap(p.ROUND);
    };
    p.draw = function () {
      p.clear();
      p.background(20);
      p.stroke(230);
      p.randomSeed(actRandomSeed);
      const cw = p.width / tileCount;
      const ch = p.height / tileCount;
      for (let gy = 0; gy < tileCount; gy++) {
        for (let gx = 0; gx < tileCount; gx++) {
          const posX = cw * gx;
          const posY = ch * gy;
          const toggle = p.int(p.random(0, 2));
          p.strokeWeight(1.2);
          if (toggle === 0) {
            p.line(posX, posY, posX + cw, posY + ch);
          } else {
            p.line(posX, posY + ch, posX + cw, posY);
          }
        }
      }
    };
    p.mousePressed = function () {
      if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
        actRandomSeed = p.random(100000);
      }
    };
  },
});
