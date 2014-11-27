soundvisualizer
===============
Fall 2014 project on display in the ATLAS building. <br>
Original idea proposition [here](https://github.com/dawsonbotsford/project_proposal)


### Hardware
* Raspberry Pi (model B)
* Wolfson Pi Audio Card
* Microphones

The audio card supports recording from a stereo microphone, which we could split to record from two different sources. It also has on-board microphones, so we could possibly get three audio sources if the card supports streaming from both the on-board and the external microphones.

### Server Routes

* To get our sound measures, send a GET request to: ```/measures```
* To see our visualization, send a GET request to: ```/visual```

