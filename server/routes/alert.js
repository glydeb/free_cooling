var express = require('express');
var router = express.Router();
var request = require('request');
var pg = require('pg');
var Forecast = require('forecast.io-bluebird');
var forecast = new Forecast({
  key: process.env.FORECAST_KEY,
  timeout: 2500
});
var apiPromises = [];
var forecastCalls = [];
var photonCalls = [];
var lastRecommendations = [];

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
        if (err) {
          done();
          return;
        }

        if (result !== undefined) {
          result.rows.forEach(function (row, i, array) {
            apiPromises.push(forecast.fetch(row.latitude, row.longitude));
          });
          forecastCalls = result.rows;
        }
      }
    );

    client.query('SELECT id, access_token FROM devices' +
      ' JOIN conditions ON devices.id = conditions.device_id' +
      ' JOIN locations ON devices.location_id = locations.id' +
      ' JOIN phones ON phones.phone_number = devices.phone_number' +
      ' WHERE allow_alerts = TRUE' +
      ' GROUP BY id, access_token',
      function (err, result) {
        if (err) {
          done();
          return;
        }

        if (result !== undefined) {
          result.rows.forEach(function (row, i, array) {
            apiPromises.push(queryPhoton('celsius'));
            apiPromises.push(queryPhoton('rh'));
          });

          photonCalls = result.rows;
          console.log(result.rows);
        }
      }
    );

    client.query('SELECT devices.id, MAX(date_time) as last_recommended,' +
      ' recommend FROM devices' +
      ' JOIN conditions ON devices.id = conditions.device_id' +
      ' JOIN locations ON devices.location_id = locations.id' +
      ' JOIN phones ON phones.phone_number = devices.phone_number' +
      ' WHERE allow_alerts = TRUE' +
      ' GROUP BY devices.id, recommend' +
      ' ORDER BY devices.id, last_recommended DESC',
      function (err, result) {
        done();
        if (err) {
          return;
        }

        if (result !== undefined) {
          result.rows.forEach(function (row, i) {
            if (i % 2 === 0) {
              lastRecommendations.push(row);
            }
          });
          console.log(lastRecommendations);
        }
      }
    );
    Promise.all(apiPromises).then(console.log('promises satisfied'));
    console.log('end of post reached')
  });
});

function queryPhoton(photonVariable, photonID, accessToken) {
  // Assemble request to paritcle API
  var baseURL = 'https://api.particle.io/v1/devices/';

  // Formulate request to device
  var query = photonID;
  query += '/' + photonVariable + '?access_token=';
  query += accessToken;

  var apiCall = baseURL + encodeURI(query);

  // Request temperature from device
  return request(apiCall, function (err, status, photonResponse) {
    if (err) {
      return -1;
    } else {
      return photonResponse;
    }
  });

}

module.exports = router;
