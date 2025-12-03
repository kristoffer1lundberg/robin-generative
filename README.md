# p5.js Project

A simple p5.js project setup.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

4. Start coding in `src/sketch.js`

## Project Structure

```
robin-generative/
├── src/
│   ├── index.html    - Main HTML file with p5.js CDN link
│   ├── sketch.js     - Your p5.js sketch code
│   └── style.css     - Styling for the page
├── server.js          - Express server for local development
└── package.json       - Node.js dependencies and scripts
```

## p5.js Reference

Visit [p5js.org](https://p5js.org/reference/) for the full p5.js documentation.

## Development

The project includes an Express server. Run `npm start` to start the server on port 3000.

Alternatively, you can use other local servers:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js http-server
npx http-server
```

