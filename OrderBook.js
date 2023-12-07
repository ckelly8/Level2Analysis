// OrderBoook object for any single product id
class OrderBook{
    constructor(product_id,ob_array){
        this.product_id = product_id;
        this.ob_array = ob_array;
    }

    displayOrderBook(){
        console.log(ob_array);
    }

}

module.exports = OrderBook;