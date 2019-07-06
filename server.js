//DEPENDENCIES
var express = require('express');
var exphbs = require('express-handlebars');
var path = require('path');
var bodyParser= require('body-parser');
var morgan = require('morgan');

//DATABASE
var mongoose = require('mongoose');

var MONGODB_URI = process.env.MONGODB_URI;

var MONGODB_URI = MONGODB_URI || 'mongodb://localhost/mongoHeadlines';
mongoose.Promise = global.Promise;
mongoose.connect(
    MONGODB_URI,
    { useNewUrlParser: true }
);

//PORT
var PORT = process.env.PORT || 8080;

//EXPRESS, initialize
// var connect = require("express");
// var app = connect();
var app = express();
// var router = express.Router();
var routes = require('./routes/apiroutes');
//STATIC FOLDER
app.use(express.static('public'));

//MIDDLEWARE
// app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//HANDLEBARS
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//ROUTES

app.use(routes);

//START SERVER
app.listen(PORT, function () {
    console.log('App running on port ' + PORT);
});