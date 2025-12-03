const BG_COLOR = 20;

const BORDER_COLOR_WEAK = 40;
const BORDER_COLOR_MEDIUM = 80;
const BORDER_COLOR_STRONG = 100;

// Array to store selected cell numbers
let selectedCells = [];

// Track hover animation state for each cell
let cellHoverAnimations = {};

// Color palette for active dots
const DOT_COLORS = [
  [255, 100, 100], // Red
  [100, 255, 100], // Green
  [100, 100, 255], // Blue
  [255, 255, 100], // Yellow
  [255, 100, 255], // Magenta
  [100, 255, 255], // Cyan
  [255, 150, 50], // Orange
  [150, 100, 255], // Purple
  [255, 200, 100], // Peach
  [100, 200, 255], // Light Blue
];

// Get color for a cell based on its index in selectedCells
function getCellColor(cellNumber) {
  const index = selectedCells.indexOf(cellNumber);
  if (index === -1) {
    return [255, 255, 255]; // Default white if not selected
  }
  return DOT_COLORS[index % DOT_COLORS.length];
}

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

  // Draw lines connecting selected cells sequentially (draw first so circles appear on top)
  drawSelectedCellLines(cols, rows, cellW, cellH);

  // Draw hover circles and handle interactions (draw last so they appear on top of lines)
  drawCellHoverCircles(cols, rows, cellW, cellH);

  pop(); // End grid coordinate system

  // Use the parameters from the GUI
  // Access variables via guiParams object
  if (guiParams.showCircle) {
    fill(guiParams.red, guiParams.green, guiParams.blue);
    noStroke();
  }
}

