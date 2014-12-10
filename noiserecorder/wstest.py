import websocketserver
import time
import numpy as np

data = np.zeros(18)

websocketserver.setup(3000,data)

try:
    while True:
        data[:] = np.sin((np.arange(18)+time.time()*0.1)/np.pi)
        print(data)
        time.sleep(0.5)
except KeyboardInterrupt:
    print('\nCtrl-C (SIGINT) caught. Exiting...')
finally:
    websocketserver.close()
    
