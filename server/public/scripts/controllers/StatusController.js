myApp.controller('StatusController', ['$scope', '$http', '$location', '$q', 'DataFactory', function ($scope, $http, $location, $q, DataFactory) {
  console.log('StatusController online');
  $scope.dataFactory = DataFactory;
  $scope.indoor = {};
  $scope.outdoor = {};
  console.log($location.search());

  // define space condition constraints
  $scope.setpoint = {
    highLimit: ((75.5 - 32) * 5 / 9),
    lowLimit: ((70.0 - 32) * 5 / 9)
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
    var promise = $http.get('/data/' + $location.search().device).then(
      function (response) {
        console.log(response);
        if (response.status == 200) {
          // if a good response, populate history table & model
          $scope.history = response.data;
          accessToken = response.data[0].access_token;
          photonID = response.data[0].deviceid;
          $scope.information = response.data[0];
          location.latitude = response.data[0].latitude;
          location.longitude = response.data[0].longitude;

          // Gather all data for page - indoor & outdoor conditions & forecast
          // then process recommendation & save data
          $q.all([
            queryPhoton('celsius'),
            queryPhoton('humidity'),
            getForecast()
          ]).then(function (response) {

            $scope.indoor.celsius = response[0].data.result;
            $scope.indoor.rh = response[1].data.result;
            $scope.outdoor = response[2].data.currently;
            console.log(response[0].data.result);
            console.log(response[2].data);
            recommend();
          });

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

  function getForecast() {
    return $http.post('/forecast', location);
  }

  function recommend() {
    console.log('Recommend run');

    // convert photon output for display
    $scope.indoor.farenheit = (parseFloat($scope.indoor.celsius) * 1.8) + 32;

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
    return $http.get(request);

  }

  function absoluteHumidity(celsius, rh) {
    var temp = parseFloat(celsius);
    var logTen = (temp * 7.5) / (temp + 237.3);
    var satPressure = Math.pow(10, logTen) * 6.11;
    absHumidity = (satPressure * rh * 2.1674) / (celsius + 273.15);
    var echo = celsius + 'deg. C, ' + rh + '% rh, ' + satPressure + 'mBar';
    console.log(echo);
    return absHumidity;
  }
}]);
