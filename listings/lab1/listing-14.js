// Листинг 14 — из методички к лабе 1 (коллаж из кадров видео). Дословно.
// Видео data/video.mp4 в PDF не приложено: лежит 10-секундная заглушка (медленный наезд
// на фото), собранная ffmpeg. Положи своё видео под тем же именем — получится коллаж из него.
// Раскладка 9×12 кадров рисуется один раз, потом скетч останавливается.

var tileCountX = 9;
var tileCountY = 12;
var tileWidth;
var tileHeight;
var imageCount = tileCountX * tileCountY;
var currentImage = 0;
var gridX = 0;
var gridY = 0;

var movie;

function preload() {
  movie = createVideo(['data/video.mp4', 'data/video.ogg']);
  movie.hide();
}

function setup() {
  createCanvas(1024, 1024);
  background(0);

  tileWidth = width / tileCountX;
  tileHeight = height / tileCountY;
  print(movie.width + ' • ' + movie.height);
}

function draw() {
  if (movie.elt.readyState == 4) {
    var posX = tileWidth * gridX;
    var posY = tileHeight * gridY;

    // draw video
    image(movie, posX, posY, tileWidth, tileHeight);

    currentImage++;

    // seek the video to next time
    var nextTime = map(currentImage, 0, imageCount, 0, movie.duration());
    print('seek to: ' + movie.time());
    movie.time(nextTime);

    // new grid position
    gridX++;
    if (gridX >= tileCountX) {
      gridX = 0;
      gridY++;
    }

    if (currentImage >= imageCount) noLoop();
  }
}

function keyReleased() {
  if (key == 's' || key == 'S') saveCanvas(gd.timestamp(), 'png');
}
