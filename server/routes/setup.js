var express = require('express');
var router = express.Router();
var request = require('request');
var pg = require('pg');
// heroku database: postgresql-tetrahedral-15645
var connectionString = 'postgres://localhost:5432/free_cooling';
var sendgrid  = require('sendgrid')(process.env.SENDGRID_KEY);
var usedHash = [];
var invitation   = {
  from: process.env.FROM_EMAIL,
  subject: 'Welcome to Free Cooling!',
  text: 'Thank you for signing up with Free Cooling. Click the following link to visit the main site:\n\n'
};

pg.connect(process.env.DATABASE_URL || connectionString, function (err, client, done) {
  client.query('SELECT hash from devices',
    function (err, result) {
      done();
      if (err) {
        return;
      }

      if (result !== undefined) { usedHash = result.rows; }

      console.log(usedHash);

    });
});

router.post('/', function (req, res) {
  var setup = req.body;

  pg.connect(process.env.DATABASE_URL || connectionString, function (err, client, done) {
    if (err) {
      res.sendStatus(500);
    }

    client.query('INSERT INTO locations (street_address, city, state, zip, ' +
      ' latitude, longitude)' +
      'VALUES ($1, $2, $3, $4, $5, $6) returning id', [setup.address,
      setup.city, setup.state, setup.zip, setup.lat, setup.long],
      function (err, result) {

        if (err) {
          done();
          res.sendStatus(500);
          return;
        }

        console.log(result);
        var location = result.rows[0].id;
        if (setup.phone !== undefined) {
          if (setup.startTime === undefined) {
            setup.startTime = null;
            setup.endTime = null;
          }
          client.query('INSERT INTO phones (phone_number, allow_alerts, ' +
            ' start_time, end_time)' +
            'VALUES ($1, $2, $3, $4)', [setup.phone, setup.allow_alerts,
            setup.startTime, setup.endTime],
            function (err, result) {

              if (err) {
                done();
                res.sendStatus(500);
                return;
              }

              devicesInsert(client, done, location, setup, res);
            });
        } else {
          devicesInsert(client, done, location, setup, res);
        }
      }
    );
  });
});

function devicesInsert(client, done, locationID, setup, res) {
  if (setup.phone === undefined) {setup.phone = null;}
  if (setup.nickname === undefined) {setup.nickname = null;}

  var hash = makeID(24);
  while (usedHash.indexOf(hash) > 0) {hash = makeID(24);}
  client.query('INSERT INTO devices (id, location_id, access_token, ' +
    'nickname, phone_number, hash, email)' +
    'VALUES ($1, $2, $3, $4, $5, $6, $7)', [setup.device_id, locationID,
    setup.access_token, setup.nickname, setup.phone, hash, setup.email],
    function (err, result) {
      done();

      if (err) {
        res.sendStatus(500);
        return;
      }

      invitation.to = setup.email;
      invitation.text += 'https://freecooling.herokuapp.com/status?device=';
      invitation.text += hash;
      sendgrid.send(invitation, function(err, json) {
        if (err) { console.error(err); }
        console.log(json);
      });

      res.sendStatus(201);
    });
}

function makeID(len) {
  var text = [];
  var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < len; i++) {
    text.push(possible.charAt(Math.floor(Math.random() * possible.length)));
  }

  return text.join().replace(/,/g, '');
}

/*
router.get('/', function (req, res) {
  Pet.find({}, function (err, movies) {
    if (err) {
      res.sendStatus(500);
      return;
    }

    res.send(movies);
  });
});

router.delete('/:id', function (req, res) {
  Pet.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      res.sendStatus(500);
      return;
    }

    res.sendStatus(204);
  });
});
*/
module.exports = router;
