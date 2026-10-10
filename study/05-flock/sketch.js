// УЧЕБНАЯ КОПИЯ для разбора кода. Запускается сама по себе, без студии:
// ползунки заменены обычными значениями в объекте P (меняй их здесь и обновляй страницу),
// положение мыши берётся из mouseX / mouseY. Оригинал со слайдерами: variants/lab1/t5-a-flock.js

// Задание 5 · вариант A. «Стая и одиночка».
// Концепция: коллектив против одного. Сотни «птиц» подчиняются трём простым
// правилам (Рейнольдс, 1986): держаться вместе, лететь в одну сторону и не
// толкаться. Курсор — одиночка: стая то тянется к нему, то бежит прочь.
// Клик — вспугнуть стаю. Оттенок птицы зависит от направления полёта.

const P = {
  count: 180,   // Птиц (30–420)
  speed: 3.2,   // Скорость (1–7)
  cohesion: 0.9,   // Сплочённость (0–2)
  alignment: 1.1,   // Выравнивание (0–2)
  separation: 1.4,   // Дистанция (0–3)
  mode: 'attract',   // Курсор — варианты: attract, repel
  trail: 0.8,   // След (0–0.97)
};

let birds = [];

function setup() {
  createCanvas(900, 560);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
  spawn();
}

function spawn() {
  while (birds.length < P.count) {
    birds.push({ p: createVector(random(width), random(height)), v: p5.Vector.random2D().mult(2) });
  }
  birds.length = P.count;
}
function mousePressed() {
  // Вспугнуть: резкий импульс прочь от точки клика.
  const o = createVector(mouseX, mouseY);
  birds.forEach((b) => {
    const d = p5.Vector.sub(b.p, o);
    if (d.mag() < 220) b.v.add(d.setMag(map(d.mag(), 0, 220, 9, 1)));
  });
}

function draw() {
  background(230, 30, 7, 100 * (1 - P.trail));
  const m = { x: mouseX, y: mouseY };
  const mouse = createVector(m.x, m.y);
  const view = 70, tooClose = 26;

  for (const b of birds) {
    const coh = createVector(), ali = createVector(), sep = createVector();
    let n = 0;
    for (const o of birds) {
      if (o === b) continue;
      const d = b.p.dist(o.p);
      if (d < view) {
        coh.add(o.p); ali.add(o.v); n++;
        if (d < tooClose) sep.add(p5.Vector.sub(b.p, o.p).div(max(d, 1)));
      }
    }
    if (n) {
      coh.div(n).sub(b.p).setMag(0.05 * P.cohesion);
      ali.div(n).setMag(0.06 * P.alignment);
      b.v.add(coh).add(ali);
    }
    b.v.add(sep.mult(0.12 * P.separation));

    // Курсор: притяжение к нему или бегство от него.
    const toM = p5.Vector.sub(mouse, b.p);
    const dm = toM.mag();
    if (dm < 260) {
      const f = map(dm, 0, 260, 0.22, 0.02) * (P.mode === 'attract' ? 1 : -2);
      b.v.add(toM.setMag(f));
    }

    b.v.limit(P.speed);
    b.p.add(b.v);
    // Мир замкнут в тор: вылетел справа — появился слева.
    b.p.x = (b.p.x + width) % width;
    b.p.y = (b.p.y + height) % height;
  }

  for (const b of birds) {
    const h = (degrees(b.v.heading()) + 360) % 360;
    fill(h, 70, 100);
    push();
    translate(b.p.x, b.p.y);
    rotate(b.v.heading());
    triangle(9, 0, -6, 4.5, -6, -4.5);
    pop();
  }

  // Одиночка.
  noFill();
  stroke(0, 0, 100, 60);
  strokeWeight(1.5);
  circle(m.x, m.y, 16);
  noStroke();
}
