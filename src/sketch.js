const BG_COLOR = 20;

const BORDER_COLOR_WEAK = 40;
const BORDER_COLOR_MEDIUM = 80;
const BORDER_COLOR_STRONG = 100;

// Two-dimensional array to store selected cell numbers (each sub-array is an independent set)
let selectedCells = [[]]; // Start with one empty set
let currentSetIndex = 0; // Index of the current set being edited

// Track hover animation state for each cell
let cellHoverAnimations = {};

// Track particle animation state for each cell (for lighting up cells with particles)
let cellParticleAnimations = {};

// Particle system
let particles = [];
const PARTICLE_LIFETIME = 20000; // 20 seconds in milliseconds
const PARTICLE_ATTRACTION_DISTANCE = 50; // Distance at which particles are attracted to active dots
const PARTICLE_ORBIT_RADIUS = 30; // Radius at which particles orbit active dots
const PARTICLE_SPAWN_RATE = 0.3; // Probability of spawning a particle each frame (0-1)

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

// Get cell number from grid coordinates (x, y in grid coordinate system)
function getCellNumberFromPosition(x, y, cols, rows, cellW, cellH) {
  // Calculate which cell this position is in
  const col = Math.floor(x / cellW);
  const row = Math.floor(y / cellH);

  // Check bounds
  if (col < 0 || col >= cols || row < 0 || row >= rows) {
    return null;
  }

  // Calculate cell number (row-major order: row * cols + col)
  return row * cols + col;
}

// Get color for a cell based on its index within its set
function getCellColor(cellNumber, setIndex) {
  if (setIndex === undefined) {
    // Find which set contains this cell
    for (let i = 0; i < selectedCells.length; i++) {
      if (selectedCells[i].includes(cellNumber)) {
        setIndex = i;
        break;
      }
    }
    if (setIndex === undefined) {
      return [255, 255, 255]; // Default white if not selected
    }
  }

  // Find the index of this cell within its set
  const currentSet = selectedCells[setIndex];
  const indexInSet = currentSet.indexOf(cellNumber);

  if (indexInSet === -1) {
    return [255, 255, 255]; // Default white if not found
  }

  // Use the index within the set to determine color (each dot gets its own color)
  return DOT_COLORS[indexInSet % DOT_COLORS.length];
}

