// Задание 4 · вариант B. «Сбой сигнала».
// Фото режется на горизонтальные полосы, каждая сдвигается по шуму, а три
// цветовых канала (R, G, B) разъезжаются в стороны и складываются обратно
// режимом ADD — отсюда цветная кайма, как у плохого ТВ-сигнала.
// Сильнее всего сбой у курсора; зажми кнопку мыши — будет «разрыв».
// Каналы разделены один раз в setup: tint() на каждом кадре был бы слишком медленным.

const P = params({
  amount: { value: 70,  min: 0,  max: 220, step: 1,    label: 'Сдвиг полос' },
  bands:  { value: 38,  min: 8,  max: 100, step: 1,    label: 'Число полос' },
  split:  { value: 14,  min: 0,  max: 60,  step: 1,    label: 'Разнос RGB' },
  focus:  { value: 170, min: 30, max: 600, step: 5,    label: 'Зона курсора' },
  base:   { value: 0.12, min: 0, max: 1,   step: 0.01, label: 'Дрожание везде' },
  rate:   { value: 8,   min: 1,  max: 30,  step: 1,    label: 'Смен/сек' },
});

let img;
const chan = [];

function preload() {
  img = loadImage(asset('sobor.jpg'));
}

function setup() {
  createCanvas(600, 797);
  pixelDensity(1);
  img.resize(width, height);
  img.loadPixels();
  // Три «одноканальных» картинки.
  for (let c = 0; c < 3; c++) {
    const g = createImage(width, height);
    g.loadPixels();
    for (let i = 0; i < img.pixels.length; i += 4) {
      g.pixels[i + c] = img.pixels[i + c];
      g.pixels[i + 3] = 255;
    }
    g.updatePixels();
    chan.push(g);
  }
}

function draw() {
  background(0);
  blendMode(ADD);

  const m = pointer();
  const tick = floor(millis() / 1000 * P.rate);          // шум «залипает» на кадр эффекта
  const burst = mouseIsPressed ? 3 : 1;
  const bh = height / P.bands;

  for (let i = 0; i < P.bands; i++) {
    const y0 = i * bh;
    const yc = y0 + bh / 2;
    // Вес сбоя: колокол вокруг курсора плюс фоновое дрожание.
    const near = exp(-pow((yc - m.y) / P.focus, 2));
    const w = P.base + (1 - P.base) * near;
    const n = noise(i * 0.73, tick * 0.41) - 0.5;
    const dx = n * 2 * P.amount * w * burst;
    const sp = P.split * w * burst;

    // R уезжает вправо, B — влево, G остаётся на месте полосы.
    image(chan[0], dx + sp, y0, width, bh + 1, 0, y0, width, bh + 1);
    image(chan[1], dx,      y0, width, bh + 1, 0, y0, width, bh + 1);
    image(chan[2], dx - sp, y0, width, bh + 1, 0, y0, width, bh + 1);
  }

  blendMode(BLEND);
  // Строчная развёртка: тонкие тёмные линии поверх.
  noStroke();
  fill(0, 55);
  for (let y = 0; y < height; y += 3) rect(0, y, width, 1);
}
