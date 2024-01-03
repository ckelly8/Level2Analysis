// import dependencies
const AnalyzeOrderBook = require('./AnalyzeOrderBook.js');

const WebSocket = require('ws');
const OrderBook = require('./OrderBook');

const ob = new OrderBook('BTC-USD');

const ws = new WebSocket('wss://ws-feed.exchange.coinbase.com', {
  perMessageDeflate: true
});

const subscribeMessage = JSON.stringify({ type: 'subscribe', product_ids: ['BTC-USD'], channels: ['level2_batch',{name : 'ticker', product_ids: ['BTC-USD']}]});

ws.on('open', function open() {
  console.log('Connected');
  ws.send(subscribeMessage);
});

ws.on('message', function incoming(data) {
  ob.readDataStream(JSON.parse(data));
});

ws.on('error', function error(error) {
  console.error('WebSocket error:', error);
});

setInterval(() => {
  console.log(AnalyzeOrderBook.computeCOM(ob.bids));
}, 1000);