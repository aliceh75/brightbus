var brightBusServices = angular.module('brightBusServices', []);

/* Service used to store the application search settings */
brightBusServices.service('searcherService', function() {
  var filter = '';
  this.getFilter = function() {
    return filter;
  }
  this.setFilter = function(str) {
    filter = str;
  }
});

/* Service used to fetch bus times */
brightBusServices.service('busTimesService', ['$http', '$q',
    function ($http, $q) {
      this.getBusTimes = function(naptan_code) {
        return $q(function(resolve, reject) {
          var search_url = "http://bh.buscms.com/api/rest/ent/stop.aspx?callback=JSON_CALLBACK&clientid=BrightonBuses&method=search&format=jsonp&q=" + naptan_code;
          $http.jsonp(search_url).success(function(data) {
            var stop_id = 0;
            for (var i=0; i < data['result'].length; i++) {
              if (data['result'][i].NaptanCode == naptan_code) {
                stop_id = data['result'][i].stopId;
              }
            }
            var times_url = "http://bh.buscms.com/api/REST/html/departureboard.aspx?callback=JSON_CALLBACK&clientid=BrightonBuses&sourcetype=siri&format=jsonp&stopid=" + stop_id;
            $http.jsonp(times_url).success(function(data) {
              resolve(data);
            });
          });
        });
      };
    }
]);

/* Service used to create the list of bus stops */
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
