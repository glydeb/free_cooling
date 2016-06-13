var express = require('express');
var router = express.Router();
var request = require('request');
var pg = require('pg');
// heroku database: postgresql-tetrahedral-15645
var connectionString = 'postgres://localhost:5432/free_cooling';
var sendgrid  = require('sendgrid')('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');
var reminder   = {
  from: 'lonehawk40@gmail.com',
  subject: 'Reminder link',
  html: '<p>Welcome back to Free Cooling! Click the following link to return to the main site.</p>'
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
        invitation.to = reminder.email;
        invitation.html += '<a href="https://freecooling.herokuapp.com/status?device=';
        invitation.html += result.rows[0] + '">Free Cooling</a>';
        sendgrid.send(invitation, function (err, json) {
          if (err) { console.error(err); }

          console.log(json);
        });

        res.sendStatus(200);
      }
    );
  });
});

module.exports = router;
