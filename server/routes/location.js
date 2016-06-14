var express = require('express');
var router = express.Router();
var request = require('request');
var pg = require('pg');

router.get('/:address', function (req, res) {
  var apiCall = 'https://maps.googleapis.com/maps/api/geocode/json?address=' +
    req.params.address + '&key=' + process.env.LATLONG_KEY;
  console.log(apiCall);
  request(apiCall, function (err, response, location) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    console.log(location);
    res.send(location);
  });
});


module.exports = router;
