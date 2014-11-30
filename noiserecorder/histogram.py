# histogram.py
#
# Draw histograms for frequency output
#
# Niklas Fejes 2014

# Imports
import sys
import numpy as np


# Draw a histogram
def hist(x,xmin,xmax,n,bar):
    sys.stdout.write('\033[0;0f') # cursor to position 0,0
    s = ''
    for i in range(n):
        for v in x:
            s += (bar if (v-xmin >= (n-i)/n*(xmax-xmin)) else ' '*len(bar))
        s += '\n'
    s += ('=' * (len(bar) * len(x))) + '\n'
    sys.stdout.write(s)


# Draw a vertical histogram with range labels
def vhist(x,xmin,xmax,n,xspan):
    sys.stdout.write('\033[0;0f') # cursor to position 0,0
    s = ''
    for i,v in enumerate(x):
        p = round(n * (v-xmin) / (xmax-xmin))
        if p < 0: p = 0
        if p > n: p = n
        s += '%5dHz-%5dHz: ' % xspan[i]
        s += '#' * (p) + ' ' * (n-p)
        s += '\n'
    s += '='*(n+17)  + '\n'
    sys.stdout.write(s)

