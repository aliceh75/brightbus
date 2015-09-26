var brightBusControllers = angular.module('brightBusControllers', []);

brightBusControllers.controller('StopListCtrl', ['$scope', '$http',
  function ($scope, $http) {
    $http.get('data/stops.json').success(function(data) {
      $scope.stops = data;
    });
  }
]);

brightBusControllers.controller('StopDetailCtrl', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    $scope.naptanCode = $routeParams.naptanCode;
  }
]);
