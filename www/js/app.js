var brightBusApp = angular.module('brightBusApp', [
  'ngRoute',
  'brightBusServices',
  'brightBusFilters',
  'brightBusDirectives',
  'brightBusControllers',
  'ui.bootstrap'
]);

brightBusApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/stops', {
        templateUrl: 'partials/stop-list.html',
        controller: 'StopListCtrl',
        resolve: {
          'busStopsServiceData': function(busStopsService) {
            return busStopsService.promise;
          }
        }
      }).
      when('/stops/:naptanCode', {
        templateUrl: 'partials/stop-detail.html',
        controller: 'StopDetailCtrl',
        resolve: {
          'busStopsServiceData': function(busStopsService) {
            return busStopsService.promise;
          }
        }
      }).
      otherwise({
        redirectTo: '/stops'
      });
  }]);
