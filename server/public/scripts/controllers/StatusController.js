myApp.controller('StatusController', ['$scope', '$http', '$location', 'DataFactory', function ($scope, $http, $location, DataFactory) {
  console.log('StatusController online');
  $scope.dataFactory = DataFactory;
  $scope.indoor = {};
  $scope.outdoor = {};
  console.log($location.search());

  // define space condition constraints
  $scope.setpoint = {
    highLimit: (75.5 * 9 / 5) - 32,
    lowLimit: (70.0 * 9 / 5) - 32,
  };
  $scope.setpoint.wetLimit = absoluteHumidity($scope.setpoint.highLimit, 60);
  $scope.setpoint.dryLimit = absoluteHumidity($scope.setpoint.lowLimit, 35);
  var accessToken = '';
  var photonID = '';
  var currentConditions = {};
  var location = {
    latitude: 0,
    longitude: 0
  };

  // Authenticate user
  if ($location.search().device.length === 24) {
    // attempt to retrieve device data
    $scope.wait = $http.get('/data/' + $location.search().device).then(
      function (response) {
        console.log(response);
        if (response.status == 200) {
          // if a good response, populate history table
          $scope.history = response.rows;
          accessToken = response.rows[0].access_token;
          photonID = response.rows[0].id;
          $scope.latitude = response.rows[0].latitude;
          $scope.longitude = response.rows[0].longitude;
          location.latitude = $scope.latitude;
          location.longitude = $scope.longitude;
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

  // Poll device, get forecast, make recommendation
  $scope.wait.then(function () {
    $scope.waitAgain = queryPhoton('celsius').then(queryPhoton('rh').then(
      getForecast().then(recommend())));
  });

  // store current data
  $scope.waitAgain.then($http.post('/data', currentConditions).then(function (response) {
    if (response.status == 201) {
      console.log('Hooray! Current conditions saved!');
    } else {
      console.log('Boo!', response.data);
    }
  }));

  function getForecast() {
    return $http.post('/forecast', location).then(function (response) {
      if (response.status == 200) {
        console.log('Hooray! Forecast received');
      } else {
        console.log('Boo!', response.data);
      }

    });
  }

  function recommend() {
    console.log('Recommend run');
    $scope.recommendation = 'open';
    $scope.reason = 'Free conditioning available';

    // check 5 'reasons to close' - too cold inside, and colder outside,
    // too warm inside and warmer outside, too dry inside and drier
    // outside, too wet inside and wetter outside, and rain expected.

  }

  function queryPhoton(photonVariable) {
    // Assemble request to paritcle API
    var baseURL = 'https://api.particle.io/v1/devices/';

    // Formulate request to device
    var query = photonID;
    query += '/' + photonVariable + '?access_token=';
    query += accessToken;

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
