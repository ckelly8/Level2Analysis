const WebSocket = require('ws');

const websocketURL = 'wss://ws-feed.exchange.coinbase.com'; // Coinbase WebSocket URL for the public feed
const pollingURL = 'ws://localhost:8080' // Local port feed to read from

let ws;

// Trading pairs map
// Can add additional pairs as desired
const tradingPairs = {
  'BTC-USD': {
    name: 'BTC-USD',
  }
};

const subscribeMessage = {
  type: 'subscribe',
  product_ids: Object.keys(tradingPairs), // Subscribe to all trading pairs
  channels: ['level2', 'ticker']
};

function connect() {
  ws = new WebSocket(websocketURL);
  const ps = new WebSocket(pollingURL)

  // Event: Connection established
  ws.on('open', () => {
    console.log('Connected to Coinbase WebSocket feed');

    // Subscribe to Level 2 order book feed
    ws.send(JSON.stringify(subscribeMessage));
  });

  // Event: Message received
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    ps.send(JSON.stringify(message))
  });

  // Event: Connection closed
  ws.on('close', () => {
    console.log('Connection closed');
  });

  // Event: Error occurred
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
}

// connect the first time
connect();

// close and reopen connection every 10 minutes
setInterval(() => {
  ws.close();
  connect();
}, 600000);