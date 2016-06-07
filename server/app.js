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
