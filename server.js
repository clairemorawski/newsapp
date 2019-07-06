var dotenv = require('dotenv');
dotenv.config();

var express = require('express');
var express = require('express-handlebars');
var logger = require('morgan');

//DATABASE
var mongoose = require('mongoose');

var MONGODB_URI = process.env.MONGODB_URI;

var MONGODB_URI = MONGODB_URI || 'mongodb://localhost/mongoHeadlines';
mongoose.Promise = global.Promise;
mongoose.connect(MONGODB_URI,
    { useNewUrlParser: true }
);

//PORT
var PORT = process.env.PORT || 3000;

//EXPRESS, initialize
var app = express();

//STATIC FOLDER
app.use(express.static('public'));

//MIDDLEWARE
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//HANDLEBARS
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//ROUTES
var routes = require('./routes/apiroutes');
app.use(routes);

//START SERVER
app.listen(PORT, function () {
    console.log('App running on port ' + PORT);
});