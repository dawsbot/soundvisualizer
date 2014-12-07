# noiserecorder.py
#
# Main program for collecting noise statistics.
#
# Niklas Fejes 2014

# Imports
import sys
import time
import numpy as np
import pymongo
#import datetime
from pymongo import MongoClient
from datetime import datetime,timedelta



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
    noisedb = mongo[dbname]['noise']
    statdb = mongo[dbname]['statistics']
except pymongo.errors.ConfigurationError as e:
    print('Failed to open mongodb connection:')
    print("  pymongo.errors.ConfigurationError:\n  {0}".format(str(e)))
    sys.exit(1)
except pymongo.errors.OperationFailure as e:
    print('Failed to open mongodb connection:')
    print("  pymongo.errors.OperationFailure:\n  {0}".format(str(e)))
    sys.exit(1)

# Min / max date
mindate = statdb.aggregate([
    {'$group' : { '_id' : 'date',
                  'max' : {'$max' : '$_id.q'}
                }
    }])['result']
mindate = (mindate[0]['max']+timedelta(minutes=15)) if mindate else datetime(2000,1,1)

# Statistics query
period = 15 # minutes
now = datetime.now()
maxdate = datetime(now.year,now.month,now.day,now.hour,(now.minute//period)*period)


# Let the mongo db do the computations
aggregate_result = noisedb.aggregate([
    # Only match dates for passed quarters
    {'$match' : {'date' : {'$gte' : mindate, '$lt' : maxdate}}},
    
    # Project date field to separate fields
    { '$project' : {
        '_id' : 0, 'date' : 1, 'location' : 1, 'noise.level' : 1,
        "h" : {"$hour"        : "$date" },
        "m" : {"$minute"      : "$date" },
        "s" : {"$second"      : "$date" },
        "ml": {"$millisecond" : "$date" }
    }},

    # Project a "quarter" field
    { "$project" : {
        '_id' : 0, 'date' : 1, 'location' : 1, 'noise.level' : 1,
        "quarter" : {
            "$subtract" : [
                "$date",
                { "$add" : [
                    "$ml",
                    { "$multiply" : [ "$s", 1000 ] },
                    { "$multiply" : [ {'$mod' : ["$m",period]}, 60*1000 ] },
                ]}
            ]
        }
    }},

    # Group by quarter
    { "$group" : {
        '_id' : {
            'l' : '$location',
            'q' : '$quarter'
        },
        'count' : { '$sum' : 1 },
        'max' : { '$max' : '$noise.level' },
        'min' : { '$min' : '$noise.level' },
        'avg' : { '$avg' : '$noise.level' }
    }},

    # Limit to 10 entries for now
#    {'$limit' : 10}
])['result']

if aggregate_result:
    insert_result = statdb.insert(aggregate_result, continue_on_error=True)

    print('Aggregated %d entries' % len(aggregate_result))
    print('Inserted   %d entries' % len(insert_result))
else:
    print('Nothing to update')

# Cleanup
rem_result = noisedb.remove({'date' : {'$lt' : datetime.now() - timedelta(hours=2*24)}})
print('Removed    %d noise entries' % rem_result['n'])
