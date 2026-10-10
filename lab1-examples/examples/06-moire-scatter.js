// 06. Рассеивание сетки кругов (Листинг 7 методички).
// Круги стоят на регулярной сетке, но их позиция случайно смещается
// (random(-mouseX, mouseX)) — чем правее курсор, тем сильнее "шатается"
// сетка. Полупрозрачная заливка даёт эффект муара при наложении кругов.

window.EXAMPLES = window.EXAMPLES || [];
window.EXAMPLES.push({
  file: '06-moire-scatter.js',
  title: '06 · Рассеивание сетки',
  hint: 'двигай мышью по X, кликни для нового узора',
  desc: 'Каждый круг сетки смещается на random(-mouseX, mouseX)/20 по X и Y — регулярная сетка постепенно "рассыпается" в случайное облако.',
  keyCode: `
function draw() {
  background(255);
  randomSeed(actRandomSeed);
  for (let gy = 0; gy < tileCount; gy++) {
    for (let gx = 0; gx < tileCount; gx++) {
      const shiftX = random(-mouseX, mouseX) / 20;
      const shiftY = random(-mouseX, mouseX) / 20;
      ellipse(posX + shiftX, posY + shiftY, size, size);
    }
  }
}
`,
  sketch: function (p) {
    const tileCount = 16;
    let actRandomSeed = 0;

    p.setup = function () {
      p.createCanvas(280, 280);
      p.noFill();
    };
    p.draw = function () {
      p.background(255);
      p.stroke(0, 0, 0, 130);
      p.strokeWeight(1);
      p.randomSeed(actRandomSeed);
      const step = p.width / tileCount;
      for (let gy = 0; gy < tileCount; gy++) {
        for (let gx = 0; gx < tileCount; gx++) {
          const posX = step * gx + step / 2;
          const posY = step * gy + step / 2;
          const m = p.max(p.mouseX, 1);
          const shiftX = p.random(-m, m) / 20;
          const shiftY = p.random(-m, m) / 20;
          p.ellipse(posX + shiftX, posY + shiftY, step * 0.7, step * 0.7);
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
