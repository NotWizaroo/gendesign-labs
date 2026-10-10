// Задание 5. Интерактивная композиция «Порядок и хаос».
//
// Концепция: сетка узлов балансирует между строгим порядком (ровная сетка,
// соединённая линиями) и хаосом (случайное рассеивание). Курсор мыши локально
// «вносит хаос» — узлы рядом с ним разбегаются. Клавиша O переключает общий
// режим (порядок/хаос) для всей сетки, к которому узлы плавно стремятся.
// Клик мышью проигрывает тон, высота которого зависит от текущего уровня
// хаоса (насколько узлы отклонены от исходной сетки) — звук реагирует
// на состояние композиции, а не просто на факт клика.

const cols = 12;
const rows = 9;
let nodes = [];
let img;
let orderMode = true;
let audioCtx;

function preload() {
  img = loadImage('data/sobor.jpg');
}

function setup() {
  createCanvas(900, 675);
  colorMode(HSB, 360, 100, 100, 100);

  const marginX = 60;
  const marginY = 60;
  const stepX = (width - marginX * 2) / (cols - 1);
  const stepY = (height - marginY * 2) / (rows - 1);

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const homeX = marginX + gx * stepX;
      const homeY = marginY + gy * stepY;
      nodes.push({
        homeX, homeY,
        x: homeX, y: homeY,
        chaosX: homeX + random(-220, 220),
        chaosY: homeY + random(-160, 160),
      });
    }
  }
}

function draw() {
  background(10, 10, 8);

  // Фоновое изображение — приглушённое, как текстурная подложка композиции.
  push();
  tint(0, 0, 100, 22);
  image(img, 0, 0, width, height);
  pop();

  let totalDisplacement = 0;

  // Целевая позиция каждого узла зависит от режима, плюс локальное
  // отталкивание от курсора мыши (интерактивность).
  for (const n of nodes) {
    const targetX = orderMode ? n.homeX : n.chaosX;
    const targetY = orderMode ? n.homeY : n.chaosY;

    n.x = lerp(n.x, targetX, 0.05);
    n.y = lerp(n.y, targetY, 0.05);

    const dMouse = dist(mouseX, mouseY, n.x, n.y);
    if (dMouse < 90) {
      const push = map(dMouse, 0, 90, 14, 0);
      const a = atan2(n.y - mouseY, n.x - mouseX);
      n.x += cos(a) * push;
      n.y += sin(a) * push;
    }

    totalDisplacement += dist(n.x, n.y, n.homeX, n.homeY);
  }

  const chaosLevel = constrain(totalDisplacement / nodes.length / 140, 0, 1);

  // Соединительные линии — ярче и «спокойнее» при порядке, тоньше при хаосе.
  stroke(200, 60, 100, map(chaosLevel, 0, 1, 55, 18));
  strokeWeight(1);
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const i = gy * cols + gx;
      if (gx < cols - 1) line(nodes[i].x, nodes[i].y, nodes[i + 1].x, nodes[i + 1].y);
      if (gy < rows - 1) line(nodes[i].x, nodes[i].y, nodes[i + cols].x, nodes[i + cols].y);
    }
  }

  // Узлы — цвет смещён по хаосу: спокойный синий при порядке, тёплый при хаосе.
  noStroke();
  for (const n of nodes) {
    const hue = lerp(205, 15, chaosLevel);
    fill(hue, 75, 95);
    circle(n.x, n.y, 8);
  }

  // Текст: заголовок и текущий уровень хаоса.
  noStroke();
  fill(0, 0, 100, 90);
  textAlign(LEFT, TOP);
  textSize(20);
  text('ПОРЯДОК И ХАОС', 24, 20);
  textSize(13);
  text(
    `режим: ${orderMode ? 'порядок (O — переключить)' : 'хаос (O — переключить)'}\n` +
    `уровень хаоса: ${nf(chaosLevel * 100, 1, 0)}%   ЛКМ — звук   S — сохранить кадр`,
    24, 48
  );
}

function keyPressed() {
  if (key === 'o' || key === 'O') orderMode = !orderMode;
  if (key === 's' || key === 'S') saveCanvas('task5_order_chaos', 'png');
}

function mousePressed() {
  playChaosTone();
}

// Простой звук на чистом Web Audio API: высота тона зависит от уровня хаоса
// на момент клика (выше хаос — выше и «резче» звук), короткая огибающая
// громкости, чтобы не звучало как жёсткий щелчок.
function playChaosTone() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  let totalDisplacement = 0;
  for (const n of nodes) totalDisplacement += dist(n.x, n.y, n.homeX, n.homeY);
  const chaosLevel = constrain(totalDisplacement / nodes.length / 140, 0, 1);

  const freq = lerp(220, 660, chaosLevel);
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = chaosLevel > 0.5 ? 'sawtooth' : 'sine';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);
}
