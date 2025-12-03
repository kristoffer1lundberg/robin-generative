// Parameters that will be controlled by the GUI
let circleSize = 50;
let red = 100;
let green = 150;
let blue = 255;
let showCircle = true;
let speed = 1.0;

// UI elements
let sizeSlider, redSlider, greenSlider, blueSlider, showCheckbox, speedSlider;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("sketch-container");
  background(20);

  // Create a container for UI controls
  let controlsDiv = createDiv();
  controlsDiv.parent("sketch-container");
  controlsDiv.class("gui-container");

  // Add logo at the top
  let logo = createImg("/assets/robin_logo_light.svg", "Robin Logo");
  logo.parent(controlsDiv);
  logo.class("gui-logo");

  // Create label and slider for circle size
  let sizeLabel = createP("Circle Size");
  sizeLabel.parent(controlsDiv);
  sizeLabel.class("gui-label");
  sizeSlider = createSlider(10, 200, circleSize);
  sizeSlider.parent(controlsDiv);
  sizeSlider.class("gui-slider");

  // Create label and slider for red
  let redLabel = createP("Red");
  redLabel.parent(controlsDiv);
  redLabel.class("gui-label");
  redSlider = createSlider(0, 255, red);
  redSlider.parent(controlsDiv);
  redSlider.class("gui-slider");

  // Create label and slider for green
  let greenLabel = createP("Green");
  greenLabel.parent(controlsDiv);
  greenLabel.class("gui-label");
  greenSlider = createSlider(0, 255, green);
  greenSlider.parent(controlsDiv);
  greenSlider.class("gui-slider");

  // Create label and slider for blue
  let blueLabel = createP("Blue");
  blueLabel.parent(controlsDiv);
  blueLabel.class("gui-label");
  blueSlider = createSlider(0, 255, blue);
  blueSlider.parent(controlsDiv);
  blueSlider.class("gui-slider");

  // Create checkbox for show circle
  showCheckbox = createCheckbox("Show Circle", showCircle);
  showCheckbox.parent(controlsDiv);
  showCheckbox.class("gui-checkbox");

  // Create label and slider for speed
  let speedLabel = createP("Speed");
  speedLabel.parent(controlsDiv);
  speedLabel.class("gui-label");
  speedSlider = createSlider(0, 5, speed, 0.1);
  speedSlider.parent(controlsDiv);
  speedSlider.class("gui-slider");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // Update parameters from UI controls
  circleSize = sizeSlider.value();
  red = redSlider.value();
  green = greenSlider.value();
  blue = blueSlider.value();
  showCircle = showCheckbox.checked();
  speed = speedSlider.value();

  // Use the parameters from the GUI
  if (showCircle) {
    fill(red, green, blue);
    noStroke();
    ellipse(mouseX, mouseY, circleSize, circleSize);
  }
}
