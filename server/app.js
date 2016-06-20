var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var request = require('request');

// modules
var index = require('./routes/index');
var settings = require('./routes/settings');
var alert = require('./routes/alert');
var setup = require('./routes/setup');
var location = require('./routes/location');
var reminder = require('./routes/reminder');
var data = require('./routes/data');
var forecast = require('./routes/forecast');

// serve static files
app.use(express.static(path.join(__dirname, './public')));

// middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// express routes
app.use('/store', setup);
app.use('/data', data);
app.use('/settings', settings);
app.use('/location', location);
app.use('/alert', alert);
app.use('/reminder', reminder);
app.use('/forecast', forecast);
app.use('/', index);

// start server
app.set('port', process.env.PORT || 5000);
app.listen(app.get('port'), function () {
  console.log('listening on port ', app.get('port'));
});
