// GUI Configuration and Controls
// This file handles all GUI setup and exposes variables for use in sketch.js

// Parameters object that will be accessible from sketch.js
const guiParams = {
  cellSize: 3,
  columns: 40,
  rows: 24,
  showCircle: true,
  crosshairOpacityMin: 0.3,
  crosshairOpacityMax: 1.0,
  crosshairAnimationSpeed: 5.0,
  crosshairSpeedVariation: 0.3,
};

// UI elements
let sizeSlider, redSlider, greenSlider, blueSlider, showCheckbox, speedSlider;
let sizeLabel, columnLabel, rowLabel;
let crosshairOpacityMinSlider,
  crosshairOpacityMaxSlider,
  crosshairSpeedSlider,
  crosshairSpeedVariationSlider;
let crosshairOpacityMinLabel,
  crosshairOpacityMaxLabel,
  crosshairSpeedLabel,
  crosshairSpeedVariationLabel;

function setupGUI() {
  // Create a container for UI controls
  let controlsDiv = createDiv();
  controlsDiv.parent("sketch-container");
  controlsDiv.class("gui-container");

  // Add logo at the top
  let logo = createImg("/assets/robin_logo_light.svg", "Robin Logo");
  logo.parent(controlsDiv);
  logo.class("gui-logo");

  // Create cell size slider
  sizeLabel = createP(`Cell Size (${guiParams.cellSize}%)`);
  sizeLabel.parent(controlsDiv);
  sizeLabel.class("gui-label");
  sizeSlider = createSlider(1, 30, guiParams.cellSize);
  sizeSlider.parent(controlsDiv);
  sizeSlider.class("gui-slider");
  // Update label when slider value changes
  sizeSlider.input(() => {
    sizeLabel.html(`Cell Size (${sizeSlider.value()}%)`);
  });

  // Create column slider
  columnLabel = createP(`Columns (${guiParams.columns})`);
  columnLabel.parent(controlsDiv);
  columnLabel.class("gui-label");
  columnSlider = createSlider(1, 100, guiParams.columns);
  columnSlider.parent(controlsDiv);
  columnSlider.class("gui-slider");
  // Update label when slider value changes
  columnSlider.input(() => {
    columnLabel.html(`Columns (${columnSlider.value()})`);
  });

  // Create rows slider
  rowLabel = createP(`Rows (${guiParams.rows})`);
  rowLabel.parent(controlsDiv);
  rowLabel.class("gui-label");
  rowSlider = createSlider(1, 100, guiParams.rows);
  rowSlider.parent(controlsDiv);
  rowSlider.class("gui-slider");
  // Update label when slider value changes
  rowSlider.input(() => {
    rowLabel.html(`Rows (${rowSlider.value()})`);
  });

  // Create checkbox for show circle
  showCheckbox = createCheckbox("Show Circle", guiParams.showCircle);
  showCheckbox.parent(controlsDiv);
  showCheckbox.class("gui-checkbox");

  // Create crosshair opacity min slider
  crosshairOpacityMinLabel = createP(
    `Crosshair Opacity Min (${(guiParams.crosshairOpacityMin * 100).toFixed(
      0
    )}%)`
  );
  crosshairOpacityMinLabel.parent(controlsDiv);
  crosshairOpacityMinLabel.class("gui-label");
  crosshairOpacityMinSlider = createSlider(
    0,
    100,
    guiParams.crosshairOpacityMin * 100
  );
  crosshairOpacityMinSlider.parent(controlsDiv);
  crosshairOpacityMinSlider.class("gui-slider");
  crosshairOpacityMinSlider.input(() => {
    crosshairOpacityMinLabel.html(
      `Crosshair Opacity Min (${crosshairOpacityMinSlider.value()}%)`
    );
  });

  // Create crosshair opacity max slider
  crosshairOpacityMaxLabel = createP(
    `Crosshair Opacity Max (${(guiParams.crosshairOpacityMax * 100).toFixed(
      0
    )}%)`
  );
  crosshairOpacityMaxLabel.parent(controlsDiv);
  crosshairOpacityMaxLabel.class("gui-label");
  crosshairOpacityMaxSlider = createSlider(
    0,
    100,
    guiParams.crosshairOpacityMax * 100
  );
  crosshairOpacityMaxSlider.parent(controlsDiv);
  crosshairOpacityMaxSlider.class("gui-slider");
  crosshairOpacityMaxSlider.input(() => {
    crosshairOpacityMaxLabel.html(
      `Crosshair Opacity Max (${crosshairOpacityMaxSlider.value()}%)`
    );
  });

  // Create crosshair animation speed slider
  crosshairSpeedLabel = createP(
    `Crosshair Animation Speed (${guiParams.crosshairAnimationSpeed.toFixed(
      1
    )})`
  );
  crosshairSpeedLabel.parent(controlsDiv);
  crosshairSpeedLabel.class("gui-label");
  crosshairSpeedSlider = createSlider(
    0,
    5,
    guiParams.crosshairAnimationSpeed,
    0.1
  );
  crosshairSpeedSlider.parent(controlsDiv);
  crosshairSpeedSlider.class("gui-slider");
  crosshairSpeedSlider.input(() => {
    crosshairSpeedLabel.html(
      `Crosshair Animation Speed (${crosshairSpeedSlider.value().toFixed(1)})`
    );
  });

  // Create crosshair speed variation slider
  crosshairSpeedVariationLabel = createP(
    `Crosshair Speed Variation (${(
      guiParams.crosshairSpeedVariation * 100
    ).toFixed(0)}%)`
  );
  crosshairSpeedVariationLabel.parent(controlsDiv);
  crosshairSpeedVariationLabel.class("gui-label");
  crosshairSpeedVariationSlider = createSlider(
    0,
    100,
    guiParams.crosshairSpeedVariation * 100,
    1
  );
  crosshairSpeedVariationSlider.parent(controlsDiv);
  crosshairSpeedVariationSlider.class("gui-slider");
  crosshairSpeedVariationSlider.input(() => {
    crosshairSpeedVariationLabel.html(
      `Crosshair Speed Variation (${crosshairSpeedVariationSlider.value()}%)`
    );
  });
}

function updateGUIParams() {
  // Update parameters from UI controls
  guiParams.cellSize = sizeSlider.value();
  guiParams.columns = columnSlider.value();
  guiParams.rows = rowSlider.value();
  guiParams.showCircle = showCheckbox.checked();
  guiParams.crosshairOpacityMin = crosshairOpacityMinSlider.value() / 100;
  guiParams.crosshairOpacityMax = crosshairOpacityMaxSlider.value() / 100;
  guiParams.crosshairAnimationSpeed = crosshairSpeedSlider.value();
  guiParams.crosshairSpeedVariation =
    crosshairSpeedVariationSlider.value() / 100;
}
