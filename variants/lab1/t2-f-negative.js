// Негатив на пересечениях: где две фигуры накладываются, цвет «переворачивается».
// Приём: blendMode(DIFFERENCE). Новый цвет точки = |то, что уже нарисовано − цвет фигуры|.
// Белое на чёрном — белое; белое на белом — |255 − 255| = 0, то есть чёрное. На трёх слоях цвет чередуется.
// Фигуры: большой круг, квадрат и круг, который идёт за мышью.

const P = params({
  rings: { value: 5, min: 1, max: 10, step: 1, label: 'Колец-контуров' },
  size:  { value: 220, min: 80, max: 360, step: 5, label: 'Размер' },
  tint:  { value: false, label: 'Цветной негатив' },
});

function setup() {
  createCanvas(640, 640);
  noStroke();
}

function draw() {
  background(0);                     // чёрный фон
  blendMode(DIFFERENCE);             // с этого момента фигуры «вычитаются» из того, что под ними
  const t = millis() / 1000;
  const m = pointer();               // мышь (или плавный автопилот, пока мышь не трогали)

  fill(P.tint ? color(255, 120, 60) : 255);

  // 1. большой круг в центре, чуть пульсирует
  circle(width / 2, height / 2, P.size * (1.3 + 0.1 * sin(t)));

  // 2. квадрат, который медленно вращается вокруг центра
  push();
  translate(width / 2, height / 2);
  rotate(t * 0.4);
  rectMode(CENTER);
  rect(0, 0, P.size * 1.1, P.size * 1.1);
  pop();

  // 3. круг у мыши: на пересечениях с остальными фигурами цвет переворачивается
  circle(m.x, m.y, P.size);

  // 4. кольца-контуры: тонкие линии тоже «вычитаются»
  noFill();
  stroke(P.tint ? color(80, 160, 255) : 255);
  strokeWeight(2);
  for (let i = 1; i <= P.rings; i++) circle(width / 2, height / 2, i * P.size * 0.35);
  noStroke();

  blendMode(BLEND);                  // возвращаем обычный режим (хорошая привычка)
}
