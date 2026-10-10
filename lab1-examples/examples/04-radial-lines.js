// 04. Лучевая розетка из линий (Листинг 5 методички).
// Число линий (circleResolution) и толщина обводки заданы положением
// мыши по Y, радиус — положением по X. Все линии выходят из центра
// с равным угловым шагом (TAU / circleResolution).

window.EXAMPLES = window.EXAMPLES || [];
window.EXAMPLES.push({
  file: '04-radial-lines.js',
  title: '04 · Лучевая розетка',
  hint: 'двигай мышью по канвасу',
  desc: 'circleResolution и strokeWeight зависят от Y, радиус — от X. angle = TAU / circleResolution, линии рисуются в цикле по i.',
  keyCode: `
function draw() {
  background(255);
  translate(width / 2, height / 2);
  const circleResolution = int(map(mouseY, 0, height, 2, 80));
  const radius = mouseX - width / 2;
  const angle = TAU / circleResolution;
  strokeWeight(mouseY / 20);
  for (let i = 0; i <= circleResolution; i++) {
    const x = cos(angle * i) * radius;
    const y = sin(angle * i) * radius;
    line(0, 0, x, y);
  }
}
`,
  sketch: function (p) {
    p.setup = function () {
      p.createCanvas(280, 280);
      p.strokeCap(p.SQUARE);
    };
    p.draw = function () {
      p.background(255);
      p.translate(p.width / 2, p.height / 2);
      const circleResolution = p.int(p.map(p.mouseY, 0, p.height, 2, 80));
      const radius = p.mouseX - p.width / 2;
      const angle = p.TAU / circleResolution;
      p.strokeWeight(p.mouseY / 20);
      for (let i = 0; i <= circleResolution; i++) {
        const x = p.cos(angle * i) * radius;
        const y = p.sin(angle * i) * radius;
        p.line(0, 0, x, y);
      }
    };
  },
});
