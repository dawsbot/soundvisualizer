var express = require('express');
var mongoskin = require('mongoskin');
var app = express();

// Mongo
var username = 'ip';
var password = 'ipPassword';
var url = '104.236.60.203';
var db = mongoskin.db('mongodb://'+username+':'+password+'@'+url+':27018/ip', {safe:true})

// App
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

// Allowed names
var names = ['raspberry','visualization'];

app.get('/setip',function(req,res){
	var query = req.query;
	
	if (!query.hasOwnProperty('name') || !query.hasOwnProperty('addr')) {
		res.send('Bad parameters');
	} else { 
		var name = query.name;
		var addr = query.addr;
	
		if (!name.match(/^[a-z]+$/) || name.length > 40 || names.indexOf(name) < 0) {
			res.send('Invalid name: '  + name);
			return;
		}
		if (!addr.match(/^[0-9.:]+$/) || addr.length > 40) {
			res.send('Invalid address: '  + addr);
			return;
		}
		db.collection('ip').update({_id : name}, {address : addr}, {upsert : true},function(e) {
			if (e) res.send('Error updating');
			else   res.send('Entry updated');
		});
	} 
});

app.get('/getip',function(req,res){
	var query = req.query;
	
	if (!query.hasOwnProperty('name')) {
		res.send('Bad parameters');
	} else { 
		var name = query.name;
	
		if (!name.match(/^[a-z]+$/) || name.length > 40 || names.indexOf(name) < 0) {
			res.send('Invalid name: '  + name);
			return;
		}
		db.collection('ip').findOne({_id : name}, function(e,d) {
			if (e)  res.send('Error');
			if (!d) res.send('null');
			else   res.send(d.address);
		});
	} 
});

app.listen(3003);
console.log('listening on port 3003');




