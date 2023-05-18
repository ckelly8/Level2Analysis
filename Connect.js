const WebSocket = require('ws');

const websocketURL = 'wss://ws-feed.exchange.coinbase.com'; // Coinbase WebSocket URL for the public feed

// Create a WebSocket connection
const ws = new WebSocket(websocketURL);

// Event: Connection established
ws.on('open', () => {
  console.log('Connected to Coinbase WebSocket feed');

  // Subscribe to Level 2 order book feed
  const subscribeMessage = {
    type: 'subscribe',
    product_ids: ['BTC-USD'], // Replace with the desired trading pair
    channels: ['level2']
  };

  ws.send(JSON.stringify(subscribeMessage));
});

// Event: Message received
ws.on('message', (data) => {
  const message = JSON.parse(data);

  if (message.type === 'snapshot') {
    console.log('Bids:', JSON.stringify(message.bids));
    console.log('Asks:', JSON.stringify(message.asks));
  } else if (message.type === 'l2update') {
    console.log('Bids:', JSON.stringify(message.changes.filter(change => change[0] === 'buy')));
    console.log('Asks:', JSON.stringify(message.changes.filter(change => change[0] === 'sell')));
  }
  
});

// Event: Connection closed
ws.on('close', () => {
  console.log('Connection closed');
});

// Event: Error occurred
ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});