var express = require('express');
var router = express.Router();
var request = require('request');
var pg = require('pg');
var connectionString = 'postgres://localhost:5432/free_cooling';

router.get('/:hash', function (req, res) {
  var hash = req.params.hash;

  pg.connect(process.env.DATABASE_URL || connectionString, function (err, client, done) {
    if (err) {
      res.sendStatus(500);
    }

    client.query('SELECT *, devices.id as deviceID FROM devices' +
      ' LEFT OUTER JOIN phones on devices.phone_number =' +
      ' phones.phone_number' +
      ' JOIN locations on devices.location_id = locations.id' +
      ' WHERE devices.hash = $1' +
      [hash],
      function (err, result) {
        done();
        if (err) {
          res.sendStatus(500);
          return;
        }

        console.log(result);
        res.send(result.rows);
      }
    );
  });
});

router.put('/', function (req, res) {

  var settings = req.body;

  pg.connect(process.env.DATABASE_URL || connectionString, function (err, client, done) {
    if (err) {
      res.sendStatus(500);
    }

    client.query('INSERT INTO conditions (date_time, indoor_temp, indoor_rh,' +
      ' outdoor_temp, outdoor_rh, precip, recommend, device_id)' +
      ' VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [conditions.date, conditions.indoorTemp, conditions.indoorRH,
      conditions.outdoorTemp, conditions.outdoorRH, conditions.precip,
      conditions.recommendation, conditions.deviceID],
      function (err, result) {
        done();
        if (err) {
          res.sendStatus(500);
          return;
        }

        console.log(result);
        res.sendStatus(201);
      }
    );
  });
});

module.exports = router;
