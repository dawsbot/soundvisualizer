// You need to install express locally with npm install. Global won't work. 
var express = require('express');
var app = express();

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.get('/',function(req,res){
  res.send('Hello World');
 });

app.get('/measures',function(req,res){
  //this is where we put the datafile to be sent.  
  res.sendfile('sample_data.csv')
});

app.get('/visual',function(req,res){
  res.render('visual.html');
});

app.get('/calendar',function(req,res){
  res.render('calendar.html');
});

app.listen(3000);
console.log('listening on port 3000');
