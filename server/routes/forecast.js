var express = require('express');
var router = express.Router();
var request = require('request');
var Forecast = require('forecast.io-bluebird');
var forecast = new Forecast({
  key: process.env.FORECAST_KEY,
  timeout: 2500
});

router.post('/', function (req, res) {
  var latitude = req.body.latitude;
  var longitude = req.body.longitude;
  forecast.fetch(latitude, longitude).then(function (result) {
    res.send(result);
  }).catch(function (error) {
    console.log(error);
  });
});

module.exports = router;
