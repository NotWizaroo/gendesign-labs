// 03. Цветовая палитра из фотографии (Листинг 4 методички).
// Пиксели загруженного изображения сканируются по сетке (положение мыши
// задаёт число ячеек), для каждой ячейки берётся цвет пикселя. Клик
// сортирует получившиеся цвета по яркости — палитра превращается
// в упорядоченный градиент.

window.EXAMPLES = window.EXAMPLES || [];
window.EXAMPLES.push({
  file: '03-image-palette.js',
  title: '03 · Палитра из фото',
  hint: 'двигай мышью, кликни — сортировка по яркости',
  desc: 'img.get(x, y) читает цвет пикселя исходной фотографии в узлах сетки; по клику ячейки пересортировываются по brightness().',
  keyCode: `
function draw() {
  const tileCount = int(map(mouseX, 0, width, 4, 40));
  const cell = width / tileCount;
  for (let gy = 0; gy < tileCount; gy++) {
    for (let gx = 0; gx < tileCount; gx++) {
      const ix = floor(map(gx, 0, tileCount, 0, img.width));
      const iy = floor(map(gy, 0, tileCount, 0, img.height));
      fill(img.get(ix, iy));
      rect(gx * cell, gy * cell, cell, cell);
    }
  }
}
`,
  sketch: function (p) {
    let img;
    let sortMode = false;

    p.preload = function () {
      img = p.loadImage('data/sobor.jpg');
    };
    p.setup = function () {
      p.createCanvas(280, 280);
      p.noStroke();
    };
    p.draw = function () {
      const tileCount = p.int(p.map(p.mouseX, 0, p.width, 4, 40));
      const cell = p.width / tileCount;
      img.loadPixels();

      const colors = [];
      for (let gy = 0; gy < tileCount; gy++) {
        for (let gx = 0; gx < tileCount; gx++) {
          const ix = p.floor(p.map(gx, 0, tileCount, 0, img.width));
          const iy = p.floor(p.map(gy, 0, tileCount, 0, img.height));
          colors.push(img.get(ix, iy));
        }
      }
      if (sortMode) {
        colors.sort((a, b) => p.brightness(a) - p.brightness(b));
      }

      let i = 0;
      for (let gy = 0; gy < tileCount; gy++) {
        for (let gx = 0; gx < tileCount; gx++) {
          p.fill(colors[i]);
          p.rect(gx * cell, gy * cell, cell + 1, cell + 1);
          i++;
        }
      }
    };
    p.mousePressed = function () {
      if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
        sortMode = !sortMode;
      }
    };
  },
});
