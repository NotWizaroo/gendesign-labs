// Задание 1 · вариант B. «Цветовой круг и гармонии».
// Угол курсора вокруг центра круга выбирает базовый оттенок, схема — в панели.
// Справа строится палитра по правилу гармонии: комплементарная, аналоговая,
// триада и т. д. — те самые «гармоничные палитры» из теории цвета.

const P = params({
  scheme: { value: 'triad', label: 'Схема', options: {
    'Комплементарная': 'complement',
    'Аналоговая': 'analog',
    'Триада': 'triad',
    'Сплит-комплементарная': 'split',
    'Тетрада': 'tetrad',
  } },
  sat: { value: 78, min: 10, max: 100, step: 1, label: 'Насыщенность' },
  bri: { value: 92, min: 20, max: 100, step: 1, label: 'Яркость' },
});

const OFFSETS = {
  complement: [0, 180],
  analog: [-30, 0, 30],
  triad: [0, 120, 240],
  split: [0, 150, 210],
  tetrad: [0, 90, 180, 270],
};

function setup() {
  createCanvas(900, 560);
  colorMode(HSB, 360, 100, 100);
  textFont('sans-serif');
}

function draw() {
  background(0, 0, 10);

  const cx = 270, cy = height / 2, R = 210, r = 120;
  const m = pointer();
  const base = (degrees(atan2(m.y - cy, m.x - cx)) + 360 + 90) % 360; // 0° — наверху

  // Кольцо оттенков.
  noStroke();
  for (let h = 0; h < 360; h++) {
    fill(h, P.sat, P.bri);
    const a0 = radians(h - 90 - 0.6);
    const a1 = radians(h - 90 + 1.6);
    arc(cx, cy, R * 2, R * 2, a0, a1, PIE);
  }
  fill(0, 0, 10);
  circle(cx, cy, r * 2);

  // Выбранные оттенки: маркеры и многоугольник.
  const hues = OFFSETS[P.scheme].map((o) => (base + o + 360) % 360);
  const pts = hues.map((h) => {
    const a = radians(h - 90);
    return createVector(cx + cos(a) * (r - 18), cy + sin(a) * (r - 18));
  });

  stroke(0, 0, 90);
  strokeWeight(1.5);
  noFill();
  beginShape();
  pts.forEach((p) => vertex(p.x, p.y));
  endShape(CLOSE);

  hues.forEach((h, i) => {
    stroke(0, 0, 100);
    strokeWeight(3);
    fill(h, P.sat, P.bri);
    circle(pts[i].x, pts[i].y, 26);
  });

  // Палитра справа.
  noStroke();
  const x0 = 560, w = 290;
  const bh = min(96, (height - 160) / hues.length - 10);
  hues.forEach((h, i) => {
    const y = 80 + i * (bh + 10);
    const c = color(h, P.sat, P.bri);
    fill(c);
    rect(x0, y, w, bh, 10);
    fill(P.bri > 60 ? color(0, 0, 8) : color(0, 0, 100));
    textAlign(LEFT, CENTER);
    textSize(18);
    text(c.toString('#rrggbb').toUpperCase(), x0 + 18, y + bh / 2 - 8);
    textSize(12);
    text('H ' + round(h) + '°  S ' + P.sat + '  B ' + P.bri, x0 + 18, y + bh / 2 + 14);
  });

  fill(0, 0, 60);
  textAlign(CENTER, CENTER);
  textSize(13);
  text('поворачивай курсор вокруг круга', cx, cy);
}
