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
            //data passed by JSON message is object with string values in format ['buy/sell','price','volume']
            //since using batch messaging, can expect ordered array of update values from least to greatest price
            this.updateOrderBook(data);

        }
        //Maintain only most recent ticker
        if (data.type == 'ticker'){
            this.ticker = data;
        }
    }

    updateOrderBook(data){
        let newBids = new Array();
        let newAsks = new Array();

        let i1 = 0, i2 = 0;
        while(i1 < this.bids.length && i2 < Object.keys(data.changes).length){
            if(data.changes[i2][0] == 'sell'){
                break;
            }
            let changesArr = [parseFloat(data.changes[i2][1]),parseFloat(data.changes[i2][2])];

            console.log('i1 = ' + i1 + ' i2 = ' + i2);
            console.log('bids = ' + this.bids[i1]);
            console.log('changes = ' + data.changes);

            if(this.bids[i1][0] == data.changes[i2][1]){
                // if volume is zero, don't include value in array
                
                if(changesArr[1] == 0){
                    console.log('Removing Value ' + changesArr[1]);
                    i1++;
                    i2++;
                    continue;
                }
                newBids.push(changesArr);
                i1++;
                i2++;
                continue;
            }


            if(this.bids[i1][0] < changesArr[0]){
                newBids.push(this.bids[i1]);
                i1++;
                continue;
            }
            if(this.bids[i1][0] > changesArr[0]){
                newBids.push(changesArr);
                i2++;
                continue;
            }

        }

        i1 = 0;
        while(i1 < this.asks.length && i2 < Object.keys(data.changes).length){
            break;
        }
        
        //this.bids = newBids;
        //this.asks = newAsks;
        // Make sure all values from all arrays have been pushed to new arrays
    }

    //Display metrics about the orderbook
    displayOrderBook(){
        console.log(this.ticker);
        //console.log(this.asks);
        //console.log(this.bids);
    }

}

module.exports = OrderBook;