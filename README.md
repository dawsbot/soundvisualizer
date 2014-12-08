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

* CURRENTLY DEPRICATED! To get our sound measures, send a GET request to: ```/measures?start=1&finish=1000```. ```start``` is the start time to be used in our mongo query, ```finish``` is our finish time. We can possibly do this with Unix epoch time. Still under construction. 
* To see our sound visualization, send a GET request to: ```/visual```. This is stored in /views/visual/visual.html
* To see our calendar visualization, send a GET request to: ```/calendar```. THis is stored in /views/calendar/calendar.html
