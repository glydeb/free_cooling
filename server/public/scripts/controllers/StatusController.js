myApp.controller('StatusController', ['$scope', '$http', '$location', 'DataFactory', function ($scope, $http, $location, DataFactory) {
  console.log('StatusController online');
  $scope.dataFactory = DataFactory;

  // Authenticate user
  // Poll device
  // Get forecast
  // determine absolute humidity
  // make recommendation
  // store current data, setup task, display history

  function queryPhoton(photonVariable) {
    // Assemble request to paritcle API
    var baseURL = 'https://api.particle.io/v1/devices/';

    // Formulate request to device
    var query = $scope.photonID;
    query += '/' + photonVariable + '?access_token=';
    query += $scope.accessToken;

    var request = baseURL + encodeURI(query);

    // Request temperature from device
    $http.get(request).then(
      function (response) {
        if (response.status == 200) {
          // Give feedback and proceed to verify location
          $scope.photonResult = 'Success!';
          $scope[response.data.coreInfo.name] = response.data.coreInfo.result;
        } else {
          $scope.photonResult = 'Failure - returned ' +
            response.statusText;
          return false;
        }
      }
    );

  }

}]);
