// Фрагмент из текста методички к лабе 2 (случайная яркость каждого пикселя).
// Обёрнут в setup() с холстом; цикл — дословно. Для сравнения со шумом (фрагмент ниже).

function setup() {
  createCanvas(640, 240);
  pixelDensity(1);   // чтобы индекс (x + y * width) * 4 попадал в нужный пиксель на Retina-экране

  loadPixels();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let index = (x + y * width) * 4;
      let bright = random(255);
      //Случайная яркость!
      pixels[index] = bright;
      pixels[index + 1] = bright;
      pixels[index + 2] = bright;
      //Установите значения красного, зеленого и синего.
      pixels[index + 3] = 255;
      //Установите значение альфа на 255 (без прозрачности).
    }
  }
  updatePixels();
}
