// import dependencies

const WebSocket = require('ws');
const OrderBook = require('./OrderBook');
const OrderBookRecordObject = require('./OrderBookRecordObject');

// create objects
const ob = new OrderBook('BTC-USD');
recordSizeArray = [1,10,50,100,250,500,1000,2500,5000,'full'];
const recordObject = new OrderBookRecordObject(ob, recordSizeArray);

//connect to websocket
const ws = new WebSocket('wss://ws-feed.exchange.coinbase.com', {
  perMessageDeflate: true
});

const subscribeMessage = JSON.stringify({ type: 'subscribe', product_ids: ['BTC-USD'], channels: ['level2_batch',{name : 'ticker', product_ids: ['BTC-USD']}]});

ws.on('open', function open() {
  console.log('Connected');
  ws.send(subscribeMessage);
});

//read websocket data
ws.on('message', function incoming(data) {
  ob.readDataStream(JSON.parse(data));
});

ws.on('error', function error(error) {
  console.error('WebSocket error:', error);
});

//record data after performing computations
setInterval(() => {
  // if orderbook grows extremely large, stop process. 
  if(ob.OrderBookSizeCheck > 10){
    console.log('Size out of bounds. Process exiting.')
    process.exit();
  }

  recordObject.record(ob);
  recordObject.displayRecordObject();
  //ob.displayOrderBook();
}, 1000);