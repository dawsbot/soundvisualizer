from average import TimeAverages
import random
from time import sleep

avg5 = TimeAverages([1,2,3,4,5])
c = 0
while True:
	print('before add(%3d): %s ' % (c,str(avg5.mean())),end='')
	avg5.print_queue()
	avg5.add(c)
	print('after  add(%3d): %s ' % (c,str(avg5.mean())),end='')
	avg5.print_queue()
	sleep_time = random.randint(0,3)
	print('sleep(%d):        %s ' % (sleep_time,str(avg5.mean())),end='')
	sleep(sleep_time)
	avg5.print_queue()
	c += 1
