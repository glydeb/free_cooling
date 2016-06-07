myApp.controller('ReminderController', ['$scope', '$http', 'DataFactory', function ($scope, $http, DataFactory) {
  console.log('ReminderController online');

/*  $scope.faves = [];
  $scope.dataFactory = DataFactory;

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
}]);
