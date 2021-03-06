myApp.controller('ReminderController', ['$scope', '$http', function ($scope, $http) {
  console.log('ReminderController online');
  $scope.reminder = {};

  //when a valid email and deviceID is entered, resend the link
  $scope.sendReminder = function () {

    $http.post('/reminder', $scope.reminder).then(function (response) {
      if (response.status == 200) {
        console.log('Hooray! Reminder sent!');
        $scope.sent = true;
      } else {
        console.log('Boo!', response.data);
      }
    });

  };

}]);
