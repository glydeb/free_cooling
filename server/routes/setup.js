var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = 'postgres://localhost:5432/free_cooling';

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

router.post('/', function (req, res) {
  var pet = new Pet(req.body);
  pet.save(function (err) {
    if (err) {
      res.sendStatus(500);
      return;
    }

    res.sendStatus(201);
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
