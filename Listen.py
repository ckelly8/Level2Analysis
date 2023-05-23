import asyncio
import websockets
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
            # change is of form order_type | price | volume or change[0],change[1],change[3]
            if change[0] == 'sell':
                #check if value should be removed from orderbook
                if float(change[2]) != 0:
                    index = np.searchsorted(self.asks[:, 0], np.float64(change[1]))
                    
                    print(self.asks[index])
                    print(change)

                    #Value at index already exists. We are updating value.
                    if np.float64(change[1]) == self.asks[index,0]:
                        self.asks[index,0] = np.float64(change[1])
                        self.asks[index,1] = np.float64(change[2])
                    
                    #Value at index does not exist. We must insert the new values.
                    elif np.float64(change[1]) == self.asks[index,0]:
                        self.asks = np.insert(self.asks,index,[np.float64(change[1]),np.float64(change[2])],axis=0)
                    #print(change,index)
                    #print(self.asks[index-1])
                    print(self.asks[index])
                    #print(self.asks[index+1])


                elif float(change[2] == 0):
                    index = np.searchsorted(self.asks[:, 0], np.float64(change[1]))
                    self.asks = np.delete(self.asks,index,axis=0)

            elif change[0] == 'buy':
                if float(change[2]) == 0:
                    index = len(self.bids) - np.searchsorted(self.bids[:, 0][::-1], np.float64(change[1])) - 1
                    self.bids = np.delete(self.bids,index,axis=0)    
                

def calculate_center_of_mass(ob_array):
    distances = ob_array[:, 0]
    masses = ob_array[:, 1]
    total_mass = np.sum(masses)
    center_of_mass = np.sum(distances * masses) / total_mass
    return center_of_mass

# Initial messages are sent from javascript connector and processed into orderbook here
def processOrderBookData(data):
    received_data = json.loads(data)

    # snapshot is always received first. The initial orderbook is built here.
    if received_data['type'] == 'snapshot':
        asks, bids = [] ,[]
        for data in received_data['asks']:
            asks.append([float(data[0]),float(data[1])])
        for data in received_data['bids']:
            bids.append([float(data[0]),float(data[1])])
        
        #set orderbook object asks and bids to snapshot message
        BTC_OrderBook.instantiate_orderbook(asks,bids)
        del asks,bids

    # Update information in from ticker message
    if received_data['type'] == 'ticker':
        BTC_OrderBook.ticker['price'] = float(received_data['price'])
        BTC_OrderBook.ticker['time'] = (received_data['time'])
        BTC_OrderBook.ticker['best_ask'] = float(received_data['best_ask'])
        BTC_OrderBook.ticker['best_bid'] = float(received_data['best_bid'])

    if received_data['type'] == 'l2update':
        BTC_OrderBook.update_orderbook(received_data)
        #print(BTC_OrderBook.asks.size)

# ###----- Port Listening -----### #

async def handle_message(message):
    #print('Received message from Program 1:')
    processOrderBookData(message)
    
async def connection_handler(websocket, path):
    async for message in websocket:
        await handle_message(message)

# ###----- Functional Program -----### #

#Instantiate a the orderbook object
BTC_OrderBook = OrderBook('BTC-USD')
#ETH_OrderBook = OrderBook('ETH-USD')

start_server = websockets.serve(connection_handler, 'localhost', 8080, max_size=None, ping_interval=None)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()


