// 07. Муаровый эффект наложения (Листинг 8 методички).
// Два одинаковых узора линий рисуются друг поверх друга: первый —
// неподвижный, второй — повёрнут/сдвинут в зависимости от положения
// мыши. В точках почти-совпадения решёток возникает муаровая рябь.

window.EXAMPLES = window.EXAMPLES || [];
window.EXAMPLES.push({
  file: '07-moire-overlay.js',
  title: '07 · Муар: наложение сеток',
  hint: 'двигай мышью, кликни — режим кругов',
  desc: 'overlay() рисуется дважды: один раз как есть, второй раз — с rotate(a) или translate(x), где a/x зависят от мыши. Несовпадение решёток и даёт муар.',
  keyCode: `
function draw() {
  background(255);
  translate(width / 2, height / 2);
  strokeWeight(3);
  overlay();                 // первая (неподвижная) решётка
  const a = map(mouseX, 0, width, -0.5, 0.5);
  rotate(a);
  strokeWeight(2);
  overlay();                 // вторая решётка, повёрнутая на угол a
}
`,
  sketch: function (p) {
    let drawMode = 1;

    function overlay() {
      const w = p.width - 20;
      const h = p.height - 20;
      if (drawMode === 1) {
        for (let i = -w / 2; i < w / 2; i += 6) {
          p.line(i, -h / 2, i, h / 2);
        }
      } else {
        for (let i = 0; i < w; i += 10) {
          p.ellipse(0, 0, i, i);
        }
      }
    }

    p.setup = function () {
      p.createCanvas(280, 280);
      p.noFill();
    };
    p.draw = function () {
      p.background(255);
      p.translate(p.width / 2, p.height / 2);
      p.stroke(0, 60);
      p.strokeWeight(1.5);
      overlay();

      const a = p.map(p.mouseX, 0, p.width, -0.5, 0.5);
      const s = p.map(p.mouseY, 0, p.height, 0.7, 1);
      p.rotate(a);
      p.scale(s);
      p.stroke(0);
      p.strokeWeight(1);
      overlay();
    };
    p.mousePressed = function () {
      if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
        drawMode = drawMode === 1 ? 2 : 1;
      }
    };
  },
});
