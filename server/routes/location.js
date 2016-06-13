var express = require('express');
var router = express.Router();
var request = require('request');
var pg = require('pg');
var connectionString = 'postgres://localhost:5432/free_cooling';
// heroku database: postgresql-tetrahedral-15645

// Google API key - 'Free Cooling Key'
var latLongKey = 'AIzaSyC2m5hJtKCJ4ENzVrqWrmWFj6yVTl3ZFnQ';

router.get('/:address', function (req, res) {
  var apiCall = 'https://maps.googleapis.com/maps/api/geocode/json?address=' +
    req.params.address + '&key=' + latLongKey;
  console.log(apiCall);
  request(apiCall, function(err, response, location) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    console.log(location);
    res.send(location);
  });
});


module.exports = router;
