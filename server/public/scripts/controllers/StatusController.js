myApp.controller('StatusController', ['$scope', '$http', '$location', '$q', 'DataFactory', function ($scope, $http, $location, $q, DataFactory) {
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
  var promise = {};
  var location = {
    latitude: 0,
    longitude: 0
  };

  // Authenticate user
  if ($location.search().device.length === 24) {
    // attempt to retrieve device data
    promise = $http.get('/data/' + $location.search().device).then(
      function (response) {
        console.log(response);
        if (response.status == 200) {
          // if a good response, populate history table & model
          $scope.history = response.data;
          accessToken = response.data[0].access_token;
          photonID = response.data[0].deviceID;
          $scope.information = response.data[0];
          location.latitude = response.data[0].latitude;
          location.longitude = response.data[0].longitude;
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

  // Gather all data for page - indoor & outdoor conditions & forecast
  // then process recommendation & save data
  promise.then($q.all([
    queryPhoton('celsius'),
    queryPhoton('rh'),
    getForecast()
  ]).then(recommend()));

  function getForecast() {
    return $http.post('/forecast', location).then(function (response) {
      if (response.status == 200) {
        $scope.outdoor = response;
        console.log('Hooray! Forecast received', response);
      } else {
        console.log('Boo!', response.data);
      }

    });
  }

  function recommend() {
    console.log('Recommend run');

    // convert photon output for display
    $scope.indoor.farenheit = ($scope.indoor.celsius * 1.8) + 32;

    //fill currentConditions object
    currentConditions.date = new Date();
    currentConditions.indoorTemp = $scope.indoor.farenheit;
    currentConditions.indoorRH = $scope.indoor.rh;
    currentConditions.outdoorTemp = $scope.outdoor.temp;
    currentConditions.outdoorRH = $scope.outdoor.rh;
    currentConditions.precip = $scope.outdoor.forecast;
    currentConditions.deviceID = photonID;

    $scope.recommendation = 'Open';
    $scope.reason = 'Free conditioning available';

    // check 5 'reasons to close' - too cold inside, and colder outside,
    // too warm inside and warmer outside, too dry inside and drier
    // outside, too wet inside and wetter outside, and rain expected.
    currentConditions.recommendation = $scope.recommendation;

    // Save all data
    $http.post('/data', currentConditions).then(function (response) {
      if (response.status == 201) {
        console.log('Hooray! Current conditions saved!');
      } else {
        console.log('Boo!', response.data);
      }
});
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
        }
      }
    );

  }

  function absoluteHumidity(celsius, rh) {
    var temp = parseFloat(celsius);
    var logTen = 8.07131 - (1730.63 / (temp + 233.426));
    var satPressure = Math.pow(10, logTen);
    absHumidity = (satPressure * (rh / 100) * 2.1674) / (celsius + 273.15);
    var echo = celsius + 'deg. C, ' + rh + '% rh, ' + absHumidity + 'mmHg';
    console.log(echo);
    return absHumidity;
  }
}]);
