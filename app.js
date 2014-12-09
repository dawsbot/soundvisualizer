// You need to install express locally with npm install. Global won't work. 
var express = require('express');
var mongoskin = require('mongoskin');
var app = express();

var username = 'readuser'; // TODO
var password = 'ReadUserPassword'; // TODO
var url = '104.236.60.203'; // TODO
var db = mongoskin.db('mongodb://'+username+':'+password+'@'+url+':27018/sound', {safe:true})





app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.get('/',function(req,res){

    var query;
    db.collection('noise').findOne(function(err, result) {
          if (err) throw err; 
          
          console.log(result.noise.avg60s);
          res.send(result);
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
//path for jake's visualization
app.get('/livevisual',function(req,res){
  res.render('livevisual/livevisual.html');
});
//path to the calendar
app.get('/equalizer',function(req,res){
  //we want our mongo query to find data a year back, break it down by day, and find the avg of the averages over that day 
  
  //var end = new Date();
  //start date is year plus 1900; the same month ; 7 days before which rolls back properly 
  //var start = end;
  //start.setDate(end.getDate()-7)
 console.log('++++++++++++++++++++++++++++++++++') 
  
  db.collection('noise').find().sort({datefield:-1}).limit(10).toArray(function(err,result){
   if (err) throw err;
   console.log(result);
  })
  
  //var query = {'date':{$gte:start,$lt:end}};
  var projection = {};

  /*db.collection('noise').findOne(function(err, result) {
        if (err) throw err; 
        
        console.log(result.noise.avg60s);
       
  });*/ 
  res.render('equalizer/equalizer.html');
});

app.listen(13000);
console.log('listening on port 13000');




