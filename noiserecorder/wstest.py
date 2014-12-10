import websocketserver
import time
import numpy as np

data = [0,np.zeros(18).tolist(),'hello']

websocketserver.setup(3000,data)

try:
    while True:
        data[1][:] = np.sin((np.arange(18)+time.time()*0.1)/np.pi)
        data[0] += 1
        data[2] = 'hello' + str(data[0])
#        print(data[0])
        time.sleep(0.5)
except KeyboardInterrupt:
    print('\nCtrl-C (SIGINT) caught. Exiting...')
finally:
    websocketserver.close()
    
