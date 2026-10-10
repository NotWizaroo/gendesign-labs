// УЧЕБНАЯ КОПИЯ для разбора кода. Запускается сама по себе, без студии:
// ползунки заменены обычными значениями в объекте P (меняй их здесь и обновляй страницу),
// положение мыши берётся из mouseX / mouseY. Оригинал со слайдерами: variants/lab1/t2-a-bauhaus.js

// Задание 2 · вариант A. «Баухаус-плитки».
// Та же идея модульной сетки, но каждая клетка — одна из геометрических
// «деталей»: четверть круга, полукруг, круг, квадрат, диагональ. Палитра
// ограничена (красный, жёлтый, синий, чёрный, бумага), как у плакатов Баухауса.

const P = {
  cols: 7,   // Колонок (3–12)
  gap: 0,   // Зазор (0–14)
  pal: 'bauhaus',   // Палитра — варианты: bauhaus, swiss, pastel, night
};

const PALETTES = {
  bauhaus: { paper: '#efe6d2', ink: ['#d6352a', '#f2b632', '#1f4e9c', '#16161a'] },
  swiss:   { paper: '#f4f4f0', ink: ['#e8312f', '#16161a', '#16161a', '#8a8a86'] },
  pastel:  { paper: '#fbf3ea', ink: ['#f2a7a0', '#a7d3c2', '#f5d489', '#9db4e0'] },
  night:   { paper: '#12141c', ink: ['#ff5d73', '#ffc857', '#4cc9f0', '#e9ecf5'] },
};

let seed = 20261003;

function setup() {
  createCanvas(720, 720);
  noLoop();
  noStroke();
}

function draw() {
  const pal = PALETTES[P.pal];
  background(pal.paper);
  randomSeed(seed);

  const n = P.cols;
  const cell = width / n;
  const pick = () => color(random(pal.ink));

  for (let gy = 0; gy < n; gy++) {
    for (let gx = 0; gx < n; gx++) {
      const x = gx * cell + P.gap / 2;
      const y = gy * cell + P.gap / 2;
      const s = cell - P.gap;
      const kind = floor(random(7));
      const c = pick();
      const c2 = pick();
      fill(c);

      push();
      translate(x + s / 2, y + s / 2);
      rotate(floor(random(4)) * HALF_PI);   // каждая деталь повёрнута на 0/90/180/270°
      translate(-s / 2, -s / 2);

      if (kind === 0) {                    // четверть круга
        arc(0, 0, s * 2, s * 2, 0, HALF_PI, PIE);
      } else if (kind === 1) {             // полукруг
        arc(s / 2, 0, s, s, 0, PI, PIE);
      } else if (kind === 2) {             // круг в квадрате
        fill(c2); rect(0, 0, s, s);
        fill(c); circle(s / 2, s / 2, s * 0.72);
      } else if (kind === 3) {             // диагональный треугольник
        triangle(0, 0, s, 0, 0, s);
      } else if (kind === 4) {             // концентрические четверти
        fill(c2); rect(0, 0, s, s);
        fill(c); arc(0, 0, s * 2, s * 2, 0, HALF_PI, PIE);
        fill(c2); arc(0, 0, s * 1.2, s * 1.2, 0, HALF_PI, PIE);
      } else if (kind === 5) {             // квадрат с вырезом-кругом
        rect(0, 0, s, s);
        fill(pal.paper); circle(s / 2, s / 2, s * 0.4);
      }                                     // kind 6 — пустая клетка, воздух
      pop();
    }
  }
}

// Клавиша N — новая случайная композиция (в студии это была кнопка).
function keyPressed() {
  if (key === 'n' || key === 'N') {
    seed = floor(random(1e6));
    redraw();
  }
}
