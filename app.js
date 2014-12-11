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

// combined visualizations
app.get('/',function(req,res){
  res.render('index.html');
});

// path to Austin's equalizer
app.get('/equalizer', function(req,res){
  res.render('equalizer/equalizer.html');
});

// path to Jake's noise recorder
app.get('/livedaily',function(req,res){
  res.render('livedaily/livedaily.html');
});

// path to Dawson's noise recorder
app.get('/liveoneday',function(req,res){
  res.render('liveoneday/visual.html');
});

//Jake's mongo data collection
app.get('/livevisualdata',function(req,res){
  data = db.collection('noise').find({location:'microphone'}).sort({"date":-1}).limit(1).toArray(function(err,result){
   if (err) throw err;
   res.json(result);
  })
});

//Dawson's big hourly graph
app.get('/testdata',function(req,res){
  var d = new Date(Date.now() - (86400000) - (1000 * 60 * (new Date()).getTimezoneOffset()));
  data = db.collection('statistics').find({"_id.l":'microphone', "_id.q": {$gt : d}}).sort({"_id.q":-1}).toArray(function(err,result){
   if (err) throw err;
   res.json(result);
  })
});

app.listen(13000);
console.log('listening on port 13000');

