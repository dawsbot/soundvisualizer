# noiserecorder.py
#
# Main program for logging noise level and frequencies with a Raspberry Pi
# and Wolfson Pi sound card. The program can poll any audio input, which are
# 2 build in DMICs, a 2 channel line-in, and 1 headset mic.
#
# Niklas Fejes 2014

# Imports
import sys
import time
import numpy as np
import pymongo
from average import TimeAverages
from pymongo import MongoClient
from histogram import hist,vhist
from datetime import datetime
import wolfsonpi
import raspberrypi


# Current apt-get version of numpy is 1.6 which does not include np.fft.rfftfreq().
# It takes time to rebuild the package, so we use our own version.
def rfftfreq(n,step=1):
    return np.arange(0,(n // 2) + 1) / (n*step)

# Logarithmic binning class
class LogBin:
    def __init__(self,sampleNum,sampleRate,num):
        # Set up delimiters, spaced logarithmically
        delimiters = np.logspace(np.log10(1.0/sampleNum), np.log10(1.0/2),num+1)*sampleRate

        # Get the frequencies for the FFT output points, without the 0 frequency
        points = rfftfreq(sampleNum,1.0/sampleRate)[1:]

        # Create sections
        sections = []
        for d in delimiters[1:-1]:
            for i in range(len(points)-1):
                if points[i] <= d and points[i+1] > d:
                    sections.append(i+1)
                    break
        self.sections = sections

        # Calculate frequency ranges for each bin
        self.freqrange = []
        for f in np.split(points,sections):
            self.freqrange.append(tuple(f[[0,-1]]))


    # Create bins for an FFT output array
    # Each value is the maximum amplitude in each bin. This seems to be the best choice
    # since average will make high frequencies too low, and sum might make high frequencies
    # too high. Also, with maximum the scaling is perserved.
    def __call__(self,values):
        freq = []
        for vals in np.split(values,self.sections):
            if len(vals) > 0:
                freq.append(np.max(vals))
            else:
                freq.append(0)
        return freq



# Location object
# A class that handles the properties of a location
class LocationObject:
    def __init__(self,db,location,do_freq=True):
        self.location = location
        self.averages = TimeAverages([15,30,60])
        self.do_freq = do_freq
        self.db = db

    # Parse frame and insert in database
    def pushframe(self,frame,date):
        # Calculate noise, evaluated as the standard deviation of the signal
        noise = np.std(frame)

        # Add noise to the averaging windows and compute averages
        self.averages.add(noise)
        avgs = self.averages.mean()

        # Create database entry
        entry = {
            'location' : self.location,
            'date' : date,
            'noise' : {
                'level' : noise
            },
        }

        # Compute Fourier transform, and bin the frequencies logarithmically
        if self.do_freq:
            frame_fft  = np.fft.rfft(frame) / len(frame)
            frame_freq = abs(frame_fft[1:])
            bin_freq = logbin(frame_freq)
            entry['frequency'] = {
                'values' : bin_freq,
                'type' : 'logbin18'
            }
        else:
            bin_freq = [float('nan')] * 18
            entry['frequency'] = { 'type' : 'none' }

        # Add average noise levels
        for i,t in enumerate(self.averages.times):
            entry['noise']['avg%ds'%t] = avgs[i]

        # Push the data
        self.db.insert(entry)
        print('pushed frame for "%s"' % self.location)



if __name__ == '__main__':
    # Reader and bin classes
    recorder = wolfsonpi.AudioRecorder()
    logbin   = LogBin(2048,44100,18)

    # Visualize? (This will not push any data to the mongodb server)
    if len(sys.argv) == 3 and sys.argv[1] in ['hist','vhist']:
        sys.stdout.write('\033[2J') # Clear screen
        sources = (int(sys.argv[2]),0)
        recorder.set_sources(sources)
        while True:
            # Record frame
            frame,_    = recorder.read()
            frame_std  = np.std(frame)
            frame_fft  = np.fft.rfft(frame) / len(frame)
            frame_mean = frame_fft[0].real
            frame_freq = abs(frame_fft[1:])
            bin_freq   = logbin(frame_freq)

            # Representing data in decibel is an option
            # frame_dB = 20 * np.log10(frame_freq / (2**15))
            # bin_freq = logbin(frame_dB)

            if sys.argv[1] == 'hist':
                hist(bin_freq,0,250,32,'##### ')
            else:
                vhist(bin_freq,0,250,64,logbin.freqrange)
            print('[std,mean]:     %8.2f, %8.2f' % (frame_std, frame_mean))
            print('time [min,max]: %8.2f, %8.2f' % (min(frame), max(frame)))
            print('freq [min,max]: %8.2f, %8.2f' % (min(frame_freq), max(frame_freq)))

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
    except pymongo.errors.ConfigurationError as e:
        print('Failed to open mongodb connection:')
        print("  pymongo.errors.ConfigurationError:\n  {0}".format(str(e)))
        sys.exit(1)
    except pymongo.errors.OperationFailure as e:
        print('Failed to open mongodb connection:')
        print("  pymongo.errors.OperationFailure:\n  {0}".format(str(e)))
        sys.exit(1)

    # Location objects
    location = [
        #LocationObject(noisedb,'raspberry L',False),
        LocationObject(noisedb,'raspberry',False),
        LocationObject(noisedb,'microphone',True)
    ]

    # Infinite loop
    while True:
        start = time.time()
        raspberrypi.led.set(1)

        # Read data from DMIC
     #   recorder.set_sources((0,1))
     #   dmic_left,dmic_right = recorder.read()
     #   dmic_date = datetime.now()

     #   # Read data from Line-in
     #   recorder.set_sources((2,3))
     #   li_left,li_right = recorder.read()
     #   li_date = datetime.now()

        # Read data from DMIC and line-in
        recorder.set_sources((0,2))
        dmic,linein = recorder.read()
        rec_date = datetime.now()
        rtime = time.time()

        # Push frames
        location[0].pushframe(dmic, rec_date)
        location[1].pushframe(linein, rec_date)
     #   location[2].pushframe(li_right, li_date)

        # Limit to one read per 1 seconds
        pushtime = time.time() - start
        if pushtime < 1:
            raspberrypi.led.set(0)
            #print('Done in %.2f seconds...' % pushtime)
            print('Done in %.2f+%.2f seconds...' % (rtime-start, pushtime - (rtime-start)))
            time.sleep(1 - pushtime)
            raspberrypi.led.set(1)


