// import dependencies
const WebSocket = require('ws');
const OrderBook = require('./OrderBook')

const ws = new WebSocket('wss://ws-feed.exchange.coinbase.com', {
  perMessageDeflate: true
});

const subscribeMessage = JSON.stringify({ type: 'subscribe', product_ids: ['BTC-USD'], channels: ['level2_batch','heartbeat',{name : 'ticker', product_ids: ['BTC-USD']}]})

ws.on('open', function open() {
  console.log('Connected');
  ws.send(subscribeMessage);
});

ws.on('message', function incoming(data) {
  
  console.log(JSON.parse(data));
});

ws.on('error', function error(error) {
  console.error('WebSocket error:', error);
});