var brightBusControllers = angular.module('brightBusControllers', []);

brightBusControllers.controller('StopListCtrl', ['$scope', 'busStopsService',
  function ($scope, busStopsService) {
    $scope.stops = busStopsService.list();
  }
]);

brightBusControllers.controller('StopDetailCtrl', ['$scope', '$routeParams', '$sce', 'busStopsService', 'busTimesService',
  function($scope, $routeParams, $sce, busStopsService, busTimesService) {
    $scope.stop = busStopsService.get($routeParams.naptanCode);
    $scope.refreshTimes = function() {
      $scope.stop_times = $sce.trustAsHtml('Fetching stop times ...');
      busTimesService.getBusTimes($routeParams.naptanCode).then(function(result) {
        $scope.stop_times = $sce.trustAsHtml(result);
      });
    }
    $scope.refreshTimes();
  }
]);
