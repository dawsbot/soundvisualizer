# statrunner.py
#
# Small script for running statistics.py
#
# Niklas Fejes 2014

import os
import subprocess
from datetime import datetime,timedelta
from time import sleep


def run():
    subprocess.call('python3 statistics.py', shell=True)
    #subprocess.call('python3 iplog.py', shell=True)
    subprocess.call('python3 iplog2.py set raspberry', shell=True)
period = 1 # minutes
delta = timedelta(minutes=period)


d = datetime.now()
d = datetime(d.year,d.month,d.day,d.hour,(d.minute//period)*period,5)

while True:
    print('Running statistics at %s:' % str(d))
    run()
    d += delta
    sleep_time = (d - datetime.now()).total_seconds()
    if sleep_time > 0:
        print('Sleeping for %.2f s...' % sleep_time)
        sleep(sleep_time)
    

