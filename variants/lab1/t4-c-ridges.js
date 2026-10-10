// Задание 4 · вариант C. «Рельеф из линий» (в духе обложки Joy Division).
// Фото — набор горизонтальных линий: яркость поднимает линию вверх, а
// каждая следующая линия закрашена фоном и закрывает то, что за ней
// (скрытые линии). От курсора по рельефу расходится рябь.

const P = params({
  spacing: { value: 9,  min: 5, max: 22, step: 1, label: 'Шаг линий' },
  amp:     { value: 36, min: 0, max: 100, step: 1, label: 'Высота рельефа' },
  ripple:  { value: 10, min: 0, max: 40, step: 1, label: 'Рябь от курсора' },
  invert:  { value: false, label: 'Тёмное = выше' },
  hue:     { value: 200, min: 0, max: 360, step: 1, label: 'Оттенок' },
  sat:     { value: 0,   min: 0, max: 100, step: 1, label: 'Насыщенность' },
});

let img;
let lum;               // яркость каждого пикселя 0..1
const STEP = 4;        // шаг по X внутри линии

function preload() {
  img = loadImage(asset('sobor.jpg'));
}

function setup() {
  createCanvas(600, 797);
  pixelDensity(1);
  colorMode(HSB, 360, 100, 100);
  img.resize(width, height);
  img.loadPixels();
  lum = new Float32Array(width * height);
  for (let i = 0; i < lum.length; i++) {
    lum[i] = (0.299 * img.pixels[i * 4] + 0.587 * img.pixels[i * 4 + 1] + 0.114 * img.pixels[i * 4 + 2]) / 255;
  }
}

function draw() {
  background(0, 0, 4);
  const m = pointer();
  const t = millis() / 1000;
  const bg = color(0, 0, 4);
  const ink = color(P.hue, P.sat, 96);
  strokeWeight(1.3);
  strokeJoin(ROUND);

  for (let y0 = P.spacing; y0 < height + P.amp; y0 += P.spacing) {
    // Высоты вдоль линии считаем один раз: они нужны и для заливки, и для штриха.
    const ys = [];
    const py = constrain(floor(y0), 0, height - 1);
    for (let x = 0; x <= width; x += STEP) {
      let l = lum[py * width + min(width - 1, x)];
      if (P.invert) l = 1 - l;
      const d = dist(x, y0, m.x, m.y);
      const wave = P.ripple * sin(d * 0.06 - t * 4) * exp(-d / 170);
      ys.push(y0 - l * P.amp + wave);
    }

    // 1) заливка фоном под линией — закрывает дальние линии;
    noStroke();
    fill(bg);
    beginShape();
    vertex(0, height + 20);
    ys.forEach((y, i) => vertex(i * STEP, y));
    vertex(width, height + 20);
    endShape(CLOSE);

    // 2) сама линия без боковых и нижней кромок.
    noFill();
    stroke(ink);
    beginShape();
    ys.forEach((y, i) => vertex(i * STEP, y));
    endShape();
  }
}
