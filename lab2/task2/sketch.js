// Задание 2. График функции шума, изменяющейся во времени.
// По оси X — время (кадры), по оси Y — значение noise(t) в диапазоне [0, 1].
// График прокручивается влево, новое значение дорисовывается справа,
// для сравнения рядом тем же способом построен график random() (пунктиром).

let t = 0;
let noiseHistory = [];
let randomHistory = [];
const graphH = 180;
const marginTop = 60;
const marginBottom = 40;

function setup() {
  createCanvas(700, 460);
}

function draw() {
  background(255);

  noiseHistory.push(noise(t));
  randomHistory.push(random(1));
  if (noiseHistory.length > width) noiseHistory.shift();
  if (randomHistory.length > width) randomHistory.shift();

  drawGraph(marginTop, 'noise(t) — шум Перлина', noiseHistory, color(20, 110, 220));
  drawGraph(marginTop + graphH + 70, 'random(1) — равномерный шум', randomHistory, color(220, 60, 40));

  t += 0.01;
}

function drawGraph(top, label, hist, col) {
  noFill();
  stroke(210);
  strokeWeight(1);
  rect(0, top, width, graphH);

  fill(30);
  noStroke();
  textSize(14);
  text(label, 8, top - 8);

  stroke(col);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let i = 0; i < hist.length; i++) {
    const x = i;
    const y = top + graphH - hist[i] * graphH;
    vertex(x, y);
  }
  endShape();
}

function keyPressed() {
  if (key === 's' || key === 'S') saveCanvas('lab2_task2_graph', 'png');
}
