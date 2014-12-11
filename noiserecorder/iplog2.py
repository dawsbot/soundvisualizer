# iplog.py
#
# Niklas Fejes 2014

# Imports
from datetime import datetime,timedelta
import subprocess
import urllib3
import sys

dbaddress='http://104.236.60.203:3003'
__http = urllib3.PoolManager()

def getip(name):
    try:
	    response = __http.request('GET', dbaddress + '/getip?name=' + name)
	    return response.data
    except ProtocolError as e:
        print(e.reason)
    return None

def setip(name,address):
    try:
	    response = __http.request('GET', dbaddress + '/setip?name=' + name + '&addr=' + address)
	    return response.data
    except ProtocolError as e:
        print(e.reason)
    return None

if __name__ == '__main__':
    if len(sys.argv) == 3 and sys.argv[1] == 'set':
        print(setip(sys.argv[1]))

    if len(sys.argv) == 2:
        if sys.argv[1] == 'get':
            print(getip(sys.argv[1]))
        elif sys.argv[1] == 'set':
            ip = subprocess.check_output(['hostname','-I']).decode('utf-8').strip()
            print('ip: ' + ip)
            print(setip(ip))
