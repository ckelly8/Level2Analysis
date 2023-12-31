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

        // Merging update array and existing orderbook bid array
        // using modified merge step of merge sort to merge two sorted arrays
        
        // Create new bids array
        let i1 = this.bids.length-1, i2 = 0;
        while(i1 >= 0 && i2 < Object.keys(data.changes).length){

            //order of updates always starts least to greatest and includes 'buy / sell' indicator
            // at first instance of sell, break loop and push any remaining data to new bid array
            if(data.changes[i2][0] == 'sell'){
                break;
            }
            let changesArr = [parseFloat(data.changes[i2][1]),parseFloat(data.changes[i2][2])];
            // if prices match include only update values
            if(this.bids[i1][0] == changesArr[0]){
                console.log('updating value ' + changesArr)

                // if volume is zero, don't include value in array
                if(changesArr[1] == 0){
                    console.log('Removing Value ' + changesArr[0]);
                    i1--;
                    i2++;
                    continue;
                }
                newBids.push(changesArr);
                i1--;
                i2++;
            }

            else if(this.bids[i1][0] < changesArr[0]){
                newBids.push(this.bids[i1]);
                i1--;
            }
            else if(this.bids[i1][0] > changesArr[0]){
                newBids.push(changesArr);
                i2++;
            }
        }

        /* Determine which array still has data left to be pushed */
        
        // if we are at a sell order or if i2 is the size of the update array, 
        // all values from the buy side of update array have been pushed.
        // push only remaining items from previous bid array
        if(i2  == Object.keys(data.changes).length){
            while(i1 >= 0){
                newBids.push(this.bids[i1]);
                i1--;
            }
        }
        else if(data.changes[i2][0] == 'sell'){
            while(i1 >= 0){
                newBids.push(this.bids[i1]);
                i1--;
            }
        }

        // else if we have completely traversed the original bid array but the update array
        // still has values, then push remaining update array values until we hit 'sell' type
        // or until we push all update array values 
        else if(i1 == 0){
            while(i2 < Object.keys(data.changes).length && data.changes[i2][0] != 'sell'){
                let changesArr = [parseFloat(data.changes[i2][1]),parseFloat(data.changes[i2][2])];
                newBids.push(changesArr);
                i2++;
            }
        }
        
        this.bids = newBids;

        i1 = 0;
        while(i1 < this.asks.length && i2 < Object.keys(data.changes).length){
            break;
        }
        
        console.log(this.bids);
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