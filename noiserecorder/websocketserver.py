import asyncio
import signal
import sys
import time
import websockets
import random
from IPython import embed
import json

# Globals
__event_loop = None
__server = None
__data = None

@asyncio.coroutine
def __handler(websocket, path):
    while True:
        if not websocket.open:
            break
        yield from websocket.send(json.dumps(__data))
        yield from asyncio.sleep(.001)

def setup(port,data):
    global __event_loop,__server,__data
    __data = data
    host = 'localhost'
    print('Atlas server is listening on http://', host, ':', port, sep='')
    __server = websockets.serve(__handler, host, port)
    __event_loop = asyncio.get_event_loop()
    __event_loop.run_until_complete(__server)

def run_forever():
    global __event_loop,__server,__data
    try:
        __event_loop.run_forever()
    except KeyboardInterrupt:
        print('\nCtrl-C (SIGINT) caught. Exiting...')
    finally:
        __server.close()
        __event_loop.close()

def close():
    global __event_loop,__server,__data
    __server.close()
    __event_loop.close()

