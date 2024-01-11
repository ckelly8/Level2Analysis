// import dependencies

const WebSocket = require('ws');
const OrderBook = require('./OrderBook');
const OrderBookRecordObject = require('./OrderBookRecordObject');

// create objects
const ob = new OrderBook('BTC-USD');
recordSizeArray = [1,10,50,100,250,500,1000,2500,5000,'full'];
const recordObject = new OrderBookRecordObject(ob, recordSizeArray);

function connectWebSocket() {
  const ws = new WebSocket('wss://ws-feed.exchange.coinbase.com', {
    perMessageDeflate: true
  });

  const subscribeMessage = JSON.stringify({ 
    type: 'subscribe', 
    product_ids: ['BTC-USD'], 
    channels: ['level2_batch', { name: 'ticker', product_ids: ['BTC-USD'] }]
  });

  let pingInterval;

  ws.on('open', function open() {
    console.log('Connected');
    ws.send(subscribeMessage);
    startHeartbeat();
  });

  ws.on('message', function incoming(data) {
    ob.readDataStream(JSON.parse(data));
    // Reset the ping interval on any message received
    clearInterval(pingInterval);
    startHeartbeat();
  });

  ws.on('error', function error(error) {
    console.error('WebSocket error:', error);
    stopHeartbeat();
  });

  ws.on('close', function close() {
    console.log('WebSocket closed. Reconnecting...');
    stopHeartbeat();
    setTimeout(connectWebSocket, 5000); // Reconnect after 5 seconds
  });

  function startHeartbeat() {
    pingInterval = setInterval(function() {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('ping');
      } else {
        clearInterval(pingInterval);
      }
    }, 30000); // Send a ping every 30 seconds
  }

  function stopHeartbeat() {
    clearInterval(pingInterval);
  }
}

connectWebSocket();

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