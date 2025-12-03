const BG_COLOR = 20;

const BORDER_COLOR_WEAK = 40;
const BORDER_COLOR_MEDIUM = 80;
const BORDER_COLOR_STRONG = 100;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("sketch-container");
  background(BG_COLOR);

  setupGUI();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(BG_COLOR);
  updateGUIParams();

  rectMode(CENTER);
  noFill();

  // Calculate number of columns and rows
  const cols = guiParams.columns;
  const rows = guiParams.rows;

  // Fixed cell size (independent of container dimensions)
  const cellSize = window.innerHeight * (guiParams.cellSize * 0.01); // You can adjust this value or make it a GUI parameter
  const cellW = cellSize;
  const cellH = cellSize;

  // Grid dimensions based on cell size
  const gridW = cellSize * cols;
  const gridH = cellSize * rows;

  // Calculate grid's top-left corner position (accounting for CENTER mode)
  const gridTopLeftX = width / 2 - gridW / 2;
  const gridTopLeftY = height / 2 - gridH / 2;

  // Translate coordinate system to grid's top-left corner
  push();
  translate(gridTopLeftX, gridTopLeftY);

  // Now all coordinates are relative to the grid's coordinate system
  rectMode(CENTER);

  // First, draw all grid cells
  stroke(BORDER_COLOR_WEAK);
  noFill();
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      // Cell center in grid coordinates
      let x = cellW / 2 + i * cellW;
      let y = cellH / 2 + j * cellH;
      rect(x, y, cellW, cellH);
    }
  }

  // Then, draw all crosshairs on top
  push();
  strokeWeight(1);

  // Animate opacity between min and max values
  const opacityMin = guiParams.crosshairOpacityMin;
  const opacityMax = guiParams.crosshairOpacityMax;
  const animationSpeed = guiParams.crosshairAnimationSpeed;
  const speedVariation = guiParams.crosshairSpeedVariation;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      // Bottom-right corner of cell in grid coordinates
      let crossX = (i + 1) * cellW;
      let crossY = (j + 1) * cellH;
      if (i < cols - 1 && j < rows - 1) {
        // Create a deterministic but varied speed multiplier for each crosshair
        // Using a simple hash function based on position to get consistent variation
        const hash = (((i * 73856093) ^ (j * 19349663)) % 1000) / 1000;
        // Map hash to speed multiplier range (e.g., 0.7 to 1.3 for 30% variation)
        const speedMultiplier = mapRange(
          hash,
          0,
          1,
          1 - speedVariation,
          1 + speedVariation
        );
        const individualSpeed = animationSpeed * speedMultiplier;

        // Use sine wave to create smooth oscillation between opacity range
        const opacity = mapRange(
          sin(frameCount * individualSpeed * 0.01),
          -1,
          1,
          opacityMin,
          opacityMax
        );

        stroke(BORDER_COLOR_MEDIUM, opacity * 255);
        drawCrosshair(crossX, crossY, cellSize * 0.2);
      }
    }
  }
  pop();

  // Draw border rectangle around the grid
  push();
  stroke(BORDER_COLOR_STRONG);
  strokeWeight(0.5);
  rectMode(CORNER);
  rect(0, 0, gridW, gridH);
  pop();

  pop(); // End grid coordinate system

  // Use the parameters from the GUI
  // Access variables via guiParams object
  if (guiParams.showCircle) {
    fill(guiParams.red, guiParams.green, guiParams.blue);
    noStroke();
  }
}
