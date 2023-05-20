import asyncio
import websockets
import json
import numpy as np

def calculate_center_of_mass(ob_array):
    distances = ob_array[:, 0]
    masses = ob_array[:, 1]
    total_mass = np.sum(masses)
    center_of_mass = np.sum(distances * masses) / total_mass
    return center_of_mass

def processOrderBookData(data):
    orderBookData = json.loads(data)
    full_product_dictionary = {}
    for product in orderBookData:
        single_product_dictionary = {}
        ticker_list = []
        # order_type represents bids, asks, or ticker information
        for order_type in orderBookData[product]:
            # Check if type is ticker. If yes set values then continue to next order type.
            if order_type == 'ticker':
                ticker_list = []
                if orderBookData[product][order_type] != None:
                    # Should be of the form - | BestBid | BestAsk | CurrentPrice | AtTime | Ticker
                    TickerBestBid = orderBookData[product][order_type]['bid']
                    TickerBestAsk = orderBookData[product][order_type]['ask']
                    TickerPrice = orderBookData[product][order_type]['price']
                    TickerTime = orderBookData[product][order_type]['time']
                    ticker_list.extend([TickerPrice,TickerBestBid,TickerBestAsk,TickerTime])
                    continue
                # We skip over setting ticker values if we have not yet received information from the websocket
                if order_type == 'ticker' and orderBookData[product][order_type] == None:
                    continue
            
            #Entries are in the form [[Price, Volume],...[Pn][Vn]] for the bids or asks of a trading pair
            if order_type == 'bids':
                bid_entries = []
                for entries in orderBookData[product][order_type]:
                    bid_entries.append([float(entries[0]),float(entries[1])])
            
            if order_type == 'asks':
                ask_entries = []
                for entries in orderBookData[product][order_type]:
                    ask_entries.append([float(entries[0]),float(entries[1])])
        
        # Values have been added to variables and can now be placed into a product dictionary
        single_product_dictionary = { 'bid_entries': np.array(bid_entries), 'ask_entries': np.array(ask_entries),'ticker': ticker_list}
        
        #This can then be added to the full product dictionary to track all trading pairs in real time
        full_product_dictionary[product] = single_product_dictionary
    
    #btc_bids_com = calculate_center_of_mass(full_product_dictionary['BTC-USD']['bid_entries'])
    #btc_asks_com = calculate_center_of_mass(full_product_dictionary['BTC-USD']['ask_entries'])
    #print(btc_bids_com,btc_asks_com)

    print(full_product_dictionary['BTC-USD']['bid_entries'].size, full_product_dictionary['BTC-USD']['ask_entries'].size)

# ###----- Port Listening -----### #

async def handle_message(message):
    #print('Received message from Program 1:')
    processOrderBookData(message)
    
async def connection_handler(websocket, path):
    async for message in websocket:
        await handle_message(message)

start_server = websockets.serve(connection_handler, 'localhost', 8080, max_size=None, ping_interval=None)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()


