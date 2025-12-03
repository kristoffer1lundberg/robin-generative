function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("sketch-container");
  background(220);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // Your p5.js code here
  fill(100, 150, 255);
  noStroke();
  ellipse(mouseX, mouseY, 50, 50);
}
