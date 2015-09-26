var brightBusApp = angular.module('brightBusApp', [
  'ngRoute',
  'brightBusControllers'
]);

brightBusApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/stops', {
        templateUrl: 'partials/stop-list.html',
        controller: 'StopListCtrl'
      }).
      when('/stops/:naptanCode', {
        templateUrl: 'partials/stop-detail.html',
        controller: 'StopDetailCtrl'
      }).
      otherwise({
        redirectTo: '/stops'
      });
  }]);
