
var config 		= require('./config');
var express		= require('express');
var app			= express();
var bodyParser	= require('body-parser');
//var sql 		= require('sql');



app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

app.get('/', function(req, res){
	res.send('Hello world!');
})

app.listen(3000);