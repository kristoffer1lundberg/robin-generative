function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("sketch-container");
  background(20);

  // Setup GUI controls
  setupGUI();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  updateGUIParams();

  rectMode(CENTER);
  noFill();

  // Calculate number of columns and rows
  const cols = 30;
  const rows = 20;

  // Fixed cell size (independent of container dimensions)
  const cellSize = 40; // You can adjust this value or make it a GUI parameter
  const cellW = cellSize;
  const cellH = cellSize;

  // Grid dimensions based on cell size
  const gridW = cellSize * cols;
  const gridH = cellSize * rows;

  // Top-left offset to center the grid
  const x0 = width / 2 - gridW / 2;
  const y0 = height / 2 - gridH / 2;

  // First, draw all grid cells
  stroke(60);
  noFill();
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = x0 + i * cellW;
      let y = y0 + j * cellH;
      rect(x, y, cellW, cellH);
    }
  }

  // Then, draw all crosshairs on top
  push();
  stroke(255, 100, 50);
  strokeWeight(1);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = x0 + i * cellW;
      let y = y0 + j * cellH;
      // Draw a crosshair at the bottom right of every cell
      // Since x,y is the center (CENTER mode), bottom-right corner is at (x + cellW/2, y + cellH/2)
      let crossX = x + cellW / 2;
      let crossY = y + cellH / 2;
      drawCrosshair(crossX, crossY, 12);
    }
  }
  pop();

  // Draw a rectangle around the grid with a stronger border color
  // Account for CENTER mode: cells are centered at their positions
  push();
  stroke(255);
  strokeWeight(1);
  rectMode(CORNER);
  // Adjust for CENTER mode: subtract half cell size from top-left, add half cell size to dimensions
  rect(x0 - cellW / 2, y0 - cellH / 2, gridW, gridH);
  pop();

  // Use the parameters from the GUI
  // Access variables via guiParams object
  if (guiParams.showCircle) {
    fill(guiParams.red, guiParams.green, guiParams.blue);
    noStroke();
  }
}
