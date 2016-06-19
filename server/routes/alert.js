var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var pg = require('pg');
var moment = require('moment');
var recommend = require('../public/scripts/recommend');
var calc = require('../public/scripts/calc');
var Forecast = require('forecast.io-bluebird');
var forecast = new Forecast({
  key: process.env.FORECAST_KEY,
  timeout: 2500
});
var apiPromises = [];
var forecastCalls = [];
var photonCalls = [];
var evaluation = [];

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
            // console.log('forecast queried', apiPromises);
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
        // console.log('Photon query', result);
        if (err) {
          done();
          return;
        }

        if (result !== undefined) {
          result.rows.forEach(function (row, i, array) {
            apiPromises.push(queryPhoton('celsius', row.id, row.access_token));
            // console.log('celsius queried', apiPromises);
            apiPromises.push(queryPhoton('humidity', row.id, row.access_token));
            // console.log('rh queried', apiPromises);
          });

          photonCalls = result.rows;
          // console.log(result.rows);
        }
      }
    );

    client.query('SELECT devices.id, MAX(date_time) as last_recommended,' +
      ' latitude, longitude, devices.phone_number, start_time, end_time,' +
      ' recommend, nickname FROM devices' +
      ' JOIN conditions ON devices.id = conditions.device_id' +
      ' JOIN locations ON devices.location_id = locations.id' +
      ' JOIN phones ON phones.phone_number = devices.phone_number' +
      ' WHERE allow_alerts = TRUE' +
      ' GROUP BY devices.id, recommend, latitude, longitude,' +
      ' devices.phone_number, start_time, end_time, nickname' +
      ' ORDER BY devices.id, last_recommended DESC',
      function (err, result) {
        done();
        if (err) {
          console.log(err);
          return;
        }

        if (result !== undefined) {
          result.rows.forEach(function (row, i) {
            if (i % 2 === 0) {
              evaluation.push(row);
            }
          });

          var setpoint = {
            highLimit: ((75.5 - 32) * 5 / 9),
            lowLimit: ((70.0 - 32) * 5 / 9)
          };

          setpoint.wetLimit = calc.absoluteHumidity(setpoint.highLimit, 60);
          setpoint.dryLimit = calc.absoluteHumidity(setpoint.lowLimit, 35);
          Promise.all(apiPromises).then(function (results) {
            console.log('begin apiPromises: ', apiPromises);
            // parse returns of API calls
            results.forEach(function (row, i) {
              console.log('Entered results process loop, index: ', i);
              console.log('result to process: ', row.data);
              // if there's a currently key, it's a forecast.io return
              if (row.data.currently !== undefined) {
                console.log('Processing forecast return');
                // loop through the recommendations and pair up the forecasts
                for (var j = 0; j < evaluation.length; j++) {
                  // if the lat & long matches, add the forecast object
                  // to the recommendation object
                  if (evaluation[j].latitude === row.data.latitude &&
                    evaluation[j].longitude === row.data.longitude) {
                    evaluation[j].outdoor = row.data.currently;
                  }
                }

              // if it's not a forecast, it's a device reading
              } else {
                // loop through the recommendations and pair up the forecasts
                for (var k = 0; k < evaluation.length; k++) {
                  // if the device ID matches, add the reading
                  // to the recommendation object
                  if (evaluation[k].id ===
                    row.data.config.url.substr(35, 24)) {
                    // character at position 60 is either a 'c' or an 'r'
                    // c is a temp reading, r is humidity.  Store accordingly.
                    if (row.data.config.url.substr(60, 1) === 'c') {
                      console.log('Storing celsius data');
                      evaluation[k].indoor.celsius = row.data.result;
                    } else {
                      evaluation[k].indoor.rh = row.data.result;
                      console.log('Storing humidity data');
                    }
                  }
                }
              }
            });

            // add absolute humidity to evaluation objects
            evaluation.forEach(function (element, i) {
              evaluation[i].outdoor.absHumidity =
                calc.ababsoluteHumidity(element.outdoor.celsius,
                element.outdoor.humidity * 100);
              evaluation[i].indoor.absHumidity =
                calc.ababsoluteHumidity(element.indoor.celsius,
                element.indoor.rh);

              // get recommendation for each evaluation and compare to last
              // recommendation, and push to alert queue if different
              var newRecommend = recommend.algorithm(element.indoor,
                element.outdoor, setpoint);
              if (newRecommend !== element.last_recommended) {
                console.log('change in recommendation found');
                evaluation[i].last_recommended = newRecommend;
                var alertString = makeAlertString(alertIntro, newRecommend,
                  alertQueue[element.phone_number]);

                // create alert if it doesn't exist, otherwise append to it.
                if (alertQueue[element.phone_number] === undefined) {
                  alertQueue[element.phone_number] = alertString;
                } else {
                  alertQueue[element.phone_number].replace(/\.$/,
                    alertString);
                }
              }

            });

            if (alertQueue !== {}) {
              console.log('send alerts called');
              sendAlerts(alertQueue);
            }
          });

        }
      }
    );
    console.log('end of post reached');
    res.sendStatus(200);
  });
});

function sendAlerts(queue) {
  console.log('sendAlerts');
  var request = '';
  var options = { method: 'POST' };
  for (var phone in queue) {
    request = 'http://textbelt.com/text?number=';
    request += phone + '&message=' + queue[phone];
    options.uri = request;
    rp(options).then(
      console.log('alert sent to ' + phone)
    ).catch(console.log('failed to send to ' + phone));
  }
}

function makeAlertString(alertIntro, newRec, existAlert) {
  var alertString = '';
  if (existAlert === undefined) {
    alertString = alertIntro;
  } else {
    alertString = ' and ';
  }

  if (newRec === 'Open') {
    alertString += 'opening';
  } else {
    alertString += 'closing';
  }

  alertString += 'the windows near "';
  alertString += element.nickname + '".';
  return alertString;
}

function createAlertQueue() {
  // get absolute humidity for indoor/outdoor/setpoints
  // create objects to feed to recommend function
  console.log('createAlertQueue');
}

function queryPhoton(photonVariable, photonID, accessToken) {
  // Assemble request to paritcle API
  var options = {
    uri: 'https://api.particle.io/v1/devices/' + photonID + '/' +
     photonVariable,
    qs: {
      access_token: accessToken
    },
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true
  };

  // Request temperature from device
  return rp(options);

}

module.exports = router;
