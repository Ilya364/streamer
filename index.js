const express = require("express");
require("dotenv").config();
const app = express();
const { proxy } = require("rtsp-relay")(app);

const port = process.env.PORT || 2000;

// Define the RTSP stream URLs using environment variables
const streams = {
  visual:
    process.env.VISUAL_STREAM_URL ||
    "rtsp://admin:Abc.12345@192.168.31.60V/ch0/stream0",
  thermal:
    process.env.THERMAL_STREAM_URL ||
    "rtsp://admin:Abc.12345@192.168.31.60/ch1/stream0",
};

console.log("Starting server with configuration:");
console.log("Port:", port);
console.log("Visual Stream URL:", streams.visual);
console.log("Thermal Stream URL:", streams.thermal);

// Create handlers for both streams
const handlers = {
  visual: proxy({
    url: streams.visual,
    verbose: true,
    transport: "tcp",
  }),
  thermal: proxy({
    url: streams.thermal,
    verbose: true,
    transport: "tcp",
  }),
};

// Serve a simple HTML page with better error handling
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>RTSP Streams</title>
      <style>
        .stream-container { margin: 20px; }
        canvas { border: 1px solid #ccc; }
        .error { color: red; display: none; }
      </style>
    </head>
    <body>
      <div class="stream-container">
        <h2>Visual Stream</h2>
        <canvas id='visual-canvas'></canvas>
        <div id="visual-error" class="error">Failed to connect to visual stream</div>
      </div>
      
      <div class="stream-container">
        <h2>Thermal Stream</h2>
        <canvas id='thermal-canvas'></canvas>
        <div id="thermal-error" class="error">Failed to connect to thermal stream</div>
      </div>
      
      <script src='https://cdn.jsdelivr.net/gh/phoboslab/jsmpeg@master/jsmpeg.min.js'></script>
      <script>
        function createPlayer(url, canvasId, errorId) {
          const player = new JSMpeg.Player(url, {
            canvas: document.getElementById(canvasId),
            autoplay: true,
            audio: false,
            loop: true,
            onSourceEstablished: () => {
              console.log('Stream connected:', canvasId);
              document.getElementById(errorId).style.display = 'none';
            },
            onSourceCompleted: () => {
              console.log('Stream ended:', canvasId);
              document.getElementById(errorId).style.display = 'block';
            },
            onStalled: () => {
              console.log('Stream stalled:', canvasId);
              document.getElementById(errorId).style.display = 'block';
            }
          });
          return player;
        }

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsBase = wsProtocol + '//' + location.host;

        createPlayer(wsBase + '/api/stream/visual', 'visual-canvas', 'visual-error');
        createPlayer(wsBase + '/api/stream/thermal', 'thermal-canvas', 'thermal-error');
      </script>
    </body>
    </html>
  `);
});

// WebSocket endpoints
app.ws("/api/stream/visual", handlers.visual);
app.ws("/api/stream/thermal", handlers.thermal);

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`WebSocket endpoints:`);
  console.log(`- Visual: ws://localhost:${port}/api/stream/visual`);
  console.log(`- Thermal: ws://localhost:${port}/api/stream/thermal`);
});

// Error handling
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
