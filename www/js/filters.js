var brightBusFilters = angular.module('brightBusFilters', []);

brightBusFilters.filter('wordSearchFilter', function() {
  return function(items, query) {
    var query_words = query
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ');

    if (query_words.length == 0) {
      return items;
    }

    return items.filter(function(e) {
      for (var i = 0; i < query_words.length; i++) {
        if (e.search.indexOf(query_words[i]) == -1) {
          return false;
        }
      }
      return true;
    });
  }
});
