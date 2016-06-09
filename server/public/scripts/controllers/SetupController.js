myApp.controller('SetupController', ['$scope', '$http', 'DataFactory', function ($scope, $http, DataFactory) {
  console.log('SetupController online');
  $scope.dataFactory = DataFactory;
  $scope.fullDay = $scope.dataFactory.factoryHourArray();
  $scope.setup = {};
  $scope.location = {};

  // preload Sparky's info
  $scope.setup.photonID = '2a0035001247343431373336';
  $scope.setup.accessToken = 'b755de087c92b9d21ea7e0bd10a58af2bf326e45';

  $scope.submitAndTest = function () {

    // display photon testing string and ping photon for temperature
    $scope.testPhoton = true;

    // Assemble request to paritcle API
    var baseURL = 'https://api.particle.io/v1/devices/';

    //check that deviceID and access_token are present
    if ($scope.setup.photonID === '' || $scope.setup.accessToken === '') {
      $scope.testPhotonResult = 'Invalid ID or Token - please revise and resubmit';
      console.log($scope.setup.photonID);
      return false;
    } else {
      var query = $scope.setup.photonID;
      query += '/farenheit?access_token=';
      query += $scope.setup.accessToken;

      var request = baseURL + encodeURI(query);
      console.log(request);

      $http.get(request).then(
        function (response) {
          if (response.status == 200) {
            $scope.testPhotonResult = 'Success!';
          } else {
            $scope.testPhotonResult = 'Failure - returned ' +
              response.statusText;
          }
        }
      );

    }

    // attempt to get valid conditions from the photon
  };

  $scope.removeDevice = function (deviceID) {

  };

/*  $scope.faves = [];

  if ($scope.dataFactory.factoryGetFaves() === undefined) {
    $scope.dataFactory.factoryRefreshFaveData().then(function () {
      $scope.faves = $scope.dataFactory.factoryGetFaves();
    });
  } else {
    $scope.faves = $scope.dataFactory.factoryGetFaves();
  }

  $scope.deleteFav = function (id) {
    $http.delete('/pets/' + id)
      .then(function (response) {
        console.log('DELETE /pets ', id);
        $scope.dataFactory.factoryRefreshFaveData().then(function () {
          $scope.faves = $scope.dataFactory.factoryGetFaves();
        });
      });
  };
*/
}]);
