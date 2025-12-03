const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the src directory
app.use(express.static(path.join(__dirname, 'src')));

// Serve static files from the assets directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Open your browser and navigate to http://localhost:${PORT}`);
});

