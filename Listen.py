import asyncio
import websockets
import json

# Trading pairs map
tradingPairs = {}

# Function to process the emitted order book data
def processOrderBookData(data):
    orderBookData = json.loads(data)
    
    print(orderBookData['BTC-USD'])
    quit()
    
async def handle_message(message):
    print('Received message from Program 1:')
    processOrderBookData(message)
    
async def connection_handler(websocket, path):
    async for message in websocket:
        await handle_message(message)

start_server = websockets.serve(connection_handler, 'localhost', 8080, max_size=None)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()


