const BG_COLOR = 20;

const BORDER_COLOR_WEAK = 40;
const BORDER_COLOR_MEDIUM = 80;
const BORDER_COLOR_STRONG = 100;

// Array to store selected cell numbers
let selectedCells = [];

// Track hover animation state for each cell
let cellHoverAnimations = {};

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

  const opacityMin = guiParams.crosshairOpacityMin;
  const opacityMax = guiParams.crosshairOpacityMax;
  const animationSpeed = guiParams.crosshairAnimationSpeed;
  const speedVariation = guiParams.crosshairSpeedVariation;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let crossX = (i + 1) * cellW;
      let crossY = (j + 1) * cellH;

      if (i < cols - 1 && j < rows - 1) {
        const hash = (((i * 73856093) ^ (j * 19349663)) % 1000) / 1000;
        const speedMultiplier = mapRange(
          hash,
          0,
          1,
          1 - speedVariation,
          1 + speedVariation
        );
        const individualSpeed = animationSpeed * speedMultiplier;

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

  // Canvas Border
  push();
  stroke(BORDER_COLOR_STRONG);
  strokeWeight(0.5);
  rectMode(CORNER);
  rect(0, 0, gridW, gridH);
  pop();

  // Draw hover circles and handle interactions
  drawCellHoverCircles(cols, rows, cellW, cellH);

  pop(); // End grid coordinate system

  // Use the parameters from the GUI
  // Access variables via guiParams object
  if (guiParams.showCircle) {
    fill(guiParams.red, guiParams.green, guiParams.blue);
    noStroke();
  }
}

function drawCellHoverCircles(cols, rows, cellW, cellH) {
  // Convert mouse position to grid coordinates
  const gridTopLeftX = width / 2 - (cellW * cols) / 2;
  const gridTopLeftY = height / 2 - (cellH * rows) / 2;

  const mouseGridX = mouseX - gridTopLeftX;
  const mouseGridY = mouseY - gridTopLeftY;

  const circleRadius = cellW * 0.2;
  const hoverThreshold = circleRadius * 1.5; // Slightly larger than circle for easier interaction
  const animationSpeed = 0.15; // Speed of animation (0-1, higher = faster)

  let hoveredCell = null;

  // Draw circles and check for hover
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      // Bottom right corner of the cell
      const circleX = (i + 1) * cellW;
      const circleY = (j + 1) * cellH;

      // Calculate cell number (row-major order: row * cols + col)
      const cellNumber = j * cols + i;

      // Check if mouse is hovering over the circle
      const distToCircle = distance(mouseGridX, mouseGridY, circleX, circleY);

      if (distToCircle < hoverThreshold) {
        hoveredCell = cellNumber;

        // Initialize animation state if not exists
        if (!cellHoverAnimations[cellNumber]) {
          cellHoverAnimations[cellNumber] = 0;
        }

        // Animate circle size from 0 to full size
        cellHoverAnimations[cellNumber] = lerp(
          cellHoverAnimations[cellNumber],
          1,
          animationSpeed
        );

        // Calculate animated radius
        const animatedRadius = circleRadius * cellHoverAnimations[cellNumber];

        // Draw hover circle
        push();
        stroke(255);
        fill(BG_COLOR);
        circle(circleX, circleY, animatedRadius * 2);
        pop();
      } else {
        // If not hovering, animate back to 0
        if (cellHoverAnimations[cellNumber] !== undefined) {
          cellHoverAnimations[cellNumber] = lerp(
            cellHoverAnimations[cellNumber],
            0,
            animationSpeed
          );

          // Remove from animations if close to 0
          if (cellHoverAnimations[cellNumber] < 0.01) {
            cellHoverAnimations[cellNumber] = 0;
          }
        }
      }
    }
  }

  // Store hovered cell for click detection
  window.hoveredCellNumber = hoveredCell;

  // Change cursor to pointer when hovering over a circle
  if (hoveredCell !== null) {
    cursor("pointer");
  } else {
    cursor("default");
  }
}

function mousePressed() {
  if (
    window.hoveredCellNumber !== null &&
    window.hoveredCellNumber !== undefined
  ) {
    const cellNum = window.hoveredCellNumber;

    // Toggle cell in array (add if not present, remove if present)
    const index = selectedCells.indexOf(cellNum);
    if (index > -1) {
      selectedCells.splice(index, 1);
    } else {
      selectedCells.push(cellNum);
    }

    // Log for debugging (you can remove this later)
    console.log("Selected cells:", selectedCells);
  }
}
