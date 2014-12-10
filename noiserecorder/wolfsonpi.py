# wolfsonpi.py
#
# Code for recording from a Wolfson Pi with fixed parameters.
# Works on my laptop if I change the 'default' parameter to whatever device
# works with arecord.
#
# Niklas Fejes 2014


# Imports
import sys
import alsaaudio
import struct
import numpy as np
from subprocess import call


# Wolfson Pi Audio Recorder
class AudioRecorder:
    def __init__(self,samples=None):
        # Number of samples per read
        if samples is None: samples = 2048
        self.samples = samples

        # Set input to none
        self.input = None

        # Set source and open input
        self.sources = (-1,-1)
        self.set_sources((0,1))

        # Data buffer. The read method ensures that the data is 'self.samples' bytes long
        # size = self.samples * [bytes/sample] * channels
        self.buf = bytearray(self.samples*2*2)

        # Open input
        self.__input_open()

        # amixer -Dhw:0 cset name='IN3L Volume' 20
        basecmd = 'amixer -q -Dhw:0 cset'.split()
        d,v = 'IN3L Volume','31'
        call(basecmd + ["name='%s'" % d,v])

    # Initiate input
    def __input_open(self):
        self.__input_close()

        # Initiate
        self.input = alsaaudio.PCM(alsaaudio.PCM_CAPTURE, 0, 'default')

        # Set attributes: Stereo, 44100 Hz, 16 bit little endian
        self.input.setchannels(2)
        self.input.setrate(44100)
        self.input.setformat(alsaaudio.PCM_FORMAT_S16_LE)

        # Period size to 256. This could be any value, but since we may skip one period
        # sometimes is should not be too long.
        self.input.setperiodsize(256)

    # Close input
    def __input_close(self):
        # Close if open
        if not self.input is None:
            self.input.close()
            self.input = None

        

    # Write warnings to stderr. Might want to go to a log file in the future.
    def __warn(self,s):
        sys.stderr.write(s)
        sys.stderr.write('\n')

    # Input source names
    def __get_source_name(self,n):
        return [
            'IN2R', # DMIC left (the internet says they're swapped)
            'IN2L', # DMIC right
            'IN3L', # Line-in left
            'IN3R', # Line-in right
            'IN1R'  # Headset mic. Not sure if supports stereo input
        ][n]

    # Input source switch name
    def __get_source_switch(self,n):
        return [
            'DMIC Switch', 'DMIC Switch',
            'IN3 High Performance Switch', 'IN3 High Performance Switch',
            'Headset Mic Switch'
        ][n]

    # We have two channels, should be possible to combine in any way
    def set_sources(self,sources):
        sources = tuple(sources[0:2])

        if self.sources != sources:

            # Devices to turn on
            turn_on = set()
            for s in self.sources:
                if s in range(5):
                    turn_on.add(self.__get_source_switch(s))

            # Devices to turn off
            turn_off = set()
            for s in self.sources:
                if s in range(5):
                    turn_off.add(self.__get_source_switch(s))
            turn_off -= turn_on

            # Enable / disable devices
            basecmd = 'amixer -q -Dhw:0 cset'.split()
            for d in turn_off:
                call(basecmd + ["name='%s'" % d,'off'])
            for d in turn_on:
                call(basecmd + ["name='%s'" % d,'on'])

            # Set inputs
            call(basecmd + ["name='AIF1TX1 Input 1'",self.__get_source_name(sources[0])])
            call(basecmd + ["name='AIF1TX2 Input 1'",self.__get_source_name(sources[1])])
            self.sources = sources


    # Read 'self.samples' bytes from the recorder
    # Note 1: We don't always get as many bytes as we want (periodsize)
    # Note 2: If we can't process the data fast enough we will end up with an "overrun",
    #         resulting in self.input.read() returning -32.
    # Note 3: If an overrun happens or we read the first period, the first point might have
    #         a lower value than is should. We get around this by skipping one period for 
	#         each read or if we detect an overrun. (This is a bug in alsa or the sound card driver)
    def read(self):
        n = -1
        while n < self.samples:
            l,data = self.input.read()
       
            # Skip frame?
            if n < 0:
                # Not overrun? 
                if l > 0:
                    n = 0

            # Read data
            elif l > 0:
                if n+l < self.samples:
                    self.buf[n*4:(n+l)*4] = data
                else:
                    self.buf[n*4:] = data[:(self.samples-n)*4]
                n += l

            # Warn and skip
            else:
                self.__warn('alsa error (%d)' % l)
                n = -1

        # 1. unpack raw binary data to array of 16-bit integers, little endian, length 2048*2
        # 2. reshape "Fortran" style to separate left and right channels
        return np.reshape(struct.unpack('<4096h',self.buf),(2,-1),'F')

