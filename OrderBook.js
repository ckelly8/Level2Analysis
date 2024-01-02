// OrderBoook object for any single product id
class OrderBook{
    constructor(product_id){
        this.product_id = product_id;
        this.asks = new Array();
        this.bids = new Array();
        this.ticker = {};
        this.recordValues = {
            tickerPrice : null,
            totalCOM : null,
            fullBidCOM : null,
            fullAskCOM : null,
            combined10COM : null,
            bid10COM : null,
            ask10COM : null,
            combined50COM : null,
            bid50COM : null,
            ask50COM : null,
            coombined100COM : null,
            bid100COM : null,
            ask100COM : null,
        };
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

    // Restructuring the update message to split buy and sell into separate arrays 
    // and change data type to float
    restructureUpdateData(updateData){
        function quickSort2DArray(array) {
            array.sort((a, b) => {
                return a[0] - b[0];
            });
        }

        let bidsUpdate = new Array();
        let asksUpdate = new Array();

        for(let i = 0; i < updateData.length; i++){
            if(updateData[i][0] == 'buy'){
                bidsUpdate.push([parseFloat(updateData[i][1]),parseFloat(updateData[i][2])])
            }
            if(updateData[i][0] == 'sell'){
                asksUpdate.push([parseFloat(updateData[i][1]),parseFloat(updateData[i][2])])
            }
        }
        
        // Sorting updates as they are not guaranteed to be sorted already
        quickSort2DArray(bidsUpdate);
        quickSort2DArray(asksUpdate);

        //reversing bids update data to match format of greatest to least from snapshot
        bidsUpdate.reverse();

        return {bidsUpdate, asksUpdate};
    }

    updateOrderBook(data){
        let newBids = new Array();
        let newAsks = new Array();

        let updateData = this.restructureUpdateData(data.changes);
        let bidsUpdate = updateData.bidsUpdate;
        let asksUpdate = updateData.asksUpdate;

        // track sum used for center of mass 
        // using in build process to reduce number of loops
        let volumeSum = 0;
        let initPrice = 0;
        let finalPrice = 0;
        let volumeCount = 0;

        // Merging update array and existing orderbook bid array
        // using modified merge step of merge sort to merge two sorted arrays
        let i1 = 0, i2 = 0;
        while(i1 < this.bids.length && i2 < bidsUpdate.length){

            // case where update value is zero volume and greater price. No match will be found.
            // ignore value and continue
            if(bidsUpdate[i2][1] == 0 && bidsUpdate[i2][0] > this.bids[i1][0]){
                //console.log('update value with no match ' + bidsUpdate[i2]);
                i2++;
                continue;
            }

            // if prices match - remove if 0 and update if > 0 
            if(this.bids[i1][0] == bidsUpdate[i2][0]){

                // if volume is zero, don't include value in array
                if(bidsUpdate[i2][1] == 0){
                    //console.log('Removing Value ' + bidsUpdate[i2]);
                    i1++;
                    i2++;
                }
                else if(bidsUpdate[i2][1] != 0){
                    //console.log('replacing value ' + bidsUpdate[i2])
                    newBids.push(bidsUpdate[i2]);
                    volumeSum += bidsUpdate[i2][1];
                    volumeCount++;
                    i1++;
                    i2++;
                }
            }

            else if(this.bids[i1][0] > bidsUpdate[i2][0]){
                newBids.push(this.bids[i1]);
                volumeSum += this.bids[i1][1];
                volumeCount++;
                i1++;
            }
            else if(this.bids[i1][0] < bidsUpdate[i2][0]){
                newBids.push(bidsUpdate[i2]);
                volumeSum += bidsUpdate[i2][1];
                volumeCount++;
                i2++;
            }
            this.checkVolume(volumeCount);
        }
       
        // Push remaining data from the array not fully traversed
        while(i1 < this.bids.length){
            newBids.push(this.bids[i1]);
            volumeSum += this.bids[i2][1];
            volumeCount++;
            i1++;
        }
        while(i2 < bidsUpdate.length){
            newBids.push(bidsUpdate[i2]);
            volumeSum += bidsUpdate[i2][1];
            volumeCount++;
            i2++;
        }

        this.totalCOM = findTotalCOM();

        i1 = 0, i2 = 0;
        while(i1 < this.asks.length && i2 < asksUpdate.length){

            // case where update value is zero volume and lesser price. No match will be found.
            // ignore value and continue
            if(asksUpdate[i2][1] == 0 && asksUpdate[i2][0] < this.asks[i1][0]){
                //console.log('update value with no match ' + asksUpdate[i2]);
                i2++;
                continue;
            }

            // if prices match - remove if 0 and update if > 0 
            if(this.asks[i1][0] == asksUpdate[i2][0]){

                // if volume is zero, don't include value in array
                if(asksUpdate[i2][1] == 0){
                    //console.log('Removing Value ' + bidsUpdate[i2]);
                    i1++;
                    i2++;
                }
                else if(asksUpdate[i2][1] != 0){
                    //console.log('replacing value ' + bidsUpdate[i2])
                    newAsks.push(asksUpdate[i2]);
                    i1++;
                    i2++;
                }
            }

            else if(this.asks[i1][0] < asksUpdate[i2][0]){
                newAsks.push(this.asks[i1]);
                i1++;
            }
            else if(this.asks[i1][0] > asksUpdate[i2][0]){
                newAsks.push(asksUpdate[i2]);
                i2++;
            }
        }
        // Push remaining data from the array not fully traversed
        while(i1 < this.asks.length){
            newAsks.push(this.asks[i1]);
            i1++;
        }
        while(i2 < asksUpdate.length){
            newAsks.push(asksUpdate[i2]);
            i2++;
        }

        this.bids = newBids;
        this.asks = newAsks;
    
    }

    recordData(){
        
        this.recordValues.tickerPrice = parseFloat(this.ticker.price);

    }

    computeCOM(volumeSum,leastPrice,greatestPrice){
        //distance along 'linear mass' of orderbook is defined by difference
        // between least and greatest prices

        // Formula for center of mass for linear mass with discrete masses 
        // at known positions is: X_cm = sum(m_i*x_i) / sum(m_i)

        let COM = null;


    }

    checkVolume(volumeCount){
        if(volumeCount == 10){
            this.computeCOM(10);
        }
        else if(volumeCount == 50){
            this.computeCOM(50);
        }
        else if(volumeCount == 100){
            this.computeCOM(100);
        }
    }
    //Display metrics about the orderbook
    displayOrderBook(){
        console.log(this.ticker);
        //console.log(this.asks);
        //console.log(this.bids);
    }

}

module.exports = OrderBook;