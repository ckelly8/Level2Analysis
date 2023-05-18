const WebSocket = require('ws');
const express = require('express');

const websocketURL = 'wss://ws-feed.exchange.coinbase.com'; // Coinbase WebSocket URL for the public feed

const app = express();
const port = 8080;

// Create a WebSocket connection
const ws = new WebSocket(websocketURL);

// Trading pairs map
const tradingPairs = {
  'BTC-USD': {
    name: 'BTC-USD',
    bids: new Map(),
    asks: new Map(),
    ticker: null
  },
  'ETH-USD': {
    name: 'ETH-USD',
    bids: new Map(),
    asks: new Map(),
    ticker: null
  },
};

// Event: Connection established
ws.on('open', () => {
  console.log('Connected to Coinbase WebSocket feed');

  // Subscribe to Level 2 order book feed
  const subscribeMessage = {
    type: 'subscribe',
    product_ids: Object.keys(tradingPairs), // Subscribe to all trading pairs
    channels: ['level2', 'ticker']
  };

  ws.send(JSON.stringify(subscribeMessage));
});

// Event: Message received
ws.on('message', (data) => {
  const message = JSON.parse(data);

  if (message.type === 'snapshot') {
    const tradingPair = tradingPairs[message.product_id];

    // Clear existing order book data
    tradingPair.bids.clear();
    tradingPair.asks.clear();

    // Update with snapshot data
    message.bids.forEach(([price, volume]) => {
      tradingPair.bids.set(price, volume);
    });
    message.asks.forEach(([price, volume]) => {
      tradingPair.asks.set(price, volume);
    });

    // Emit the order book data
    emitOrderBookData();
  } else if (message.type === 'l2update') {
    const tradingPair = tradingPairs[message.product_id];

    // Process bid updates
    message.changes
      .filter(change => change[0] === 'buy')
      .forEach(([price, volume]) => {
        if (volume === '0') {
          tradingPair.bids.delete(price);
        } else {
          tradingPair.bids.set(price, volume);
        }
      });

    // Process ask updates
    message.changes
      .filter(change => change[0] === 'sell')
      .forEach(([price, volume]) => {
        if (volume === '0') {
          tradingPair.asks.delete(price);
        } else {
          tradingPair.asks.set(price, volume);
        }
      });

    // Emit the order book data
    emitOrderBookData();
  } else if (message.type === 'ticker') {
    const tradingPair = tradingPairs[message.product_id];
    tradingPair.ticker = {
      bid: message.best_bid,
      ask: message.best_ask,
      price: message.price,
      time: message.time
    };
    // Emit the order book data
    emitOrderBookData();
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

// Emit the order book data to a specific URL
function emitOrderBookData() {
  const orderBookData = {};
  for (const pair in tradingPairs) {
    const tradingPair = tradingPairs[pair];
    orderBookData[tradingPair.name] = {
      bids: [...tradingPair.bids],
      asks: [...tradingPair.asks],
      ticker: tradingPair.ticker
    };
  }
  // Emit the order book data to the specific URL
  app.get('/orderbook', (req, res) => {
    res.json(orderBookData);
  });
}

// Start the HTTP server
app.listen(port, () => {
  console.log(`Emitter program listening at http://localhost:${port}`);
});