# iplog.py
#
# Niklas Fejes 2014

# Imports
from pymongo import MongoClient
from datetime import datetime,timedelta
import subprocess



# MongoDB credentials
try:
    f = open('mongocred.txt','r')
    mongocred = f.readline().strip()
    dbname = mongocred[mongocred.rfind('/'):][1:]
    f.close()
    if dbname.find('.') >= 0:
        print('Invalid mongocred string. Forgot database name?')
        sys.exit(1)
except IOError as e:
    print('Could not open file "mongocred.txt":')
    print("  I/O error({0}): {1}".format(e.errno, e.strerror))
    sys.exit(1)

# Open mongo link
try:
    mongo = MongoClient(mongocred)
    logdb = mongo[dbname]['iplog']
except pymongo.errors.ConfigurationError as e:
    print('Failed to open mongodb connection:')
    print("  pymongo.errors.ConfigurationError:\n  {0}".format(str(e)))
    sys.exit(1)
except pymongo.errors.OperationFailure as e:
    print('Failed to open mongodb connection:')
    print("  pymongo.errors.OperationFailure:\n  {0}".format(str(e)))
    sys.exit(1)

# Save
ip = subprocess.check_output(['hostname','-I']).decode('utf-8').strip()
print(ip)
logdb.save({'_id' : 'raspberry','ip' : ip, 'date' : datetime.now()})

