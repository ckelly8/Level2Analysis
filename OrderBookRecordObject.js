class OrderBookRecordObject{
    constructor(OrderBook,recordSizeArray){
        this.OrderBook = OrderBook;
        this.recordSizeArray = recordSizeArray;
        this.recordObject = {};
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
        let totalSize = this.recordSizeArray[this.recordSizeArray.length-1];;
        //first check that the ob is initialized and contains values
        if(!this.OrderBook.asks.length || !this.OrderBook.bids.length){
            return null;
        }

        

    }
    
    record(){

    }


}

module.exports = OrderBookRecordObject;