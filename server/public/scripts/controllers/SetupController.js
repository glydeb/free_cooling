myApp.controller('SetupController', ['$scope', '$http', '$location',
  function ($scope, $http, $location) {
  console.log('SetupController online');
  $scope.fullDay = create12HrArray(' AM', 1).concat(create12HrArray(' PM', 13));
  $scope.setup = {};
  $scope.location = {};

  if ($location.search().device !== undefined) {
    if ($location.search().device.length === 24) {
      // attempt to retrieve device data
      $http.get('/settings/' + $location.search().device).then(function (res, err)
        {

        console.log('response: ', res);
        if (err) {
          console.log('uh-oh: ', err);
        }

        var settings = res.data[0];
        $scope.setup.email = settings.email;
        $scope.setup.photonID = settings.deviceid;
        $scope.setup.accessToken = settings.access_token;
        $scope.setup.nickname = settings.nickname;
        $scope.location.street = settings.street_address;
        $scope.location.city = settings.city;
        $scope.location.state = settings.state;
        $scope.location.zip = settings.zip;
        $scope.phone = settings.phone_number;
        $scope.enableAlert = settings.allow_alerts;
        $scope.startBlock = parseInt(settings.start_time.substr(0,2));
        $scope.endBlock = parseInt(settings.end_time.substr(0,2));
        $scope.stored = true;

      });
    }
  }

  $scope.submitAndTest = function () {

    // display photon testing string
    $scope.testPhoton = true;

    // attempt to get data from the photon, and proceed to
    // next test if successful
    verifyPhoton();

  };

  $scope.removeDevice = function (deviceID) {
    $http.delete('/store/' + deviceID).then(function (response) {
      if (response.status == 204) {
        console.log('Device Removed');
        // Clear fields
        $scope.setup.email = '';
        $scope.setup.photonID = '';
        $scope.setup.accessToken = '';
        $scope.setup.nickname = '';
        $scope.location.street = '';
        $scope.location.city = '';
        $scope.location.state = '';
        $scope.location.zip = '';
        $scope.phone = '';
        $scope.enableAlert = false;
        $scope.startBlock = '';
        $scope.endBlock = '';

      } else {
        console.log('Got a success response but did not remove device',
          response.data);
      }
    });

  };


  function sendEmail() {
    $scope.linkSent = true;
  }

  function toTime(hour) {

    var time = hour.toString();
    if (time.length === 1) { time = '0' + time; }

    time += ':00:00';
    return time;
  }

  function create12HrArray(postfix, startHour) {
    var halfDayList = [];
    for (var j = 1; j < 12; j++) {
      halfDayList.push({ hour: (j + startHour - 1), label: j + postfix });
    }

    halfDayList.unshift({ hour: (startHour - 1), label: 12 + postfix });
    return halfDayList;
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
    };

      // If allow_alerts is true, set up the start & end block
    if (allow_alerts && ($scope.startBlock >= 0 && $scope.startBlock < 24) &&
       ($scope.endBlock >= 0 && $scope.endBlock < 24)) {
      setup.startTime = toTime($scope.startBlock);
      setup.endTime = toTime($scope.endBlock);
    } else {
      setup.startTime = null;
      setup.endTime = null;
    }

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
          // round lat & long to 3 decimal places (roughly .3 km)
          $scope.location.lat =
            Math.round($scope.location.lat * 1000) / 1000;
          $scope.location.long =
            Math.round($scope.location.long * 1000) / 1000;
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
            console.log(response);
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
