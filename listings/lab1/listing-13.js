// Листинг 13 — из методички к лабе 1 (3.4 Работа с изображениями). Дословно.
// Картинка data/image.jpg в PDF не приложена: лежит заменитель — подставь свою.
// Мышь задаёт число плиток по X и Y.

var img;

function preload() {
  img = loadImage('data/image.jpg');
}

function setup() {
  createCanvas(650, 450);
}

function draw() {
  var tileCountX = mouseX / 3 + 1;
  var tileCountY = mouseY / 3 + 1;
  var stepX = width / tileCountX;
  var stepY = height / tileCountY;
  for (var gridY = 0; gridY < height; gridY += stepY) {
    for (var gridX = 0; gridX < width; gridX += stepX) {
      image(img, gridX, gridY, stepX, stepY);
    }
  }
}

function keyReleased() {
  if (key == 's' || key == 'S') saveCanvas(gd.timestamp(), 'png');
}
