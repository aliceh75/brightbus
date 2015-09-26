var brightBusControllers = angular.module('brightBusControllers', []);

brightBusControllers.controller('StopListCtrl', ['$scope', 'busStopsService',
  function ($scope, busStopsService) {
    $scope.stops = busStopsService.list();
  }
]);

brightBusControllers.controller('StopDetailCtrl', ['$scope', '$routeParams', 'busStopsService',
  function($scope, $routeParams, busStopsService) {
    $scope.stop = busStopsService.get($routeParams.naptanCode);
  }
]);
