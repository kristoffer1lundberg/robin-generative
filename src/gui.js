// GUI Configuration and Controls
// This file handles all GUI setup and exposes variables for use in sketch.js

// Parameters object that will be accessible from sketch.js
const guiParams = {
  circleSize: 50,
  red: 100,
  green: 150,
  blue: 255,
  showCircle: true,
  speed: 1.0,
};

// UI elements
let sizeSlider, redSlider, greenSlider, blueSlider, showCheckbox, speedSlider;

function setupGUI() {
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
  sizeSlider = createSlider(10, 200, guiParams.circleSize);
  sizeSlider.parent(controlsDiv);
  sizeSlider.class("gui-slider");

  // Create label and slider for red
  let redLabel = createP("Red");
  redLabel.parent(controlsDiv);
  redLabel.class("gui-label");
  redSlider = createSlider(0, 255, guiParams.red);
  redSlider.parent(controlsDiv);
  redSlider.class("gui-slider");

  // Create label and slider for green
  let greenLabel = createP("Green");
  greenLabel.parent(controlsDiv);
  greenLabel.class("gui-label");
  greenSlider = createSlider(0, 255, guiParams.green);
  greenSlider.parent(controlsDiv);
  greenSlider.class("gui-slider");

  // Create label and slider for blue
  let blueLabel = createP("Blue");
  blueLabel.parent(controlsDiv);
  blueLabel.class("gui-label");
  blueSlider = createSlider(0, 255, guiParams.blue);
  blueSlider.parent(controlsDiv);
  blueSlider.class("gui-slider");

  // Create checkbox for show circle
  showCheckbox = createCheckbox("Show Circle", guiParams.showCircle);
  showCheckbox.parent(controlsDiv);
  showCheckbox.class("gui-checkbox");

  // Create label and slider for speed
  let speedLabel = createP("Speed");
  speedLabel.parent(controlsDiv);
  speedLabel.class("gui-label");
  speedSlider = createSlider(0, 5, guiParams.speed, 0.1);
  speedSlider.parent(controlsDiv);
  speedSlider.class("gui-slider");
}

function updateGUIParams() {
  // Update parameters from UI controls
  guiParams.circleSize = sizeSlider.value();
  guiParams.red = redSlider.value();
  guiParams.green = greenSlider.value();
  guiParams.blue = blueSlider.value();
  guiParams.showCircle = showCheckbox.checked();
  guiParams.speed = speedSlider.value();
}
