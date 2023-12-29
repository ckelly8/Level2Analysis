// OrderBoook object for any single product id
class OrderBook{
    constructor(product_id){
        this.product_id = product_id;
        this.asks = new Array();
        this.bids = new Array();
        this.ticker = {};
    }

    //Expects incoming websocket data parsed into JSON format 
    readDataStream(data){
        //Take snapshot data and initialize orderbook
        if (data.type == 'snapshot'){
            this.asks = data.asks.map(row => {
                return row.map(parseFloat);
            });
            this.bids = data.bids.map(row => {
                return row.map(parseFloat);
            });
        }
        //Update orderbook 
        if (data.type == 'l2update'){
            console.log(data);
        }
        //Maintain only most recent ticker
        if (data.type == 'ticker'){
            this.ticker = data;
        }
    }

    //Display metrics about the orderbook
    displayOrderBook(){
        console.log(this.ticker);
        console.log(this.asks);
        console.log(this.bids);
    }

}

module.exports = OrderBook;