// Particle class
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.z = random(0, 1); // Depth value (0 = far, 1 = near)
    // Calculate fall speed based on z (higher z = faster fall)
    this.speed = mapRange(this.z, 0, 1, 0.5, 2);
    this.birthTime = millis();
    this.particleId = random(1000000); // Unique ID for this particle
    this.connectedDot = null; // Reference to the active dot this particle is orbiting
    this.orbitAngle = random(TWO_PI); // Starting angle for orbit
    this.orbitSpeed = random(0.02, 0.05); // Speed of orbit
    this.orbitRadius = null; // Will be set to a random value when connecting to a dot
    this.color = [255, 255, 255]; // White by default
    this.attractionMap = {}; // Map of dot cellNumber -> whether this particle will be attracted
  }

  update(cols, rows, cellW, cellH) {
    // Check if particle should be removed (lifetime expired or fell below grid)
    const gridH = cellH * rows;
    if (millis() - this.birthTime > PARTICLE_LIFETIME || this.y > gridH + 50) {
      return false; // Mark for removal
    }

    // Get active dot positions
    const activeDots = this.getActiveDots(cols, rows, cellW, cellH);

    // Check if particle is close to any active dot
    let closestDot = null;
    let closestDist = Infinity;

    for (let dot of activeDots) {
      const dist = distance(this.x, this.y, dot.x, dot.y);
      if (dist < PARTICLE_ATTRACTION_DISTANCE && dist < closestDist) {
        closestDist = dist;
        closestDot = dot;
      }
    }

    if (closestDot) {
      // Each dot has a 70% chance to attract a passing particle
      // Determine this once per particle-dot pair for consistency
      if (!(closestDot.cellNumber in this.attractionMap)) {
        // Use hash of particle ID and cell number for deterministic but random-seeming result
        const hash =
          ((this.particleId * 73856093) ^ (closestDot.cellNumber * 19349663)) %
          100;
        this.attractionMap[closestDot.cellNumber] = hash < 70; // 70% chance
      }
      const willAttract = this.attractionMap[closestDot.cellNumber];

      if (willAttract) {
        // Particle is attracted to an active dot
        if (
          this.connectedDot === null ||
          this.connectedDot.cellNumber !== closestDot.cellNumber
        ) {
          // New connection - update color and assign random orbit radius
          this.connectedDot = closestDot;
          this.color = getCellColor(closestDot.cellNumber, closestDot.setIndex);
          // Random orbit radius between 70% and 130% of base radius
          this.orbitRadius = random(
            PARTICLE_ORBIT_RADIUS * 0.7,
            PARTICLE_ORBIT_RADIUS * 1.3
          );
        }

        // Orbit around the dot
        this.orbitAngle += this.orbitSpeed;
        const targetX = closestDot.x + cos(this.orbitAngle) * this.orbitRadius;
        const targetY = closestDot.y + sin(this.orbitAngle) * this.orbitRadius;

        // Smoothly move towards orbit position
        this.x = lerp(this.x, targetX, 0.1);
        this.y = lerp(this.y, targetY, 0.1);
      } else {
        // Particle is not attracted by this dot (30% chance) - continue falling
        this.connectedDot = null;
        this.orbitRadius = null;
        this.color = [255, 255, 255]; // Reset to white
        this.y += this.speed;
      }
    } else {
      // Particle is falling (not near any dot)
      this.connectedDot = null;
      this.orbitRadius = null; // Reset orbit radius
      this.color = [255, 255, 255]; // Reset to white
      this.y += this.speed;
    }

    return true; // Keep particle alive
  }

  getActiveDots(cols, rows, cellW, cellH) {
    const dots = [];
    // Get dots from all sets
    for (let setIndex = 0; setIndex < selectedCells.length; setIndex++) {
      for (let cellNumber of selectedCells[setIndex]) {
        const col = cellNumber % cols;
        const row = Math.floor(cellNumber / cols);
        const x = (col + 1) * cellW;
        const y = (row + 1) * cellH;
        dots.push({ x, y, cellNumber, setIndex });
      }
    }
    return dots;
  }

  draw() {
    push();
    noStroke();
    // Opacity based on z value (higher z = more opaque, more drastic range)
    const opacity = mapRange(this.z, 0, 1, 20, 255);
    fill(this.color[0], this.color[1], this.color[2], opacity);
    circle(this.x, this.y, 3);
    pop();
  }
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

  // Update particles first (before checking which cells they're in)
  updateParticles(cols, rows, cellW, cellH);

  // Track which cells have particles (reset each frame)
  const cellsWithParticles = new Set();
  for (let particle of particles) {
    const cellNum = getCellNumberFromPosition(
      particle.x,
      particle.y,
      cols,
      rows,
      cellW,
      cellH
    );
    if (cellNum !== null) {
      cellsWithParticles.add(cellNum);
    }
  }

  // Update animation states for cells with particles
  const particleCellAnimationSpeed = 0.1; // Speed of animation (0-1, higher = faster)
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const cellNumber = j * cols + i;
      const hasParticle = cellsWithParticles.has(cellNumber);

      // Initialize animation state if not exists
      if (!cellParticleAnimations[cellNumber]) {
        cellParticleAnimations[cellNumber] = 0;
      }

      // Animate towards 1 if particle is present, towards 0 if not
      if (hasParticle) {
        cellParticleAnimations[cellNumber] = lerp(
          cellParticleAnimations[cellNumber],
          1,
          particleCellAnimationSpeed
        );
      } else {
        cellParticleAnimations[cellNumber] = lerp(
          cellParticleAnimations[cellNumber],
          0,
          particleCellAnimationSpeed
        );
        // Remove from animations if close to 0
        if (cellParticleAnimations[cellNumber] < 0.01) {
          cellParticleAnimations[cellNumber] = 0;
        }
      }
    }
  }

  // First, draw animated backgrounds for cells with particles
  push();
  noStroke();
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const cellNumber = j * cols + i;
      const animationValue = cellParticleAnimations[cellNumber] || 0;

      if (animationValue > 0) {
        // Cell center in grid coordinates
        let x = cellW / 2 + i * cellW;
        let y = cellH / 2 + j * cellH;

        // Animated weak grey color with pulsing effect
        const pulse = sin(frameCount * 0.05 + cellNumber * 0.1) * 0.3 + 0.7; // Pulse between 0.4 and 1.0
        const greyValue = 60; // Weak grey base value (reduced for subtlety)
        const opacity = animationValue * pulse * 40; // Max opacity of 40 (reduced for subtlety)

        fill(greyValue, opacity);
        rectMode(CENTER);
        rect(x, y, cellW, cellH);
      }
    }
  }
  pop();

  // Then, draw all grid cell borders
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

  // Draw particles (already updated earlier)
  drawParticles();

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

  // Base radius animation parameters
  const baseRadiusAnimationSpeed = 0.02; // Base speed of radius pulsing
  const radiusPulseAmount = 0.2; // How much the radius can pulse (20% variation)

  // Calculate animated radius once for all particles (same radius for all)
  const radiusPulse = sin(frameCount * baseRadiusAnimationSpeed);
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

  // Get cell color - find set index if not provided
  let setIndex = undefined;
  for (let i = 0; i < selectedCells.length; i++) {
    if (selectedCells[i].includes(cellNumber)) {
      setIndex = i;
      break;
    }
  }
  const cellColor = getCellColor(cellNumber, setIndex);

  const particleSize = 2;

  push();
  noStroke();
  fill(cellColor[0], cellColor[1], cellColor[2], 200);

  // Draw particles orbiting in circles
  for (let i = 0; i < numParticles; i++) {
    // Each particle starts at a different angle offset
    const angleOffset = (TWO_PI * i) / numParticles;

    // All particles use the same speed to maintain spacing and prevent overlaps
    // Animated angle based on frameCount and same speed for all particles
    const angle = frameCount * individualSpeed + angleOffset;

    // Calculate particle position in circular orbit with same radius for all particles
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

      // Check if this cell is selected in any set
      const isSelected = selectedCells.some((set) => set.includes(cellNumber));

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
          // Find which set this cell belongs to
          let setIndex = -1;
          for (let i = 0; i < selectedCells.length; i++) {
            if (selectedCells[i].includes(cellNumber)) {
              setIndex = i;
              break;
            }
          }
          const cellColor = getCellColor(cellNumber, setIndex);
          strokeWeight(2);
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
          // Find which set this cell belongs to
          let setIndex = -1;
          for (let i = 0; i < selectedCells.length; i++) {
            if (selectedCells[i].includes(cellNumber)) {
              setIndex = i;
              break;
            }
          }
          const cellColor = getCellColor(cellNumber, setIndex);
          strokeWeight(2);
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
  push();
  strokeWeight(1);
  noFill();

  // Draw lines for each set independently
  for (let setIndex = 0; setIndex < selectedCells.length; setIndex++) {
    const currentSet = selectedCells[setIndex];

    // Only draw lines if there are at least 2 cells in this set
    if (currentSet.length < 2) {
      continue;
    }

    // Draw lines connecting selected cells sequentially with gradients within this set
    for (let i = 0; i < currentSet.length - 1; i++) {
      const cellNum1 = currentSet[i];
      const cellNum2 = currentSet[i + 1];

      // Get colors for both cells (using set index)
      const color1 = getCellColor(cellNum1, setIndex);
      const color2 = getCellColor(cellNum2, setIndex);

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
  }

  pop();

  // Draw animated dots moving along the lines
  drawAnimatedDots(cols, rows, cellW, cellH);
}

function drawGradientLine(x1, y1, x2, y2, color1, color2) {
  // Number of segments for smooth gradient
  const segments = 50;

  // Draw thick gradient line
  strokeWeight(5);
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

  // Draw thin black line on top
  strokeWeight(2);
  stroke(0);
  line(x1, y1, x2, y2);
}

function drawAnimatedDots(cols, rows, cellW, cellH) {
  push();
  noStroke();

  const dotSpeed = 0.01; // Speed of dot movement (0-1 per frame)
  const dotSpacing = 0.3; // Spacing between multiple dots (0-1)
  const numDots = 3; // Number of dots per line segment

  // Draw animated dots for each set independently
  for (let setIndex = 0; setIndex < selectedCells.length; setIndex++) {
    const currentSet = selectedCells[setIndex];

    // Only draw dots if there are at least 2 cells in this set
    if (currentSet.length < 2) {
      continue;
    }

    // Draw animated dots for each line segment in this set
    for (let i = 0; i < currentSet.length - 1; i++) {
      const cellNum1 = currentSet[i];
      const cellNum2 = currentSet[i + 1];

      // Get colors for both cells (using set index)
      const color1 = getCellColor(cellNum1, setIndex);
      const color2 = getCellColor(cellNum2, setIndex);

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
  }

  pop();
}

function spawnParticles(cols, rows, cellW, cellH) {
  // Spawn particles at the top of the grid with random x positions
  if (random() < PARTICLE_SPAWN_RATE) {
    const gridW = cellW * cols;
    const x = random(0, gridW);
    const y = -5; // Start slightly above the grid
    // Speed is now calculated from z value in the constructor
    particles.push(new Particle(x, y));
  }
}

function updateParticles(cols, rows, cellW, cellH) {
  // Spawn new particles
  spawnParticles(cols, rows, cellW, cellH);

  // Update all particles and remove dead ones
  particles = particles.filter((particle) => {
    return particle.update(cols, rows, cellW, cellH);
  });
}

function drawParticles() {
  // Draw all particles
  for (let particle of particles) {
    particle.draw();
  }
}

function mousePressed() {
  if (
    window.hoveredCellNumber !== null &&
    window.hoveredCellNumber !== undefined
  ) {
    const cellNum = window.hoveredCellNumber;
    const isShiftPressed = keyIsDown(SHIFT);

    if (isShiftPressed) {
      // Shift+click: Create a new set
      selectedCells.push([cellNum]);
      currentSetIndex = selectedCells.length - 1;
      // Set animation state to full when selected
      cellHoverAnimations[cellNum] = 1;
    } else {
      // Regular click: Add/remove from current set
      const currentSet = selectedCells[currentSetIndex];
      const index = currentSet.indexOf(cellNum);

      if (index > -1) {
        // Remove from current set
        currentSet.splice(index, 1);
        // Reset animation state when deselected
        if (cellHoverAnimations[cellNum] !== undefined) {
          cellHoverAnimations[cellNum] = 0;
        }
      } else {
        // Check if cell is in any other set - if so, remove it first
        for (let i = 0; i < selectedCells.length; i++) {
          if (i !== currentSetIndex) {
            const otherIndex = selectedCells[i].indexOf(cellNum);
            if (otherIndex > -1) {
              selectedCells[i].splice(otherIndex, 1);
              // Reset animation if this was the only set containing it
              if (!selectedCells.some((set) => set.includes(cellNum))) {
                if (cellHoverAnimations[cellNum] !== undefined) {
                  cellHoverAnimations[cellNum] = 0;
                }
              }
            }
          }
        }
        // Add to current set
        currentSet.push(cellNum);
        // Set animation state to full when selected
        cellHoverAnimations[cellNum] = 1;
      }
    }

    // Log for debugging (you can remove this later)
    console.log("Selected cells:", selectedCells);
    console.log("Current set index:", currentSetIndex);
  }
}
