soundvisualizer
===============
Fall 2014 project on display in the ATLAS building. <br>
Original idea proposition [here](https://github.com/dawsonbotsford/project_proposal)


### Hardware
* Raspberry Pi (model B)
* Wolfson Pi Audio Card
* Microphones

The audio card supports recording from a stereo line-in, two on-card DMIC microphones and one headset microphone, so in total we can have five different noise sources. More details about the hardware and source code for the recorder can be found [here](/noiserecorder).

### Server Routes

* To get our sound measures, send a GET request to: ```/measures```. This will return a csv file that can be used by your application.
* To see our visualization, send a GET request to: ```/visual```

