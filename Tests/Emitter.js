// Program 1 - Emitter

const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');  // WebSocket server URL

function sendMessage() {
  const jsonData = {
    message: 'Hello from Program 1!'
  };

  ws.send(JSON.stringify(jsonData));
}

setInterval(sendMessage, 1000);  // Send message every second
