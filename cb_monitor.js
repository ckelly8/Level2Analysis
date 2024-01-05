// import dependencies
const AnalyzeOrderBook = require('./AnalyzeOrderBook.js');

const WebSocket = require('ws');
const OrderBook = require('./OrderBook');
const OrderBookRecordObject = require('./OrderBookRecordObject');

const ob = new OrderBook('BTC-USD');
recordSizeArray = [10,50,100,250,1000,'full'];

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
  const recordObject = new OrderBookRecordObject(ob, recordSizeArray);
}, 1000);