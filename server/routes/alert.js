var express = require('express');
var router = express.Router();
var pg = require('pg');
var Particle = require('particle-api-js');
var particle = new Particle();
var request = require('request');
var recommend = require('../public/scripts/recommend');
var calc = require('../public/scripts/calc');
var Forecast = require('forecast.io-bluebird');
var forecast = new Forecast({
  key: process.env.FORECAST_KEY,
  timeout: 2500
});

// this variable stores the promises created by api calls so that the routine
// will wait until all are satisfied before sending alerts
var apiPromises = [];
var evaluation = [];
var alertIntro = 'Free cooling recommends ';

router.post('/', function (req, res) {

  pg.connect(process.env.DATABASE_URL, function (err, client, done) {
    if (err) {
      res.sendStatus(500);
    }

    // Get a list of all locations that need a forecast
    // Need to decide how local a forecast should be in terms of lat/long
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

        // if there are results from the query, make api calls to forecast.io
        // and store the promises in the promise array
        if (result.rowCount > 0) {
          result.rows.forEach(function (row) {
            apiPromises.push(forecast.fetch(row.latitude, row.longitude));
            console.log('forecast queried');
          });
        }
      }
    );

    // Get a list of all devices to query
    client.query('SELECT devices.id, access_token FROM devices' +
      ' JOIN conditions ON devices.id = conditions.device_id' +
      ' JOIN locations ON devices.location_id = locations.id' +
      ' JOIN phones ON phones.phone_number = devices.phone_number' +
      ' WHERE allow_alerts = TRUE' +
      ' GROUP BY devices.id, access_token',
      function (err, result) {
        if (err) {
          done();
          return;
        }

        // if there are devices found, make api calls to particle api and
        // store promises in the promises array
        if (result.rowCount > 0) {
          result.rows.forEach(function (row) {
            apiPromises.push(queryPhoton('celsius', row.id, row.access_token));
            apiPromises.push(queryPhoton('humidity', row.id, row.access_token));
            console.log('device queried:', row.id);
          });
        }
      }
    );

    // Get all information necessary to formulate & send recommendations
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
        if (err) {
          done();
          return;
        }

        // decide which results from the query to evaluate
        // Based on which result is the latest recommendation
        if (result.rowCount > 0) {
          result.rows.forEach(function (row, i) {

            // The first record is always a latest recommendation
            if (i === 0) {
              row.indoor = {};
              evaluation.push(row);
            } else {

              // after that, a record is a latest recommendation only if
              // it has a different id from the previous record.
              var last = i - 1;
              if (row.id !== result.rows[last].id) {
                row.indoor = {};
                evaluation.push(row);
              }
            }
          });
          console.log('at end of evaluation build, # of array elements:', evaluation.length);

          // hardcoded at present, make a variable in the future
          var setpoint = {
            highLimit: ((75.5 - 32) * 5 / 9),
            lowLimit: ((70.0 - 32) * 5 / 9)
          };

          // add humidity limits to the setpoint object
          setpoint.wetLimit = calc.absoluteHumidity(setpoint.highLimit, 60);
          setpoint.dryLimit = calc.absoluteHumidity(setpoint.lowLimit, 35);
          Promise.all(apiPromises).then(function (results) {

            // parse returns of API calls
            results.forEach(function (row, i) {
              console.log('Entered results process loop, index: ', i);
              // if there's a currently property, it's a forecast.io return
              if (row.hasOwnProperty('currently')) {
                console.log('Processing forecast return');
                // loop through the recommendations and pair up the forecasts
                for (var j = 0; j < evaluation.length; j++) {
                  // if the lat & long matches, add the forecast object
                  // to the recommendation object and add a celsius property
                  if (evaluation[j].latitude == row.latitude &&
                    evaluation[j].longitude == row.longitude) {
                    evaluation[j].outdoor = row.currently;
                    evaluation[j].outdoor.humidity =
                      Math.round(evaluation[j].outdoor.humidity * 100);
                    evaluation[j].outdoor.celsius =
                      (row.currently.temperature - 32) * 5 / 9;
                    evaluation[j].offset = row.offset;
                    evaluation[j].date_time = new Date();
                  }
                }

              // if it's not a forecast, it's a device reading
              } else {
                // loop through the recommendations and pair up the forecasts
                for (var k = 0; k < evaluation.length; k++) {
                  // if the device ID matches, add the reading
                  // to the recommendation object
                  if (evaluation[k].id === row.body.coreInfo.deviceID) {
                    // character at position 60 is either a 'c' or an 'r'
                    // c is a temp reading, r is humidity.  Store accordingly.
                    if (row.body.name.substr(0, 1) === 'c') {
                      console.log('Storing celsius data');
                      evaluation[k].indoor.celsius = row.body.result;
                    } else {
                      evaluation[k].indoor.rh = roundToDecimals(
                        row.body.result, 1);
                      console.log('Storing humidity data');
                    }
                  }
                }
              }
            });

            // alert handling variables
            var alertQueue = {};
            var alertString = '';
            var existAlert = false;
            var alertsFound = false;
            evaluation.forEach(function (element, i) {
              // add absolute humidity to evaluation objects
              evaluation[i].outdoor.absHumidity =
                calc.absoluteHumidity(element.outdoor.celsius,
                element.outdoor.humidity);
              evaluation[i].indoor.absHumidity =
                calc.absoluteHumidity(element.indoor.celsius,
                element.indoor.rh);

              // get recommendation for each evaluation
              var newRecommend = recommend.algorithm(element.indoor,
                element.outdoor, setpoint);
              // create indoor farenheit property to store in database
              element.indoor.farenheit = roundToDecimals(
                (element.indoor.celsius * 1.8) + 32, 1);

              // store conditions and recommendation in database
              client.query('INSERT INTO conditions (date_time, indoor_temp,' +
                ' indoor_rh, outdoor_temp, outdoor_rh, precip, recommend,' +
                ' device_id)' +
                ' VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [element.date_time, element.indoor.farenheit, element.indoor.rh,
                element.outdoor.temperature, element.outdoor.humidity,
                element.outdoor.precipProbability, newRecommend.recommendation, element.id],
                function (err, result) {
                  if (err) {
                    done();
                    return;
                  }
                }
              );

              // compare to last recommendation, and push to alert queue
              // if different
              if (newRecommend.recommendation !== element.recommend  &&
                 checkAlertsEnabled(element)) {
                console.log('change in recommendation found');
                alertsFound = true;
                evaluation[i].recommend = newRecommend.recommendation;
                existAlert = alertQueue.hasOwnProperty(element.phone_number);
                alertString = makeAlertString(alertIntro,
                  newRecommend.recommendation, existAlert,
                  element.nickname);
                console.log('Alert string created:', alertString);

                // create alert if it doesn't exist, otherwise append to it.
                if (existAlert) {
                  alertQueue[element.phone_number] =
                    alertQueue[element.phone_number].replace(/\.$/,
                    alertString);
                } else {
                  alertQueue[element.phone_number] = alertString;
                }
              }

            });
            done();

            if (alertsFound) {
              console.log('send alerts called');
              sendAlerts(alertQueue);
            }

            // zero out evaluation & apiPromises arrays for next run through
            evaluation = [];
            apiPromises = [];
            console.log('evaluation and apiPromises arrays cleared');

          });

        }
      }
    );
    res.sendStatus(200);
  });
});

