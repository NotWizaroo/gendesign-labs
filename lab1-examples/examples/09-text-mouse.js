// 09. Буква, управляемая мышью (Листинг 10 методички).
// Размер буквы зависит от положения мыши по X, вертикальная позиция —
// от Y. При зажатой кнопке мыши холст не очищается, и буква оставляет
// след. Ввод с клавиатуры (только когда курсор над этим канвасом,
// иначе печать "утекала" бы во все карточки дашборда сразу) меняет
// букву.

window.EXAMPLES = window.EXAMPLES || [];
window.EXAMPLES.push({
  file: '09-text-mouse.js',
  title: '09 · Буква от мыши',
  hint: 'двигай мышью, зажми кнопку — след; печатай, пока курсор здесь',
  desc: 'textSize((mouseX - width/2) * 5 + 1) и text(letter, width/2, mouseY) — размер и позиция буквы напрямую читаются из координат курсора.',
  keyCode: `
function mouseMoved() {
  clear();
  textSize((mouseX - width / 2) * 5 + 1);
  text(letter, width / 2, mouseY);
}
function mouseDragged() {
  textSize((mouseX - width / 2) * 5 + 1);
  text(letter, width / 2, mouseY);   // без clear() — остаётся след
}
function keyTyped() {
  letter = key;
}
`,
  sketch: function (p) {
    let letter = 'A';
    let active = false;

    p.setup = function () {
      const cnv = p.createCanvas(280, 280);
      p.background(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.fill(20);
      p.noStroke();
      cnv.elt.addEventListener('mouseenter', () => { active = true; });
      cnv.elt.addEventListener('mouseleave', () => { active = false; });
      // Свой обработчик клавиатуры на document, а не p.keyTyped: несколько
      // p5-инстансов на странице иначе получали бы нажатия одновременно.
      document.addEventListener('keydown', (e) => {
        if (!active) return;
        if (e.key.length === 1) letter = e.key.toUpperCase();
      });
    };
    p.draw = function () {
      if (!p.mouseIsPressed) {
        p.background(255);
      }
      const s = p.constrain((p.mouseX - p.width / 2) * 5 + 1, 4, 400);
      p.textSize(s);
      p.text(letter, p.width / 2, p.mouseY);
    };
  },
});
