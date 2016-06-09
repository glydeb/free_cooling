myApp.controller('StatusController', ['$scope', '$http', 'DataFactory', function ($scope, $http, DataFactory) {
  console.log('StatusController online');
  $scope.dataFactory = DataFactory;
/*
  if ($scope.dataFactory.factoryGetFaves() === undefined) {
    $scope.dataFactory.factoryRefreshFaveData().then(function () {
      $scope.faves = $scope.dataFactory.factoryGetFaves();
    });
  } else {
    $scope.faves = $scope.dataFactory.factoryGetFaves();
  }

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
