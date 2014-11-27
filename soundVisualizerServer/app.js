// Run 'npm install' to install node dependencies
var express = require('express');
var app = express();

app.engine('.html', require('ejs').__express);
app.set('views', __dirname);
app.set('view engine', 'html');

app.get('/',function(req,res){
  res.send('Hello World');
 });


app.listen(3000);
console.log('listening on port 3000');
