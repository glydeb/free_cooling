var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var request = require('request');

// heroku database: postgresql-tetrahedral-15645
// modules
// var pets = require('./routes/pets');
var index = require('./routes/index');
var setup = require('./routes/setup');
var location = require('./routes/location');
var reminder = require('./routes/reminder');

// serve static files
app.use(express.static(path.join(__dirname, './public')));

// middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// express routes
app.use('/store', setup);
app.use('/location', location);
app.use('/reminder', reminder);
app.use('/', index);

// start server
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function () {
  console.log('listening on port ', app.get('port'));
});
/*
  // Forecast.io API key
  var forecastKey = 'cbd4f63ef2acb744389fa7648c5f4b4e'

  // Sample textbelt text message post:
   curl -X POST http://textbelt.com/text -d number=5551234567 -d "message=I sent this message for free with textbelt.com"

*/
