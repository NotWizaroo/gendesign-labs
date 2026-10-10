function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
}

function draw() {
background(mouseY / 2, 100, 100);
fill(360 - mouseY / 2, 100, 100);
rect(360, 360, mouseX + 1, mouseX + 1);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}

function mousePressed() {
  redraw();
}
