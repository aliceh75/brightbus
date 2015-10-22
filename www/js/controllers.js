var brightBusControllers = angular.module('brightBusControllers', []);

brightBusControllers.controller('StopListCtrl', ['$scope', 'busStopsService', 'searcherService', 'persistService',
  function ($scope, busStopsService, searcherService, persistService) {
    $scope.stops = busStopsService.list();
    $scope.query = searcherService.getFilter();
    $scope.show_favs = searcherService.getShowFavs();
    $scope.filterChange = function() {
      searcherService.setFilter($scope.query);
    }
    $scope.toggleShowFavs = function() {
      $scope.show_favs = !$scope.show_favs;
      searcherService.setShowFavs($scope.show_favs);
    }
    $scope.toggleStopFavStatus = function(stop) {
      stop.favourite = !stop.favourite;
      persistService.save(stop);
    }
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
