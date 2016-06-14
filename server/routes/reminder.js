var express = require('express');
var router = express.Router();
var request = require('request');
var pg = require('pg');
// heroku database: postgresql-tetrahedral-15645
var connectionString = 'postgres://localhost:5432/free_cooling';
var sendgrid  = require('sendgrid')(process.env.SENDGRID_KEY);
var reminderEmail = {
  from: process.env.FROM_EMAIL,
  subject: 'Free Cooling reminder link',
  text: 'Welcome back to Free Cooling! Click the following link to return to the main site.\n\n'
};

router.post('/', function (req, res) {
  var reminder = req.body;

  pg.connect(process.env.DATABASE_URL || connectionString, function (err, client, done) {
    if (err) {
      res.sendStatus(500);
    }

    client.query('SELECT hash FROM devices WHERE email = $1 AND id = $2',
     [reminder.email, reminder.photonID],
      function (err, result) {
        done();
        if (err) {
          res.sendStatus(500);
          return;
        }

        console.log(result);
        reminderEmail.to = reminder.email;
        reminderEmail.text += 'https://freecooling.herokuapp.com/status?device=';
        reminderEmail.text += result.rows[0].hash;
        sendgrid.send(reminderEmail, function (err, json) {
          if (err) { console.error(err); }

          console.log(json);
        });

        res.sendStatus(200);
      }
    );
  });
});

module.exports = router;
