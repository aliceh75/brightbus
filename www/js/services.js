var brightBusServices = angular.module('brightBusServices', []);

brightBusServices.service('busStopsService', ['$http',
  function ($http) {
    var stops = [];
    var index = {};

    /* Fetch the data and set a promise */
    this.promise = $http.get('data/stops.json').success(function(data) {
      stops = data;

      // Build a friendly name!
      var ind_prefix_map = {
        'opp': 'Opposite',
        'adj': 'Adjacent to',
        'o/s': 'Outside',
        'Entrance': 'Entrance of'
      };
      for (var i = 0; i < stops.length; i++) {
        var friendly_name = '';
        if (stops[i].indicator) {
          var ind = stops[i].indicator;
          if (typeof(ind_prefix_map[ind]) !== 'undefined') {
            friendly_name = ind_prefix_map[ind] + ' ' + stops[i].name;
          } else {
            friendly_name = stops[i].name + ' (' + ind + ')';
          }
        } else {
          friendly_name = stops[i].name;
        }
        stops[i].friendlyName = friendly_name;
      }

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
