// Задание 5 · вариант A. «Стая и одиночка».
// Концепция: коллектив против одного. Сотни «птиц» подчиняются трём простым
// правилам (Рейнольдс, 1986): держаться вместе, лететь в одну сторону и не
// толкаться. Курсор — одиночка: стая то тянется к нему, то бежит прочь.
// Клик — вспугнуть стаю. Оттенок птицы зависит от направления полёта.

const P = params({
  count:      { value: 180, min: 30, max: 420, step: 10, label: 'Птиц' },
  speed:      { value: 3.2, min: 1,  max: 7,   step: 0.1, label: 'Скорость' },
  cohesion:   { value: 0.9, min: 0,  max: 2,   step: 0.05, label: 'Сплочённость' },
  alignment:  { value: 1.1, min: 0,  max: 2,   step: 0.05, label: 'Выравнивание' },
  separation: { value: 1.4, min: 0,  max: 3,   step: 0.05, label: 'Дистанция' },
  mode:       { value: 'attract', label: 'Курсор', options: { 'Притягивает': 'attract', 'Отпугивает': 'repel' } },
  trail:      { value: 0.8, min: 0,  max: 0.97, step: 0.01, label: 'След' },
});

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
function onParam(key) { if (key === 'count') spawn(); }

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
  const m = pointer();
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
