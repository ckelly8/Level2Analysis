class OrderBookRecordObject{
    constructor(OrderBook,recordSizeArray){
        this.OrderBook = OrderBook;
        this.recordSizeArray = recordSizeArray;
        this.recordObject = {};
        this.initializeRecordObject();
    }

    initializeRecordObject(){
        this.recordObject = this.recordSizeArray.reduce((obj, key) => {
            obj[key] = null;
            return obj;
        }, {});
    }

    // Assumes ordered list of values describing the number of bids / asks 
    // to include in a calculation and the key 'full' at the end to include the full orderbook
    findCOMValues(){
        let asksLength = this.OrderBook.asks.length;
        let bidsLength = this.OrderBook.bids.length;
        
        //check that the ob is initialized and contains values
        if(!asksLength || !bidsLength){
            console.log('OrderBook not initialized');
            return null;
        }

        let mi = 0;
        let xi = 0;
        let sum_mi = 0;
        let sum_mi_xi = 0;
        let COM = 0;

        let i = 0, j = 0;
        while(j < this.recordSizeArray.length){
            if(this.recordSizeArray[j] != 'full' && (asksLength < this.recordSizeArray[j] || bidsLength < this.recordSizeArray[j])){
                console.log('Record value greater than size of array.');
                this.recordObject[this.recordSizeArray[j].toString()] = null;
                break;
            }
            if(this.recordSizeArray[j] != 'full'){
                while(i < this.recordSizeArray[j]){
                    //sums for asks
                    mi = this.OrderBook.asks[i][1];
                    xi = this.OrderBook.asks[i][0];
                    sum_mi += mi;
                    sum_mi_xi += mi*xi;

                    //sums for bids
                    mi = this.OrderBook.bids[i][1];
                    xi = this.OrderBook.bids[i][0];
                    sum_mi += mi;
                    sum_mi_xi += mi*xi;

                    i++;
                }
                COM = (sum_mi_xi / sum_mi);
                this.recordObject[this.recordSizeArray[j].toString()] = COM;
            }

            // full array record introduces assymetry in bid and ask
            // array sizes. This is handled by computing sums for 
            // both arrays then adding remaining items in larger array.
            if(this.recordSizeArray[j] == 'full'){
                
                while(i < asksLength && i < bidsLength){
                    //sums for asks
                    mi = this.OrderBook.asks[i][1];
                    xi = this.OrderBook.asks[i][0];
                    sum_mi += mi;
                    sum_mi_xi += mi*xi;

                    //sums for bids
                    mi = this.OrderBook.bids[i][1];
                    xi = this.OrderBook.bids[i][0];
                    sum_mi += mi;
                    sum_mi_xi += mi*xi;

                    i++;
                }
                while(i < asksLength){
                    //sums for asks
                    mi = this.OrderBook.asks[i][1];
                    xi = this.OrderBook.asks[i][0];
                    sum_mi += mi;
                    sum_mi_xi += mi*xi;
                    i++;
                }
                while(i < bidsLength){
                    //sums for bids
                    mi = this.OrderBook.bids[i][1];
                    xi = this.OrderBook.bids[i][0];
                    sum_mi += mi;
                    sum_mi_xi += mi*xi;
                    i++;
                }

                COM = (sum_mi_xi / sum_mi);
                this.recordObject[this.recordSizeArray[j]] = COM;
            }
            j++;
        }
    }
    appendAdditionalRecords(){
        this.recordObject['price'] = parseFloat(this.OrderBook.ticker['price']);
    }

    record(OrderBook){
        this.OrderBook = OrderBook;
        this.findCOMValues();
        this.appendAdditionalRecords();
    }

    displayRecordObject(){
        console.log(this.recordObject);
    }
}

module.exports = OrderBookRecordObject;