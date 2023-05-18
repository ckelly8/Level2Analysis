// WebSocket server example using the 'ws' library
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('Received message from Program 1:', message);
  });
});
