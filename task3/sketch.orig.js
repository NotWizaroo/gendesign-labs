// Задание 3. Текст с интерактивностью.
// Печатаемое слово меняет размер по X мыши и оттенок по Y мыши.
// При зажатой кнопке мыши холст не очищается — буквы оставляют след.

let phrase = 'LABA';

function setup() {
  createCanvas(800, 600);
  colorMode(HSB, 360, 100, 100);
  background(0, 0, 100);
  textAlign(CENTER, CENTER);
  textFont('sans-serif');
  noStroke();
}

function draw() {
  if (!mouseIsPressed) {
    background(0, 0, 100);
  }

  const size = map(mouseX, 0, width, 20, 260);
  const hue = map(mouseY, 0, height, 0, 360);

  fill(hue, 80, 70);
  textSize(size);
  text(phrase, width / 2, height / 2);
}

function keyTyped() {
  // Печатаемые символы заменяют слово целиком — видно результат ввода сразу.
  if (key.length === 1) {
    phrase = (phrase === '' ) ? key.toUpperCase() : phrase + key.toUpperCase();
    if (phrase.length > 12) phrase = key.toUpperCase();
  }
}

function keyPressed() {
  if (keyCode === BACKSPACE) {
    phrase = phrase.slice(0, -1);
  }
  if (key === 's' || key === 'S') saveCanvas('task3_text', 'png');
}
