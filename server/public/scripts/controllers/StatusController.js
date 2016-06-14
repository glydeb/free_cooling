myApp.controller('StatusController', ['$scope', '$http', '$location', 'DataFactory', function ($scope, $http, $location, DataFactory) {
  console.log('StatusController online');
  $scope.dataFactory = DataFactory;
  $scope.indoor = {};
  $scope.outdoor = {};
  console.log($location.search());

  // Authenticate user
  if ($location.search().device.length === 24) {
    // attempt to retrieve device data
    $http.get('/data/' + $location.search().device).then(
      function (response) {
        console.log(response);
        if (response.status == 200) {
          // if a good response, populate history table
          $scope.history = response.rows;
        } else {
          // more error handling here.
          // but if the device id isn't found, it's a bad link - redirect
          $location.path('/reminder');
        }
      }
    );
  } else {
    // invalid login, redirect to reminder page
    $location.path('/reminder');
  }
  // Poll device
  $scope.indoor.temp = queryPhoton(farenheit);
  $scope.indoor.celsius = queryPhoton(celsius);
  $scope.indoor.rh = queryPhoton(rh);
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
