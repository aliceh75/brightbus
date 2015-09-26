var brightBusServices = angular.module('brightBusServices', []);

brightBusServices.service('busStopsService', ['$http',
  function ($http) {
    var stops = [];
    var index = {};

    /* Fetch the data and set a promise */
    this.promise = $http.get('data/stops.json').success(function(data) {
      stops = data;

      // Prepare a naptanCode index
      for (var i = 0; i < stops.length; i++) {
        index[stops[i].naptanCode] = stops[i];
      }
    });

    /* Return the list of stops */
    this.list = function() {
      return stops;
    }

    /* Fetch a given stop by naptanCode */
    this.get = function(naptanCode) {
      return index[naptanCode];
    }
  }
]);
