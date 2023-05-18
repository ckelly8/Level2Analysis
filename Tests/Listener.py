# Program 2 - Listener

import asyncio
import websockets
import json

async def receive_messages():
    async with websockets.connect('ws://localhost:8080') as websocket:  # WebSocket server URL
        print('Somethings happening')
        while True:
            print('Somethings really happening')
            message = await websocket.recv()
            json_data = json.loads(message)
            print(json_data)

asyncio.get_event_loop().run_until_complete(receive_messages())
