import asyncio
import websockets
import json
import numpy as np
import Listen


# Creates a buffer object that contains snapshots of the orderbook in memory.
# The buffer will have values deleted from the front and appended to the rear 
# every time step. Once an evaluation metric is satisfied, the buffer will 
# be written to storage.
class OrderbookBuffer:
    def __init__(self):
        self.buffer_max_size = 6000
        self.buffer = []


    def update_buffer(self,update_data):
        # check if the buffer is already filled 
        # append to rear and delete front if yes
        if len(self.buffer) >= self.buffer_max_size:
            self.buffer.append(update_data)
            self.buffer = self.buffer[1:]
            self.record_aoi()
        else:
            self.buffer.append(update_data)

    def record_aoi(self):
        print(self.buffer)
        # Find maximum value in the 3rd column
        max_value = max(self.buffer, key=lambda x: x[2])[2]

        # Find minimum value in the 3rd column
        min_value = min(self.buffer, key=lambda x: x[2])[2]

        buffer_profitability = check_profit(min_value,1.0,max_value,1.0)

        if buffer_profitability > 0:
            print('Buffer is profitable')


def check_profit(entry_price,entry_volume,exit_price,exit_volume):
    # considering worse case fee structure in percent %
    maker_fee = 0.4 / 100.0
    taker_fee = 0.6 / 100.0

    entry_cost = (entry_price*entry_volume) + (entry_price*entry_volume)*maker_fee
    exit_take = (exit_price*exit_volume) - (exit_price*exit_volume)*maker_fee

    net_profit = exit_take - entry_cost
    print(f"Net profit: {net_profit}")
    return net_profit


# # #----- Port Listening -----# # #

async def handle_message(message):
    BTC_OrderBook.processOrderBookData(message)
    BTC_OrderBook_Buffer.update_buffer([BTC_OrderBook.asks,BTC_OrderBook.bids,BTC_OrderBook.ticker['price']])

    
async def connection_handler(websocket, path):
    async for message in websocket:
        await handle_message(message)


# instantiate a the orderbook object
BTC_OrderBook = Listen.OrderBook('BTC-USD')

# instantiate orderbook buffer object
BTC_OrderBook_Buffer = OrderbookBuffer()

# start websocket listening
start_server = websockets.serve(connection_handler, 'localhost', 8080, max_size=None, ping_interval=None)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()