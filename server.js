const express = require('express');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');

const app = express();
const PORT = process.env.PORT || 3000;

// Store connected clients for Server-Sent Events
const clients = new Set();

// Watch for file changes in src directory
const watcher = chokidar.watch(path.join(__dirname, 'src'), {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
});

watcher.on('change', (filePath) => {
  console.log(`File changed: ${filePath}`);
  // Notify all connected clients to reload
  clients.forEach(client => {
    client.write(`data: reload\n\n`);
  });
});

// SSE endpoint for live reload
app.get('/reload', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Add client to the set
  clients.add(res);

  // Send initial connection message
  res.write(`data: connected\n\n`);

  // Remove client when connection closes
  req.on('close', () => {
    clients.delete(res);
  });
});

// Custom route for index.html with reload script injection
app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'src', 'index.html');
  fs.readFile(htmlPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading index.html');
    }
    const reloadScript = `
    <script>
      (function() {
        const eventSource = new EventSource('/reload');
        eventSource.onmessage = function(event) {
          if (event.data === 'reload') {
            eventSource.close();
            window.location.reload();
          }
        };
        eventSource.onerror = function() {
          eventSource.close();
        };
      })();
    </script>`;
    const modifiedHtml = data.replace('</body>', reloadScript + '\n  </body>');
    res.send(modifiedHtml);
  });
});

// Serve static files from the src directory
app.use(express.static(path.join(__dirname, 'src')));

// Serve static files from the assets directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Open your browser and navigate to http://localhost:${PORT}`);
    console.log(`Auto-reload enabled - changes will refresh the browser automatically`);
});

