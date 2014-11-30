# average.py
#
# Compute the average value of a set of items for different time spans
#
# Niklas Fejes 2014

import time
import numpy as np

class TimeAverages:
    def __init__(self,times):
        self.times = times
        self.queue = []

    def pop_old(self,now=None):
        if now is None: now = time.time()
        pop_time = now - max(self.times)
        self.queue = [(t,v) for (t,v) in self.queue if t >= pop_time]

    def add(self,val,t=None):
        if t is None: t = time.time()
        self.pop_old()
        self.queue.append((t,val))

    def collect(self,func,default):
        now = time.time()
        self.pop_old(now)
        collection = []
        for timespan in self.times:
            pop_time = now - timespan
            values = [v for (t,v) in self.queue if t >= pop_time]
            collection.append(func(values) if values else default)
        return collection

    def mean(self):
        return self.collect(np.mean,float('nan'))

    def max(self):
        return self.collect(max,float('nan'))

    def print_queue(self):
        now = time.time()
        q = []
        for t,v in self.queue:
            q.append((int(round(t-now)),v))
        print(q)

