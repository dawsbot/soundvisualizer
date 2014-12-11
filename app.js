// You need to install express locally with npm install. Global won't work.
var express = require('express');
var mongoskin = require('mongoskin');
var app = express();

var username = 'readuser'; // TODO
var password = 'ReadUserPassword'; // TODO
var url = '104.236.60.203'; // TODO
var db = mongoskin.db('mongodb://'+username+':'+password+'@'+url+':27018/sound', {safe:true})

var toObjectID = mongoskin.helper.toObjectID;

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

// combined visualizations
app.get('/',function(req,res){
  res.render('index.html',{data:[]});
});
app.get('/new',function(req,res){
	var d = new Date(Date.now() - 15*60*60*1000);
	db.collection('noise').aggregate([
		{ $match : { location : 'microphone', date : { $gt : d } } },
		{ $sort: { date : 1 }},
		{ $limit: 30},
	], function (err,mongoRes) {
		if (err) console.log(err);
  		res.render('index.html',{
			data: (mongoRes || []).map(function(d) {
				return { l: d.noise.level, t: d.date }
			})
		});
	});
});

// path to Austin's equalizer
app.get('/equalizer', function(req,res){
  res.render('equalizer/equalizer.html');
});

// path to Dawson's noise recorder
app.get('/livedaily',function(req,res){
  res.render('livedaily/livedaily.html');
});

// Dawson's mongo data collection
app.get('/livevisualdata',function(req,res){
  data = db.collection('noise').find({location:'microphone'}).sort({"date":-1}).limit(1).toArray(function(err,result){
   if (err) throw err;
   res.json(result);
  })
});

// Dawson's mongo data collection
app.get('/livevisualdata2',function(req,res) {
	if ('firstDate' in req.query) {
		var d = new Date(req.query.firstDate);
		if (isNaN(d.getTime())) {
			res.json(['invalid date']);
			return;
		}
		db.collection('noise').aggregate([
			{ $match : { location : 'microphone', date : { $gt : d } } },
			{ $sort: { date : 1 }},
			{ $limit: 30},
		], function (err,mongoRes) {
			if (err) console.log(err);
			res.json(mongoRes || []);
		});
	}
	if ('lastId' in req.query) {
		var oid = toObjectID(req.query.lastId);
		//console.log('id: ' + req.query.lastId + ' : ' + oid);
		db.collection('noise').aggregate([
			{ $match : { location : 'microphone', _id : { $gt : oid } } },
			{ $sort: { date : 1 }},
			{ $limit: 30},
		], function (err,mongoRes) {
			if (err) console.log(err);
			res.json(mongoRes || []);
		});
	}
	else {
		res.json(['error']);
	}
});


app.listen(13000);
console.log('listening on port 13000');

