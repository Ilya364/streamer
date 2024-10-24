const express = require('express');
require('dotenv').config();
const app = express();
const { proxy } = require('rtsp-relay')(app);

const port = process.env.PORT || 2000;

// Define the RTSP stream URLs using environment variables
const streams = {
  visual: process.env.VISUAL_STREAM_URL || 'rtsp://admin:Abc.12345@192.168.1.64/ch0/stream0',
  thermal: process.env.THERMAL_STREAM_URL || 'rtsp://admin:Abc.12345@192.168.1.64/ch1/stream0'
};

// Log the stream URLs
console.log('Visual Stream URL:', streams.visual);
console.log('Thermal Stream URL:', streams.thermal);

// Create handlers for both streams
const handlers = {
  visual: proxy({
    url: streams.visual,
    verbose: true, // Enable verbose logging for the proxy
    onError: (error) => {
      console.error('Error in visual stream proxy:', error);
    },
  }),
  thermal: proxy({
    url: streams.thermal,
    verbose: true, // Enable verbose logging for the proxy
    onError: (error) => {
      console.error('Error in thermal stream proxy:', error);
    },
  })
};

// WebSocket endpoints for the video streams
app.ws('/api/stream/visual', handlers.visual);
app.ws('/api/stream/thermal', handlers.thermal);

// Log when WebSocket connections are made
app.ws('/api/stream/visual', (ws) => {
  console.log('WebSocket connection established for visual stream');
  ws.on('close', () => {
    console.log('WebSocket connection closed for visual stream');
  });
});

app.ws('/api/stream/thermal', (ws) => {
  console.log('WebSocket connection established for thermal stream');
  ws.on('close', () => {
    console.log('WebSocket connection closed for thermal stream');
  });
});

// Serve a simple HTML page to view both streams
app.get('/', (req, res) => {
  res.send(`
    <h2>Visual Stream</h2>
    <canvas id='visual-canvas'></canvas>
    <h2>Thermal Stream</h2>
    <canvas id='thermal-canvas'></canvas>
    <script src='https://cdn.jsdelivr.net/gh/phoboslab/jsmpeg@master/jsmpeg.min.js'></script>
    <script>
      new JSMpeg.Player('ws://' + location.host + '/api/stream/visual', {
        canvas: document.getElementById('visual-canvas'),
        autoplay: true,
        audio: false,
        loop: true
      });
      new JSMpeg.Player('ws://' + location.host + '/api/stream/thermal', {
        canvas: document.getElementById('thermal-canvas'),
        autoplay: true,
        audio: false,
        loop: true
      });
    </script>
  `);
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`RTSP to Web Stream server is running at http://localhost:${port}`);
});

// Log any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Log any unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
