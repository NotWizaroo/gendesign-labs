// 08. Блуждающий агент (упрощённая версия Листинга 9 методички).
// Агент движется в одном из 4 основных направлений (север/восток/юг/запад)
// с небольшим случайным отклонением угла. Дойдя до границы холста, он
// разворачивается и выбирает новое основное направление. Каждые
// несколько шагов агент "фиксирует" пройденный путь линией — так
// получается ветвящийся, но не полностью случайный след.

window.EXAMPLES = window.EXAMPLES || [];
window.EXAMPLES.push({
  file: '08-agent-walk.js',
  title: '08 · Блуждающий агент',
  hint: 'кликни, чтобы начать заново',
  desc: 'Агент шагает в текущем направлении ± случайный угол; у края холста меняет направление на случайный поворот. След фиксируется отрезками, а не отдельными точками — получаются "прожилки", как у настоящих агентных систем.',
  keyCode: `
function step() {
  angle += random(-angleSpread, angleSpread);
  posX += cos(angle) * stepSize;
  posY += sin(angle) * stepSize;
  if (nearBorder()) direction = randomDirection();
  line(prevX, prevY, posX, posY);
}
`,
  sketch: function (p) {
    const NORTH = 0, EAST = 1, SOUTH = 2, WEST = 3;
    let direction, angle, posX, posY, prevX, prevY;
    const stepSize = 3;
    const angleSpread = p.PI / 6;

    function baseAngle(dir) {
      return [-p.HALF_PI, 0, p.HALF_PI, p.PI][dir];
    }

    function reset() {
      direction = p.floor(p.random(4));
      angle = baseAngle(direction) + p.random(-angleSpread, angleSpread);
      posX = p.width / 2;
      posY = p.height / 2;
      prevX = posX;
      prevY = posY;
      p.background(250, 248, 243);
    }

    p.setup = function () {
      p.createCanvas(280, 280);
      p.strokeWeight(1.3);
      p.stroke(30, 30, 30, 200);
      reset();
    };
    p.draw = function () {
      for (let k = 0; k < 3; k++) {
        angle += p.random(-angleSpread, angleSpread) * 0.4;
        posX += p.cos(angle) * stepSize;
        posY += p.sin(angle) * stepSize;

        const nearBorder =
          posX < 6 || posX > p.width - 6 || posY < 6 || posY > p.height - 6;

        if (nearBorder) {
          posX = p.constrain(posX, 6, p.width - 6);
          posY = p.constrain(posY, 6, p.height - 6);
          direction = p.floor(p.random(4));
          angle = baseAngle(direction) + p.random(-angleSpread, angleSpread);
        }
      }
      p.line(prevX, prevY, posX, posY);
      prevX = posX;
      prevY = posY;
    };
    p.mousePressed = function () {
      if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
        reset();
      }
    };
  },
});
