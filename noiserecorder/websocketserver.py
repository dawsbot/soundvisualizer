import asyncio
import signal
import sys
import time
import websockets
import random
from IPython import embed
import json
import threading

# Globals
__event_loop = None
__server = None
__data = None
__thread = None

@asyncio.coroutine
def __handler(websocket, path):
    global __event_loop,__server,__data
    try:
        n = int(path[1:])
    except ValueError:
        yield from websocket.send('invalid path: ' + path)
        return
    if not n in range(len(__data)):
        yield from websocket.send('invalid path: ' + path)
        return

    updateId = None 
    while True:
        if not websocket.open: break
        t = __data[0]
        if t != updateId:
            updateId = t
            yield from websocket.send(json.dumps(__data[n]))
        yield from asyncio.sleep(.001)


def __loop_in_thread(loop):
    global __event_loop,__server,__data,__thread
    asyncio.set_event_loop(loop)
    loop.run_until_complete(__server)
    loop.run_forever()

def setup(port,data):
    global __event_loop,__server,__data,__thread
    __data = data
    host = '0.0.0.0'
    print('Atlas server is listening on http://', host, ':', port, sep='')
    __server = websockets.serve(__handler, host, port)
    __event_loop = asyncio.get_event_loop()
    __event_loop.run_until_complete(__server)
    
    __thread = threading.Thread(target=__loop_in_thread, args=(__event_loop,))
    __thread.start()


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
    __thread.join()

