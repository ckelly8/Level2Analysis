// OrderBoook object for any single product id
class OrderBook{
    constructor(product_id){
        this.product_id = product_id;
    }

    //Expects incoming websocket data parsed into JSON format 
    readDataStream(data){
        // Need to separate Ticker, Snapshot, and l2update data messages
        //console.log(data);
        if (data.type == 'snapshot'){
            //console.log(data);
        }
        if (data.type == 'l2update'){
            //console.log(data);
        }
        if (data.type == 'ticker'){
            //console.log(data);
        }
    }

    initializeOrderBook(data){
        
    }

    displayOrderBook(){
        console.log();
    }

}

module.exports = OrderBook;