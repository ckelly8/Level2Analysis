const WebSocket = require('ws');
const axios = require('axios');

const pollingURL = 'http://localhost:8080/orderbook'; // URL of the emitted order book data

// Make an HTTP request to the emitted data endpoint
async function pollOrderBookData() {
  try {
    const response = await axios.get(pollingURL);
    const orderBookData = response.data;

    // Process the order book data and calculate the center of mass
    for (const pair in orderBookData) {
      const tradingPair = orderBookData[pair];
      const bids = tradingPair.bids;
      const asks = tradingPair.asks;

      // Calculate the center of mass for bids
      let massSumBids = 0;
      let massXSumBids = 0;

      for (const [price, volume] of bids) {
        const mass = volume;
        const x = price;

        massSumBids += mass;
        massXSumBids += mass * x;
      }

      const centerOfMassBids = massXSumBids / massSumBids;

      // Calculate the center of mass for asks
      let massSumAsks = 0;
      let massXSumAsks = 0;

      for (const [price, volume] of asks) {
        const mass = volume;
        const x = price;

        massSumAsks += mass;
        massXSumAsks += mass * x;
      }

      const centerOfMassAsks = massXSumAsks / massSumAsks;

      console.log(`Center of Mass for ${pair}`);
      console.log(`Bids: ${centerOfMassBids}`);
      console.log(`Asks: ${centerOfMassAsks}`);
    }
  } catch (error) {
    console.error('Error occurred while polling order book data:', error.message);
  }
}

// Poll the order book data periodically
setInterval(() => {
  pollOrderBookData();
}, 10000); // Adjust the interval as needed