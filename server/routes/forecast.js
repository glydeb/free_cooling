var express = require('express');
var router = express.Router();
var request = require('request');
var Forecast = require('forecast.io-bluebird');
var forecast = new Forecast({
  key: process.env.FORECAST_KEY,
  timeout: 2500
});

router.post('/', function (req, res) {
  forecast.fetch(latitude, longitude).then(function (result) {
    console.log(result);
    res.send(result);
  }).catch(function (error) {
    console.log(error);
  });
});

module.exports = router;
