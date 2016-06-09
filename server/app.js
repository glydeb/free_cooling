var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');

// modules
// var pets = require('./routes/pets');
var index = require('./routes/index');

// serve static files
app.use(express.static(path.join(__dirname, './public')));

// middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// express routes
// app.use('/pets', pets);
app.use('/', index);

// start server
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function () {
  console.log('listening on port ', app.get('port'));
});
/*
  // SendGrid email API key
  eMailKey = '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'

  // Forecast.io API key
  var forecastKey = 'cbd4f63ef2acb744389fa7648c5f4b4e'

  // Sample textbelt text message post:
   curl -X POST http://textbelt.com/text -d number=5551234567 -d "message=I sent this message for free with textbelt.com"

  // Google API key - 'Free Cooling Key'
  latLongKey = 'AIzaSyC2m5hJtKCJ4ENzVrqWrmWFj6yVTl3ZFnQ'

*/
