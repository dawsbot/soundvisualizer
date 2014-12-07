# statrunner.py
#
# Small script for running statistics.py
#
# Niklas Fejes 2014

import os
from datetime import datetime,timedelta
from time import sleep


def run(): os.system('python3 statistics.py')
period = 15 # minutes
delta = timedelta(minutes=period)


d = datetime.now()
d = datetime(d.year,d.month,d.day,d.hour,(d.minute//period)*period,10)

while True:
    print('Running statistics at %s:' % str(d))
    run()
    d += delta
    sleep((d - datetime.now()).total_seconds())
    

