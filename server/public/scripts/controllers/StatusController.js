myApp.controller('StatusController', ['$scope', '$http', '$location', '$q', function ($scope, $http, $location, $q) {
  console.log('StatusController online');
  $scope.indoor = {};
  $scope.outdoor = {};
  console.log($location.search());

  // define space condition constraints
  $scope.setpoint = {
    highLimit: ((75.5 - 32) * 5 / 9),
    lowLimit: ((70.0 - 32) * 5 / 9)
  };
  $scope.setpoint.wetLimit = calc.absoluteHumidity($scope.setpoint.highLimit, 60);
  $scope.setpoint.dryLimit = calc.absoluteHumidity($scope.setpoint.lowLimit, 35);
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
          $scope.hash = $location.search().device;
          $scope.history = response.data;
          accessToken = response.data[0].access_token;
          photonID = response.data[0].deviceid;
          $scope.information = response.data[0];
          location.latitude = response.data[0].latitude;
          location.longitude = response.data[0].longitude;

          // separate date & time for table display
           $scope.history.forEach(function (row, i) {
            if($scope.history[i].date_time !== null)  {
              $scope.history[i].date = $scope.history[i].date_time.substr(0, 10);
              $scope.history[i].time = $scope.history[i].date_time.substr(11, 10);
            }
          });

          // Gather all data for page - indoor & outdoor conditions & forecast
          // then process recommendation & save data
          $q.all([
            queryPhoton('celsius'),
            queryPhoton('humidity'),
            getForecast()
          ]).then(function (response) {

            $scope.indoor.celsius = roundToDecimals(response[0].data.result, 2);
            $scope.indoor.rh = roundToDecimals(response[1].data.result, 1);
            $scope.outdoor = response[2].data.currently;
            $scope.outdoor.humidity = Math.round($scope.outdoor.humidity * 100);
            console.log(response[0]);
            console.log(response[2].data);
            processApiReturns();
            $scope.recommendation = recommend.algorithm($scope.indoor,
               $scope.outdoor, $scope.setpoint);
            saveConditions();

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

  function processApiReturns() {

    // convert photon output for display
    $scope.indoor.farenheit = roundToDecimals(($scope.indoor.celsius * 1.8) + 32, 1);

    //fill currentConditions object
    currentConditions.date = new Date();
    currentConditions.indoorTemp = $scope.indoor.farenheit;
    currentConditions.indoorRH = $scope.indoor.rh;
    currentConditions.outdoorTemp = $scope.outdoor.temperature;
    currentConditions.outdoorRH = $scope.outdoor.humidity;
    currentConditions.precip = $scope.outdoor.precipProbability;
    currentConditions.deviceID = photonID;

    // Get outdoor conditions for comparison and indoor absolute humidity
    $scope.outdoor.celsius = ($scope.outdoor.temperature - 32) * 5 / 9;
    $scope.outdoor.absHumidity = calc.absoluteHumidity($scope.outdoor.celsius, $scope.outdoor.humidity);
    $scope.indoor.absHumidity = calc.absoluteHumidity($scope.indoor.celsius,
      $scope.indoor.rh);
  }

  function saveConditions() {

    // Put recommendation into object to be saved
    currentConditions.recommendation = $scope.recommendation.recommendation;

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

  $scope.directPhoton = function (photonFunction, photonCommand) {
    // Assemble request to paritcle API
    var baseURL = 'https://api.particle.io/v1/devices/';

    // Formulate request to device
    var query = photonID;
    query += '/' + photonFunction + '?access_token=';
    query += accessToken + '&params=';
    query += photonCommand;

    var request = baseURL + encodeURI(query);

    // Request temperature from device
    return $http.post(request);

  }

}]);

function roundToDecimals(num, decimals) {
  var powerOfTen = 1;
  for (var x = 0; x < decimals; x++) {
    powerOfTen *= 10;
  }
  return Math.round(num * powerOfTen) / powerOfTen;
}
