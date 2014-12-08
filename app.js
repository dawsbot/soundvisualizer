// You need to install express locally with npm install. Global won't work. 
var express = require('express');
var mongoskin = require('mongoskin');
var app = express();

var username = 'readuser'; // TODO
var password = 'ReadUserPassword'; // TODO
var url = 'ds051980.mongolab.com'; // TODO
var db = mongoskin.db('mongodb://'+username+':'+password+'@'+url+':51980/soundtest', {safe:true})





app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.get('/',function(req,res){

//return a random date to test connection to the db
var query;
db.collection('noise').findOne(function(err, result) {
      if (err) throw err; 
      res.send(result.date);
  }); 
 });

//this was supposed to be the API, depricated as of now. 
app.get('/measures',function(req,res){
  query = req.query;

  if (!query.hasOwnProperty('start')){
    res.send('Bad start parameter, use format: /measures?start=55&finish=55')
  }

  if (!query.hasOwnProperty('finish')){ 
    res.send('Bad finish parameter, use format: /measures?start=55&finish=55')
  }

  else { 
    start = parseInt(query.start);
    finish =  parseInt(query.finish);
    res.send('Measures ' + start + ' ' + finish);

    //make mongo query here using start and finish params 

    //this is where we put the datafile to be sent.  
    //res.sendfile('sample_data.csv')
  } 
});


//path to austin's visualization
app.get('/visual',function(req,res){
  res.render('visual/visual.html');
});

//path to the calendar
app.get('/calendar',function(req,res){
  res.render('calendar/calendar.html');
});

app.listen(13000);
console.log('listening on port 13000');