function checkAlertsEnabled(element) {
  var start = timeToHour(element.start_time);
  var end = timeToHour(element.end_time);
  if (end < start) { end += 24; }
  var current = element.date_time.getHours() + element.offset;
  if (current < start) { current += 24; }
  return (current < end);
}

function timeToHour(time) {
  return parseInt(time.substr(0,2).replace(/^0/,''));
}

function sendAlerts(queue) {
  var options = {};
  for (var phone in queue) {
    console.log('sending to: ', phone);
    options.form = {
      number: phone,
      message: queue[phone]
    };
    console.log(options);
    request.post('http://textbelt.com/text', options, alertsSent);
  }
}

function alertsSent (err, res) {
  if (err) {
    console.log('Send failed', err);
  } else {
    console.log('alert sent:', res);
  }
}

function makeAlertString(alertIntro, newRec, existAlert, nickname) {
  var alertString = '';
  if (existAlert) {
    alertString = ' and ';
  } else {
    alertString = alertIntro;
  }

  if (newRec === 'Open') {
    alertString += 'opening';
  } else {
    alertString += 'closing';
  }

  alertString += ' the windows near ';
  alertString += nickname + '.';
  return alertString;
}

function queryPhoton(photonVariable, photonID, accessToken) {
  // Assemble request to paritcle API
  var options = {
    deviceId: photonID,
    name: photonVariable,
    auth: accessToken
  };

  return particle.getVariable(options);
}

function roundToDecimals(num, decimals) {
  var powerOfTen = 1;
  for (var x = 0; x < decimals; x++) {
    powerOfTen *= 10;
  }
  return Math.round(num * powerOfTen) / powerOfTen;
}

module.exports = router;