function drawAnimatedGlow(x, y, baseRadius, col, row, cellNumber) {
  // Use hash function similar to crosshairs to generate unique values per cell
  const hash = (((col * 73856093) ^ (row * 19349663)) % 1000) / 1000;

  // Vary animation speed based on hash (similar to crosshairs)
  const speedVariation = 0.5; // How much speed can vary (0.5 = 50% variation)
  const baseSpeed = 0.04;
  const speedMultiplier = mapRange(
    hash,
    0,
    1,
    1 - speedVariation,
    1 + speedVariation
  );
  const individualSpeed = baseSpeed * speedMultiplier;

  // Vary orbit radius based on hash (using a different mapping for variety)
  const radiusHash = (((col * 19349663) ^ (row * 73856093)) % 1000) / 1000;
  const radiusVariation = 0.3; // How much radius can vary
  const baseOrbitRadius = baseRadius * 1.5;
  const staticOrbitRadius =
    baseOrbitRadius *
    mapRange(radiusHash, 0, 1, 1 - radiusVariation, 1 + radiusVariation);

  // Animate the orbit radius with a pulsing effect
  const radiusAnimationSpeed = 0.02; // Speed of radius pulsing
  const radiusPulseAmount = 0.2; // How much the radius can pulse (20% variation)
  const radiusPulse = sin(frameCount * radiusAnimationSpeed);
  const animatedOrbitRadius =
    staticOrbitRadius *
    mapRange(radiusPulse, -1, 1, 1 - radiusPulseAmount, 1 + radiusPulseAmount);

  // Vary number of particles based on hash (using yet another mapping)
  const particleHash = (((col * 56473829) ^ (row * 92837465)) % 1000) / 1000;
  const minParticles = 4;
  const maxParticles = 8;
  const numParticles = Math.floor(
    mapRange(particleHash, 0, 1, minParticles, maxParticles + 1)
  );

  // Get cell color
  const cellColor = getCellColor(cellNumber);

  const particleSize = 2;

  push();
  noStroke();
  fill(cellColor[0], cellColor[1], cellColor[2], 200);

  // Draw particles orbiting in circles
  for (let i = 0; i < numParticles; i++) {
    // Each particle starts at a different angle offset
    const angleOffset = (TWO_PI * i) / numParticles;

    // Add individual speed variation for each particle
    const particleSpeedVariation = 0.3; // How much each particle's speed can vary
    const particleHash = ((i * 73856093) % 1000) / 1000;
    const particleSpeedMultiplier = mapRange(
      particleHash,
      0,
      1,
      1 - particleSpeedVariation,
      1 + particleSpeedVariation
    );
    const particleSpeed = individualSpeed * particleSpeedMultiplier;

    // Animated angle based on frameCount and individual particle speed
    const angle = frameCount * particleSpeed + angleOffset;

    // Calculate particle position in circular orbit with animated radius
    const particleX = x + cos(angle) * animatedOrbitRadius;
    const particleY = y + sin(angle) * animatedOrbitRadius;

    // Draw the particle
    circle(particleX, particleY, particleSize);
  }

  pop();
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

      // Check if this cell is selected
      const isSelected = selectedCells.includes(cellNumber);

      // Check if mouse is hovering over the circle
      const distToCircle = distance(mouseGridX, mouseGridY, circleX, circleY);

      if (distToCircle < hoverThreshold) {
        hoveredCell = cellNumber;

        // Initialize animation state if not exists
        if (!cellHoverAnimations[cellNumber]) {
          cellHoverAnimations[cellNumber] = 0;
        }

        // Animate circle size from 0 to full size (only if not selected)
        if (!isSelected) {
          cellHoverAnimations[cellNumber] = lerp(
            cellHoverAnimations[cellNumber],
            1,
            animationSpeed
          );
        } else {
          // Keep selected cells at full size
          cellHoverAnimations[cellNumber] = 1;
        }

        // Calculate animated radius
        const animatedRadius = circleRadius * cellHoverAnimations[cellNumber];

        // Draw animated glow if selected
        if (isSelected) {
          drawAnimatedGlow(circleX, circleY, circleRadius, i, j, cellNumber);
        }

        // Draw hover circle
        push();
        if (isSelected) {
          const cellColor = getCellColor(cellNumber);
          stroke(cellColor[0], cellColor[1], cellColor[2]);
          fill(0);
        } else {
          stroke(255, 255, 255);
          fill(BG_COLOR);
        }
        circle(circleX, circleY, animatedRadius * 2);
        pop();
      } else {
        // If selected, keep circle visible at full size
        if (isSelected) {
          cellHoverAnimations[cellNumber] = 1;

          // Draw animated glow behind selected circle
          drawAnimatedGlow(circleX, circleY, circleRadius, i, j, cellNumber);

          // Draw selected circle
          push();
          const cellColor = getCellColor(cellNumber);
          stroke(cellColor[0], cellColor[1], cellColor[2]);
          fill(0);
          circle(circleX, circleY, circleRadius * 2);
          pop();
        } else {
          // If not hovering and not selected, animate back to 0
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

function drawSelectedCellLines(cols, rows, cellW, cellH) {
  // Only draw lines if there are at least 2 selected cells
  if (selectedCells.length < 2) {
    return;
  }

  push();
  strokeWeight(1);
  noFill();

  // Draw lines connecting selected cells sequentially with gradients
  for (let i = 0; i < selectedCells.length - 1; i++) {
    const cellNum1 = selectedCells[i];
    const cellNum2 = selectedCells[i + 1];

    // Get colors for both cells
    const color1 = getCellColor(cellNum1);
    const color2 = getCellColor(cellNum2);

    // Convert cell number to grid coordinates
    const col1 = cellNum1 % cols;
    const row1 = Math.floor(cellNum1 / cols);
    const col2 = cellNum2 % cols;
    const row2 = Math.floor(cellNum2 / cols);

    // Calculate circle positions (bottom-right corner of each cell)
    const x1 = (col1 + 1) * cellW;
    const y1 = (row1 + 1) * cellH;
    const x2 = (col2 + 1) * cellW;
    const y2 = (row2 + 1) * cellH;

    // Draw gradient line by drawing multiple segments
    drawGradientLine(x1, y1, x2, y2, color1, color2);
  }

  pop();

  // Draw animated dots moving along the lines
  drawAnimatedDots(cols, rows, cellW, cellH);
}

function drawGradientLine(x1, y1, x2, y2, color1, color2) {
  // Number of segments for smooth gradient
  const segments = 50;

  for (let i = 0; i < segments; i++) {
    const t1 = i / segments;
    const t2 = (i + 1) / segments;

    // Interpolate position
    const px1 = lerp(x1, x2, t1);
    const py1 = lerp(y1, y2, t1);
    const px2 = lerp(x1, x2, t2);
    const py2 = lerp(y1, y2, t2);

    // Interpolate color (use midpoint for segment color)
    const tMid = (t1 + t2) / 2;
    const r = lerp(color1[0], color2[0], tMid);
    const g = lerp(color1[1], color2[1], tMid);
    const b = lerp(color1[2], color2[2], tMid);

    stroke(r, g, b);
    line(px1, py1, px2, py2);
  }
}

function drawAnimatedDots(cols, rows, cellW, cellH) {
  // Only draw animated dots if there are at least 2 selected cells
  if (selectedCells.length < 2) {
    return;
  }

  push();
  noStroke();

  const dotSpeed = 0.01; // Speed of dot movement (0-1 per frame)
  const dotSpacing = 0.3; // Spacing between multiple dots (0-1)
  const numDots = 3; // Number of dots per line segment

  // Draw animated dots for each line segment
  for (let i = 0; i < selectedCells.length - 1; i++) {
    const cellNum1 = selectedCells[i];
    const cellNum2 = selectedCells[i + 1];

    // Get colors for both cells
    const color1 = getCellColor(cellNum1);
    const color2 = getCellColor(cellNum2);

    // Convert cell number to grid coordinates
    const col1 = cellNum1 % cols;
    const row1 = Math.floor(cellNum1 / cols);
    const col2 = cellNum2 % cols;
    const row2 = Math.floor(cellNum2 / cols);

    // Calculate circle positions (bottom-right corner of each cell)
    const x1 = (col1 + 1) * cellW;
    const y1 = (row1 + 1) * cellH;
    const x2 = (col2 + 1) * cellW;
    const y2 = (row2 + 1) * cellH;

    // Calculate line length for spacing
    const lineLength = distance(x1, y1, x2, y2);
    const segmentLength = lineLength * dotSpacing;

    // Draw multiple dots along the line
    for (let dotIndex = 0; dotIndex < numDots; dotIndex++) {
      // Calculate position along the line with animation
      // Each dot starts at a different offset to create spacing
      const baseOffset = (dotIndex * dotSpacing) % 1;
      const animatedOffset = (frameCount * dotSpeed + baseOffset) % 1;

      // Interpolate position along the line
      const dotX = lerp(x1, x2, animatedOffset);
      const dotY = lerp(y1, y2, animatedOffset);

      // Interpolate color based on position along the line
      const r = lerp(color1[0], color2[0], animatedOffset);
      const g = lerp(color1[1], color2[1], animatedOffset);
      const b = lerp(color1[2], color2[2], animatedOffset);

      // Draw the animated dot with gradient color
      fill(r, g, b);
      const dotSize = 3;
      circle(dotX, dotY, dotSize);
    }
  }

  pop();
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
      // Reset animation state when deselected
      if (cellHoverAnimations[cellNum] !== undefined) {
        cellHoverAnimations[cellNum] = 0;
      }
    } else {
      selectedCells.push(cellNum);
      // Set animation state to full when selected
      cellHoverAnimations[cellNum] = 1;
    }

    // Log for debugging (you can remove this later)
    console.log("Selected cells:", selectedCells);
  }
}
