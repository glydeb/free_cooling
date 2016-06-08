myApp.controller('StatusController', ['$scope', '$http', 'DataFactory', function ($scope, $http, DataFactory) {
  console.log('StatusController online');
/*
  $scope.dataFactory = DataFactory;
  // SendGrid email API key
  eMailKey = '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'

  // Forecast.io API key
  var forecastKey = 'cbd4f63ef2acb744389fa7648c5f4b4e'

  // Sample textbelt text message post:
   curl -X POST http://textbelt.com/text -d number=5551234567 -d "message=I sent this message for free with textbelt.com"

  // Google API key - 'Free Cooling Key'
  latLongKey = 'AIzaSyC2m5hJtKCJ4ENzVrqWrmWFj6yVTl3ZFnQ'

  var key = 'a13d573be80f54aaa3c5bfdfdf8bc460';
  var secret = '53d857e7ec5c210629b03750a5383d2d';
  var baseURL = 'http://api.petfinder.com/';
  $scope.animalTypes = ['barnyard', 'bird', 'cat', 'dog', 'horse', 'pig', 'reptile', 'smallfurry'];

  // make default animal type a dog & initial count 0
  $scope.animalType = $scope.animalTypes[3];
  $scope.faves = [];

  if ($scope.dataFactory.factoryGetFaves() === undefined) {
    $scope.dataFactory.factoryRefreshFaveData().then(function () {
      $scope.faves = $scope.dataFactory.factoryGetFaves();
    });
  } else {
    $scope.faves = $scope.dataFactory.factoryGetFaves();
  }

  $scope.getRandomPet = function () {
    var query = 'pet.getRandom';
    query += '?key=' + key;
    query += '&animal=' + $scope.animalType;
    query += '&output=basic';
    query += '&format=json';

    var request = baseURL + encodeURI(query) + '&callback=JSON_CALLBACK';
    console.log(request);

    $http.jsonp(request).then(
      function (response) {
        console.log(request);
        console.log(response);
        $scope.animal = response.data.petfinder.pet;
        if ($scope.animal.media.photos !== undefined) {
          $scope.photos = $scope.animal.media.photos.photo;
        } else {
          $scope.photos = [];
        }
      }
    );
  };

  $scope.saveFave = function ()  {

    // check for duplicate id
    var found = false;
    var existing = $scope.faves;
    existing.forEach(function (fave) {
      console.log(fave.id);
      if (fave.id == $scope.animal.id.$t) {
        found = true;
      }
    });

    if (found) {
      alert('That animal is already one of your favorites!');
    } else {
      var data = {
        id: $scope.animal.id.$t,
        name: $scope.animal.name.$t,
        animalType: $scope.animal.animal.$t
      };

      // check for photo
      if ($scope.photos[1] !== undefined) {
        data.photoURL = $scope.photos[1].$t;
      }

      if ($scope.animal.description.$t !== undefined) {
        data.description = $scope.animal.description.$t.substr(0, 100);
      }

      $scope.dataFactory.factorySaveFave(data).then(function () {
        console.log('done saving');
        $scope.faves = $scope.dataFactory.factoryGetFaves();
      });
    }
  };
*/
}]);
