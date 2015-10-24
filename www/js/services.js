var brightBusServices = angular.module('brightBusServices', []);

/* Service used to store the application search settings */
brightBusServices.service('searcherService', function() {
  var filter = '';
  var show_favs = false;
  this.getFilter = function() {
    return filter;
  }
  this.getShowFavs = function() {
    return show_favs;
  }
  this.setFilter = function(str) {
    filter = str;
  }
  this.setShowFavs = function(val) {
    show_favs = val;
  }
});

/* Service used to store/fetch stop persistent values (favourite status) */
brightBusServices.service('persistService', function() {
  var schema = 1;
  var store_str = localStorage.getItem('bbpersist');
  var store = null;
  if (store_str) {
    store = JSON.parse(store_str);
  }
  if (store && typeof(store.schema) != 'undefined') {
    if (store.schema != schema) {
      throw "Unsupported schema " + store.schema;
    }
  } else {
    store = {
      schema: schema,
      favourites: [],
    };
  }
  // Restore peristant info on given stop.
  this.restore = function(stop) {
    stop.favourite = store.favourites.indexOf(stop.naptanCode) >= 0;
  }
  // Store persistant data of given stop
  this.save = function(stop) {
    var pos = store.favourites.indexOf(stop.naptanCode);
    if (pos >= 0) {
      if (stop.favourite) {
        return;
      }
      store.favourites.splice(pos, 1);
    } else {
      if (!stop.favourite) {
        return;
      }
      store.favourites.push(stop.naptanCode);
    }
    localStorage.setItem('bbpersist', JSON.stringify(store));
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
brightBusServices.service('busStopsService', ['$http', 'persistService',
  function ($http, persistService) {
    var stops = [];
    var index = {};

    /* Fetch the data and set a promise */
    this.promise = $http.get('data/stops.json').success(function(data) {
      stops = data;
      // Restore persistent values
      for (var i = 0; i < stops.length; i++) {
        persistService.restore(stops[i]);
      }
      // Prepare search data
      for (var i = 0; i < stops.length; i++) {
        stops[i].search =
          stops[i].name.toLowerCase() + ' ' +
          stops[i].street.toLowerCase() + ' ' +
          stops[i].lines.join(' ');
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
