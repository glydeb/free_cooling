myApp.controller('SetupController', ['$scope', '$http', 'DataFactory', function ($scope, $http, DataFactory) {
  console.log('SetupController online');
  $scope.dataFactory = DataFactory;
  $scope.fullDay = $scope.dataFactory.factoryHourArray();
  $scope.setup = {};
  $scope.location = {};

  // preload Sparky's info & default location
  $scope.setup.photonID = '2a0035001247343431373336';
  $scope.setup.accessToken = 'b755de087c92b9d21ea7e0bd10a58af2bf326e45';
  $scope.location.street = '9401 James Ave. S.';
  $scope.location.city = 'Bloomington';
  $scope.location.state = 'MN';
  $scope.location.zip = '55431';

  $scope.submitAndTest = function () {

    // display photon testing string
    $scope.testPhoton = true;

    // attempt to get data from the photon, and proceed to
    // next test if successful
    verifyPhoton();

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

  function sendEmail() {
    $scope.linkSent = true;
  }

  function toTime(hour) {

    var time = hour.toString();
    if (time.length === 1) { time = '0' + time; }

    time += ':00:00';
    return time;
  }

  function storeDevice() {
    $scope.storeUser = true;

    //construct object to send to server
    var setup = {
      address: $scope.location.street,
      city: $scope.location.city,
      state: $scope.location.state,
      zip: $scope.location.zip,
      lat: $scope.location.lat,
      long: $scope.location.long,
      phone: $scope.phone,
      email: $scope.setup.email,
      device_id: $scope.setup.photonID,
      access_token: $scope.setup.accessToken,
      nickname: $scope.setup.nickname,
      allow_alerts: $scope.enableAlert,
      startTime: toTime($scope.startBlock),
      endTime: toTime($scope.endBlock)
    };

    console.log(setup);

    $http.post('/store', setup).then(function (response) {
      if (response.status == 201) {
        console.log('Hooray! setup done!');
        sendEmail();
      } else {
        console.log('Boo!', response.data);
      }
    });

  }

  function getLocation() {
    $scope.findLocation = true;

    // concatenate address into one string, and replace spaces with '+'
    var address = $scope.location.street + ',+' + $scope.location.city + ',+';
    address += $scope.location.state + '+' + $scope.location.zip;
    address = address.replace(/\s+/g, '+');
    $http.get('/location/' + address).then(
      function (response) {
        console.log(response);
        if (response.status == 200) {
          // Give feedback and set test value to success
          $scope.findLocationResult = 'Found! Photon is at: ';
          $scope.location.lat = response.data.results[0].geometry.location.lat;
          $scope.location.long = response.data.results[0].geometry.location.lng;
          // proceed to storing user/device information
          storeDevice();
        } else {
          $scope.findLocationResult = 'Not found - returned ' +
            response.statusText;
        }
      }
    );

  }

  function verifyPhoton() {
    // Assemble request to paritcle API
    var baseURL = 'https://api.particle.io/v1/devices/';

    //check that deviceID and access_token are present
    if ($scope.setup.photonID === '' || $scope.setup.accessToken === '') {
      $scope.testPhotonResult = 'Invalid ID or Token - please revise and resubmit';
    } else {

      // Formulate request to device
      var query = $scope.setup.photonID;
      query += '/farenheit?access_token=';
      query += $scope.setup.accessToken;

      var request = baseURL + encodeURI(query);

      // Request temperature from device
      $http.get(request).then(
        function (response) {
          if (response.status == 200) {
            // Give feedback and proceed to verify location
            $scope.testPhotonResult = 'Success!';
            getLocation();
          } else {
            $scope.testPhotonResult = 'Failure - returned ' +
              response.statusText;
            return false;
          }
        }
      );

    }

  }

}]);
