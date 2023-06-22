import asyncio
import websockets
import json
import numpy as np
import Listen

BUFFER_SIZE = 240 # size in seconds to keep data in memory

# Creates a buffer object that contains snapshots of the orderbook in memory.
# The buffer will have values deleted from the front and appended to the rear 
# every time step. Once an evaluation metric is satisfied, the buffer will 
# be written to hard disk.
class Buffer:
    def __init__(self):
        self.buffer = []

    def record_aoi():
        pass

# ###----- Port Listening -----### #

async def handle_message(message):
    #print('Received message from Program 1:')
    BTC_OrderBook.processOrderBookData(message)
    
async def connection_handler(websocket, path):
    async for message in websocket:
        await handle_message(message)

# ###----- Functional Program -----### #

#Instantiate a the orderbook object
BTC_OrderBook = Listen.OrderBook('BTC-USD')
#ETH_OrderBook = OrderBook('ETH-USD')

start_server = websockets.serve(connection_handler, 'localhost', 8080, max_size=None, ping_interval=None)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()