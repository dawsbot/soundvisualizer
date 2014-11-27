// Run 'npm install' to install node dependencies
var express = require('express');
var app = express();

app.engine('.html', require('ejs').__express);
app.set('views', __dirname);
app.set('view engine', 'html');

app.get('/',function(req,res){
  res.send('Hello World');
 });

app.get('/measures',function(req,res){
  res.send("This is where our measurments might go for api calls!")
});

app.get('/visualization',function(req,res){
  res.send("This is where our visualizer will go!")
});


app.listen(3000);
console.log('listening on port 3000');
