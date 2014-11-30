# noiserecorder.py
#
# Code for toggling the ACT led on a Raspberry Pi board.
# Only works if run as sudo or the led permissions are changed:
#   sudo chmod o+w /sys/class/leds/led0/trigger
#   sudo chmod o+w /sys/class/leds/led0/brightness 
#
# Niklas Fejes 2014

import subprocess
import atexit
import os,sys

class __led:
	def __init__(self):
		# Devices
		self.__trigger = '/sys/class/leds/led0/trigger'
		self.__brightness = '/sys/class/leds/led0/brightness'
		
		# Test access
		if not os.access(self.__trigger,os.R_OK|os.W_OK):
			sys.stderr.write('No access to ' + self.__trigger + '\n')
			self.available = False
			return
		
		# Test access 2
		if not os.access(self.__brightness,os.R_OK|os.W_OK):
			sys.stderr.write('No access to ' + self.__brightness + '\n')
			self.available = False
			return

		# Disable trigger / test access
		if os.system('echo none > ' + self.__trigger) != 0:
			sys.stderr.write('No access to ' + self.__trigger + '\n')
			self.available = False
			return

		# Disable led / test access
		if os.system('echo 0 > ' + self.__brightness) != 0:
			sys.stderr.write('No access to ' + self.__brightness + '\n')
			self.available = False
			return

		# Should be good to go
		self.available = True

	def set(self,val):
		if self.available:
			n = 1 if val else 0
			os.system('echo %d > %s' % (n,self.__brightness))
		

led = __led()
