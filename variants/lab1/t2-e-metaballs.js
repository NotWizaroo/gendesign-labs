// Чёрно-белые «пузыри жидкости» (метаболлы). Ровно два цвета: чёрный фон и белая форма.
//
// Идея: у каждого пузыря есть центр и радиус. Для КАЖДОЙ точки экрана считаем «поле»:
//   поле = сумма по всем пузырям (радиус² / расстояние²)
// Рядом с центром поле большое, вдали маленькое. Если сумма > 1 — точка белая, иначе чёрная.
// Когда два пузыря сближаются, их поля складываются, и между ними появляется перемычка — как у капель.
// Один из пузырей всегда идёт за мышью.

const P = params({
  count:  { value: 8,   min: 2,  max: 14, step: 1,   label: 'Пузырей' },
  radius: { value: 30,  min: 10, max: 100, step: 1,  label: 'Размер' },
  edge:   { value: 0.08, min: 0.01, max: 0.5, step: 0.01, label: 'Мягкость края' },
});

const W = 200;            // считаем на маленькой картинке 200×200 (так быстро), потом растягиваем
let img;
const balls = [];

function setup() {
  createCanvas(640, 640);
  pixelDensity(1);
  img = createImage(W, W);
  for (let i = 0; i < 14; i++) balls.push({ x: random(W), y: random(W), vx: random(-0.6, 0.6), vy: random(-0.6, 0.6) });
}

function draw() {
  // 1. двигаем пузыри; они отскакивают от краёв
  for (const b of balls) {
    b.x += b.vx; b.y += b.vy;
    if (b.x < 0 || b.x > W) b.vx *= -1;
    if (b.y < 0 || b.y > W) b.vy *= -1;
  }
  // мышь — первый пузырь (pointer() сам плавно водит его, пока мышь не трогали)
  const m = pointer();
  balls[0].x = m.x / width * W;
  balls[0].y = m.y / height * W;

  // 2. для каждой точки считаем поле
  const r = P.radius / 640 * W;
  img.loadPixels();
  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      let field = 0;
      for (let i = 0; i < P.count; i++) {
        const dx = x - balls[i].x, dy = y - balls[i].y;
        field += (r * r) / (dx * dx + dy * dy + 1);   // +1, чтобы не делить на ноль
      }
      // 3. порог: больше 1 — белое. smoothstep делает край чуть мягче, без «лесенки»
      const white = smoothstep(1 - P.edge, 1 + P.edge, field) * 255;
      const k = (y * W + x) * 4;
      img.pixels[k] = img.pixels[k + 1] = img.pixels[k + 2] = white;
      img.pixels[k + 3] = 255;
    }
  }
  img.updatePixels();
  image(img, 0, 0, width, height);
}

function smoothstep(a, b, x) {
  const t = constrain((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}
