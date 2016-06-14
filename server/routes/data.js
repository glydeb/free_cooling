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

    client.query('SELECT date_time, indoor_temp, indoor_rh, outdoor_temp,' +
      ' outdoor_rh, precip, recommend, devices.id, access_token,' +
      ' latitude, longitude FROM conditions' +
      ' JOIN devices on devices.id = conditions.device_id' +
      ' JOIN locations on devices.location_id = locations.id' +
      ' WHERE devices.hash = $1' +
      ' ORDER BY date_time DESC',
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

module.exports = router;
