function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
}

function draw() {
  background(20);

  noFill();
  stroke(255, 200);
  strokeWeight(1);

  for (let i = 0; i < 200; i++) {
    let x = random(width);
    let y = random(height);
    let r = random(10, 80);
    ellipse(x, y, r, r);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}

function mousePressed() {
  redraw();
}
