function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent('sketch-container');
    background(220);
}

function draw() {
    // Your p5.js code here
    fill(100, 150, 255);
    noStroke();
    ellipse(mouseX, mouseY, 50, 50);
}

