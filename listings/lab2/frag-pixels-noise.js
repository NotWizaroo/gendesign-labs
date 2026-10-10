// Фрагмент из текста методички к лабе 2 (шум Перлина через xoff/yoff и массив pixels).
// Обёрнут в setup() с холстом; цикл — дословно. Сравни с «случайной яркостью» — здесь картинка плавная.
// Прирост 0.01 между пикселями даёт «облака»; если поставить 1 — снова получится белый шум.

function setup() {
  createCanvas(640, 240);
  pixelDensity(1);   // чтобы индекс (x + y * width) * 4 попадал в нужный пиксель на Retina-экране

  loadPixels();
  let xoff = 0.0;
  //Начните xoffс 0.

  for (let x = 0; x < width; x++) {
    let yoff = 0.0;
    //Для каждого xoff, начните yoff с 0.

    for (let y = 0; y < height; y++) {
      let bright = map(noise(xoff, yoff), 0, 1, 0, 255);
      //Используйте xoffи yoffдля noise().
      let index = (x + y * width) * 4;
      //Используйте xи yдля позиции пикселя.
      pixels[index] = bright;
      pixels[index + 1] = bright;
      pixels[index + 2] = bright;
      pixels[index + 3] = 255;
      //Установите значения красного, зеленого, синего и альфа.
      yoff += 0.01;
      //Приращение yoff.
    }
    xoff += 0.01;
    //Приращение xoff.
  }
  updatePixels();
}
