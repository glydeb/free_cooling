var express = require('express');
var router = express.Router();
var request = require('request');
var pg = require('pg');
var Forecast = require('forecast.io-bluebird');
var forecast = new Forecast({
  key: process.env.FORECAST_KEY,
  timeout: 2500
});

router.post('/', function (req, res) {

  pg.connect(process.env.DATABASE_URL, function (err, client, done) {
    if (err) {
      res.sendStatus(500);
    }

    client.query('SELECT latitude, longitude FROM devices' +
      ' JOIN conditions ON devices.id = conditions.device_id' +
      ' JOIN locations ON devices.location_id = locations.id' +
      ' JOIN phones ON phones.phone_number = devices.phone_number' +
      ' WHERE allow_alerts = TRUE' +
      ' GROUP BY latitude, longitude',
      function (err, result) {
        done();
        if (err) {
          return;
        }

        if (result !== undefined) {
          result.rows.forEach(function (row, i) {
            forecast.fetch(row.latitude, row.longitude).then(function (result) {
              row.push(result);
            }).catch(function (error) {
              console.log(error);
            });
          });
        }
      }
    );
  });
});


module.exports = router;
