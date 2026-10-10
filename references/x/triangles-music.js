// Три треугольника, которые пересоздаются в такт музыке.
// Это не код из видео: я его не видел (кадры не открылись), делаю по твоему описанию.
//
// Как это работает:
// 1. Звук идёт через Web Audio API (он встроен в браузер, отдельная библиотека не нужна).
// 2. AnalyserNode «слушает» звук и отдаёт громкость по частотам. Нас интересуют басы (низкие частоты).
// 3. Когда бас резко подскакивает, считаем это ударом (beat) и рисуем три новых треугольника.
//
// Управление: клик — включить звук (браузер не даёт играть без клика); перетащи на холст свой аудиофайл,
// чтобы играла твоя музыка. Пока файла нет, играет простой встроенный бит.

const P = params({
  sens:   { value: 1.25, min: 1.05, max: 2, step: 0.01, label: 'Чувствительность удара' },
  size:   { value: 260, min: 80, max: 400, step: 5, label: 'Размер, px' },
  trail:  { value: 60, min: 5, max: 255, step: 5, label: 'Шлейф (больше = короче)' },
});

const COLORS = ['#ff5d73', '#ffc857', '#4cc9f0', '#e9ecf5', '#7ae582'];

let triangles = [];     // три треугольника: вершины + цвет
let bass = 0;           // громкость басов, 0..1
let lastBass = 0;       // громкость на прошлом кадре
let ctxA, analyser, data;   // Web Audio
let started = false;
let sourceName = 'встроенный бит';

function setup() {
  createCanvas(720, 720);
  noStroke();
  newTriangles();
}

function draw() {
  background(16, 17, 22, P.trail);   // прозрачность < 255 оставляет шлейф от прошлых кадров

  if (analyser) listen();

  // треугольники слегка «дышат» вместе с басом
  const k = 1 + bass * 0.35;
  triangles.forEach((t) => {
    fill(t.color + 'cc');
    push();
    translate(t.cx, t.cy);
    scale(k);
    triangle(t.p[0][0], t.p[0][1], t.p[1][0], t.p[1][1], t.p[2][0], t.p[2][1]);
    pop();
  });

  if (!started) {
    fill(255, 160);
    textFont('Arial');
    textAlign(CENTER, CENTER);
    textSize(16);
    text('клик — включить звук · перетащи свой аудиофайл', width / 2, height - 30);
  } else {
    fill(255, 90);
    textFont('Arial');
    textAlign(LEFT, BOTTOM);
    textSize(12);
    text('играет: ' + sourceName, 14, height - 12);
  }
}

// Три новых случайных треугольника.
function newTriangles() {
  triangles = [];
  for (let i = 0; i < 3; i++) {
    const s = random(0.5, 1) * P.size;
    const pts = [];
    const a0 = random(TWO_PI);   // общий поворот; вершины раскладываем примерно через 120°, чтобы треугольник не был иглой
    for (let j = 0; j < 3; j++) {
      const a = a0 + j * TWO_PI / 3 + random(-0.5, 0.5);
      const r = s * random(0.6, 1);
      pts.push([cos(a) * r, sin(a) * r]);
    }
    triangles.push({ cx: random(width * 0.2, width * 0.8), cy: random(height * 0.2, height * 0.8), p: pts, color: random(COLORS) });
  }
}

// Слушаем бас: среднее по первым частотным полосам. Резкий скачок = удар.
function listen() {
  analyser.getByteFrequencyData(data);
  let sum = 0;
  for (let i = 0; i < 6; i++) sum += data[i];
  bass = sum / 6 / 255;
  if (bass > 0.35 && bass > lastBass * P.sens) newTriangles();
  lastBass = bass * 0.5 + lastBass * 0.5;     // сглаженное прошлое значение: так удар отличается от ровного гула
}

// ---------- звук ----------
function mousePressed() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;
  if (!started) startAudio();
  else if (ctxA.state === 'suspended') ctxA.resume();
}

function startAudio() {
  ctxA = new (window.AudioContext || window.webkitAudioContext)();
  analyser = ctxA.createAnalyser();
  analyser.fftSize = 256;
  data = new Uint8Array(analyser.frequencyBinCount);
  analyser.connect(ctxA.destination);
  started = true;
  demoBeat();
}

// Встроенный бит: каждые 0.5 с «бочка», между ними «хэт».
let demoTimer = null;
function demoBeat() {
  let next = ctxA.currentTime + 0.1;
  let n = 0;
  demoTimer = setInterval(() => {
    while (next < ctxA.currentTime + 0.2) {   // планируем звуки чуть наперёд
      if (n % 2 === 0) kick(next); else hat(next);
      next += 0.25;
      n++;
    }
  }, 50);
}

function kick(t) {
  const o = ctxA.createOscillator();
  const g = ctxA.createGain();
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.15);   // быстрое падение тона — «бум»
  g.gain.setValueAtTime(1, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  o.connect(g); g.connect(analyser);
  o.start(t); o.stop(t + 0.3);
}

function hat(t) {
  const o = ctxA.createOscillator();
  const g = ctxA.createGain();
  o.type = 'square';
  o.frequency.value = 6000;
  g.gain.setValueAtTime(0.06, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  o.connect(g); g.connect(analyser);
  o.start(t); o.stop(t + 0.05);
}

// Перетащил аудиофайл на холст: декодируем и играем вместо встроенного бита.
window.addEventListener('dragover', (e) => e.preventDefault());
window.addEventListener('drop', async (e) => {
  e.preventDefault();
  const f = e.dataTransfer.files[0];
  if (!f) return;
  if (!started) startAudio();
  clearInterval(demoTimer);                      // выключаем встроенный бит
  const buf = await ctxA.decodeAudioData(await f.arrayBuffer());
  const src = ctxA.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  src.connect(analyser);
  src.start();
  sourceName = f.name;
});
