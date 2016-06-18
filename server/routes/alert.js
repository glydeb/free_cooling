var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var pg = require('pg');
var moment = require('moment');
var recommend = require('../public/scripts/recommend');
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
            console.log('forecast queried', apiPromises);
          });

          forecastCalls = result.rows;
        }
      }
    );

    client.query('SELECT devices.id, access_token FROM devices' +
      ' JOIN conditions ON devices.id = conditions.device_id' +
      ' JOIN locations ON devices.location_id = locations.id' +
      ' JOIN phones ON phones.phone_number = devices.phone_number' +
      ' WHERE allow_alerts = TRUE' +
      ' GROUP BY devices.id, access_token',
      function (err, result) {
        console.log('Photon query', result);
        if (err) {
          done();
          return;
        }

        if (result !== undefined) {
          result.rows.forEach(function (row, i, array) {
            apiPromises.push(queryPhoton('celsius', row.id, row.access_token));
            console.log('celsius queried', apiPromises);
            apiPromises.push(queryPhoton('rh', row.id, row.access_token));
            console.log('rh queried', apiPromises);
          });

          photonCalls = result.rows;
          console.log(result.rows);
        }
      }
    );

    client.query('SELECT devices.id, MAX(date_time) as last_recommended, latitude, longitude,' +
      ' recommend FROM devices' +
      ' JOIN conditions ON devices.id = conditions.device_id' +
      ' JOIN locations ON devices.location_id = locations.id' +
      ' JOIN phones ON phones.phone_number = devices.phone_number' +
      ' WHERE allow_alerts = TRUE' +
      ' GROUP BY devices.id, recommend, latitude, longitude' +
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

          var setpoint = {
            highLimit: ((75.5 - 32) * 5 / 9),
            lowLimit: ((70.0 - 32) * 5 / 9)
          };

          setpoint.wetLimit = calc.absoluteHumidity(setpoint.highLimit, 60);
          setpoint.dryLimit = calc.absoluteHumidity(setpoint.lowLimit, 35);
          console.log(lastRecommendations);
          Promise.all(apiPromises).then(function (results) {
            // load objects for recommendation calculation
            console.log('promise then');
          });
          createAlertQueue();
          if (alerts.length > 0) {
            sendAlerts();
          }
        }
      }
    );
    console.log('end of post reached');
    res.sendStatus(200);
  });
});

function sendAlerts() {
  console.log('sendAlerts');
  /*
    // Sample textbelt text message post:
     curl -X POST http://textbelt.com/text -d number=5551234567 -d "message=I sent this message for free with textbelt.com"
  */
}

function createAlertQueue() {
  // get absolute humidity for indoor/outdoor/setpoints
  // create objects to feed to recommend function
  console.log('createAlertQueue');
}

function queryPhoton(photonVariable, photonID, accessToken) {
  // Assemble request to paritcle API
  var baseURL = 'https://api.particle.io/v1/devices/';

  // Formulate request to device
  var query = photonID;
  query += '/' + photonVariable + '?access_token=';
  query += accessToken;

  var apiCall = { uri: baseURL + encodeURI(query) };

  // Request temperature from device
  return rp(apiCall);

}

module.exports = router;
