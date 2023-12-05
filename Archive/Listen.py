import json
import numpy as np

# Used to create an orderbook object of product type e.g. BTC-USD or ETH-USD
class OrderBook:
    def __init__(self, product):
        self.product = product
        self.asks = np.zeros(10)
        self.bids = np.zeros(10)
        self.ticker = {'price': None, 'time': None, 'best_bid': None, 'best_ask': None}
    
    def instantiate_orderbook(self,asks_snapshot,bids_snapshot):
        self.asks = np.array(asks_snapshot)
        self.bids = np.array(bids_snapshot)

    def update_orderbook(self,update_message):
        # the l2update may have more than one update so iterate through all changes
        for change in update_message['changes']:
            # change is of form order_type | price | volume defined by -> change[0],change[1],change[2]
            if change[0] == 'sell':
                # volume value is not 0. insert into sorted orderbook array.
                if float(change[2]) != 0:

                    # search orderbook array for index at which new or updated value should be inserted
                    index = np.searchsorted(self.asks[:, 0], np.float64(change[1]))

                    # check if new value already exists in orderbook array
                    # if yes, delete entry and update with new value
                    # if no, insert without deletion
                    if self.asks[index,0] == np.float64(change[1]):
                        self.asks = np.delete(self.asks,index,axis=0)
                        self.asks = np.insert(self.asks,index,np.array([np.float64(change[1]),np.float64(change[2])]),axis=0)

                    elif self.asks[index,0] != np.float64(change[1]):
                        self.asks = np.insert(self.asks,index,np.array([np.float64(change[1]),np.float64(change[2])]),axis=0)
    
                # volume value is 0. Remove entry at index.
                if float(change[2]) == 0:
                    index = np.searchsorted(self.asks[:, 0], np.float64(change[1]))
                    self.asks = np.delete(self.asks,index,axis=0)
                    

            elif change[0] == 'buy':
                # volume value is not 0. insert into sorted orderbook array.
                if float(change[2]) != 0:

                    # search orderbook array for index at which new or updated value should be inserted
                    index = len(self.bids) - np.searchsorted(self.bids[:, 0][::-1], np.float64(change[1])) - 1

                    # check if new value already exists in orderbook array
                    # if yes, delete entry and update with new value
                    # if no, insert without deletion
                    if self.bids[index,0] == np.float64(change[1]):
                        self.bids = np.delete(self.bids,index,axis=0)
                        self.bids = np.insert(self.bids,index,np.array([np.float64(change[1]),np.float64(change[2])]),axis=0)

                    elif self.bids[index,0] != np.float64(change[1]):
                        ### Could be potential bug here if adding to last value in orderbook array
                        self.bids = np.insert(self.bids,index+1,np.array([np.float64(change[1]),np.float64(change[2])]),axis=0)
                    
                # volume value is 0. Remove entry at index.
                if float(change[2]) == 0:
                    index = len(self.bids) - np.searchsorted(self.bids[:, 0][::-1], np.float64(change[1])) - 1
                    self.bids = np.delete(self.bids,index,axis=0)
                

    # Initial messages are sent from javascript connector and processed into orderbook here
    def processOrderBookData(self,data):
        received_data = json.loads(data)

        # snapshot is always received first. The initial orderbook is built here.
        if received_data['type'] == 'snapshot':
            asks, bids = [] ,[]
            for data in received_data['asks']:
                asks.append([float(data[0]),float(data[1])])
            for data in received_data['bids']:
                bids.append([float(data[0]),float(data[1])])

            #set orderbook object asks and bids to snapshot message
            self.instantiate_orderbook(asks,bids)
            del asks,bids

        # Update information in from ticker message
        if received_data['type'] == 'ticker':
            self.ticker['price'] = float(received_data['price'])
            self.ticker['time'] = (received_data['time'])
            self.ticker['best_ask'] = float(received_data['best_ask'])
            self.ticker['best_bid'] = float(received_data['best_bid'])

        if received_data['type'] == 'l2update':
            self.update_orderbook(received_data)
