var myApp = angular.module('myApp', ['ngRoute']);

myApp.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    .when('/setup', {
      templateUrl: '/views/home.html',
      controller: 'SetupController',
    })
    .when('/revise', {
      templateUrl: '/views/home.html',
      controller: 'SetupController',
    })
    .when('/status', {
      templateUrl: '/views/status.html',
      controller: 'StatusController',
    })
    .when('/reminder', {
      templateUrl: '/views/reminder.html',
      controller: 'ReminderController',
    })
    .otherwise({
      redirectTo: 'setup',
    });
}]);
