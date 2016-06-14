myApp.controller('StatusController', ['$scope', '$http', '$location', 'DataFactory', function ($scope, $http, $location, DataFactory) {
  console.log('StatusController online');
  $scope.dataFactory = DataFactory;
  $scope.indoor = {};
  $scope.outdoor = {};
  console.log($location.search());
  $scope.setpoint = {
    highLimit: (75.5 * 9 / 5) - 32,
    lowLimit: (70.0 * 9 / 5) - 32,
  };
  $scope.setpoint.wetLimit = absoluteHumidity($scope.setpoint.highLimit, 60);
  $scope.setpoint.dryLimit = absoluteHumidity($scope.setpoint.lowLimit, 35);

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
  queryPhoton(farenheit);
  queryPhoton(celsius);
  var indoorPromise = queryPhoton(rh);

  // Get forecast
  var outdoorPromise = getForecast($location.search());

  // determine absolute humidity
  indoorPromise.then(addAbsoluteHumidity($scope.indoor));
  outdoorPromise.then(addAbsoluteHumidity($scope.outdoor));

  // make recommendation
  recommend();

  // store current data
  $http.post('/data', currentConditions).then(function (response) {
    if (response.status == 201) {
      console.log('Hooray! Fave Saved!');
      getHistory();
    } else {
      console.log('Boo!', response.data);
    }
  });

  function recommend() {
    console.log('Recommend run');
    var recommendation = 'open';

    // check 5 'reasons to close' - too cold inside, and colder outside,
    // too warm inside and warmer outside, too dry inside and drier
    // outside, too wet inside and wetter outside, and rain expected.

  }

  function getHistory() {
    $http.get('/data/' + $scope.device_id);
  }

  function queryPhoton(photonVariable) {
    // Assemble request to paritcle API
    var baseURL = 'https://api.particle.io/v1/devices/';

    // Formulate request to device
    var query = $scope.photonID;
    query += '/' + photonVariable + '?access_token=';
    query += $scope.accessToken;

    var request = baseURL + encodeURI(query);

    // Request temperature from device
    return $http.get(request).then(
      function (response) {
        if (response.status == 200) {
          // Give feedback and proceed to verify location
          $scope.photonResult = 'Success!';
          $scope.indoor[response.data.coreInfo.name] = response.data.coreInfo.result;
        } else {
          $scope.photonResult = 'Failure - returned ' +
            response.statusText;
          return false;
        }
      }
    );

  }

  function absoluteHumidity(celsius, rh) {
    var temp = parseFloat(celsius);
    var logTen = 8.07131 - (1730.63 / (temp + 233.426));
    var satPressure = Math.pow(10, logTen);
    absHumidity = (satPressure * (rh / 100) * 2.1674) / (celsius + 273.15);
    return absHumidity;
  }
}]);
