/*
 * Test the StopListCtrl controller
 */
describe('StopListCtrl', function() {
  beforeEach(module('brightBusApp'));

  // Canned stop data
  var stop_data = [{
    naptanCode: 'c1',
    name: 'n1',
    street: 's1',
    lines: ['l1']
  },{
    naptanCode: 'c2',
    name: 'n2',
    street: 's2',
    lines: ['l2']
  }];

  // Mock service
  var mockBusStopsService = {
      list: function() {
        return stop_data;
      }
  };
  var mockSearcherService = {
    getFilter: function() {
      return 'the search';
    },
    setFilter: function(f) {
      this.filter = f;
    }
  };

  // Tests
  it('Should invoke the busStopService to create a list of stops', inject(function($controller) {
    var scope = {};
    var ctrl = $controller('StopListCtrl', {$scope:scope, busStopsService: mockBusStopsService});
    expect(scope.stops).toEqual(stop_data);
  }));

  it('Should initialise the filter using the searcherService', inject(function($controller) {
    var scope = {};
    var ctrl = $controller('StopListCtrl', {$scope:scope, busStopsService: mockBusStopsService, searcherService: mockSearcherService});
    expect(scope.query).toEqual('the search');
  }));

  it('Should provide a function for the partial to update the searcher service', inject(function($controller) {
    var scope = {};
    var ctrl = $controller('StopListCtrl', {$scope:scope, busStopsService: mockBusStopsService, searcherService: mockSearcherService});
    scope.query = 'something';
    scope.filterChange();
    expect(mockSearcherService.filter).toEqual('something');
  }));
});

/*
 * Test the StopDetailCtrl controller
 */
describe('StopDetailCtrl', function() {
  beforeEach(module('brightBusApp'));

  // Canned data
  var stop_info = {
    friendlyName: 'a stop'
  };

  // Mock services
  var mockBusStopsService = {
    get: function(naptanCode) {
      this.naptan_code = naptanCode;
      return stop_info;
    }
  };
  var mockBusTimesService = {
    getBusTimes: function(naptanCode){
      return {
        then: function(cb) {
          cb('get bus times invoked with ' + naptanCode);
        }
      }
    }
  };
  var mockSce = {
    trustAsHtml: function(a) {return a;}
  };

  // Tests
  it('Should invoke the busStopsService with the naptanCode to get the stop details', inject(function($controller) {
    var scope = {};
    var ctrl = $controller('StopDetailCtrl', {
      $scope:scope,
      $routeParams:{naptanCode: 'abcd123'},
      $sce:mockSce,
      busStopsService: mockBusStopsService,
      busTimesService: mockBusTimesService
    });

    expect(scope.stop).toEqual(stop_info);
    expect(mockBusStopsService.naptan_code).toEqual('abcd123');
  }));

  it('Should invoke getBusTimes and set the stop times when the promise resolves', inject(function($controller) {
    var scope = {};
    var ctrl = $controller('StopDetailCtrl', {
      $scope:scope,
      $routeParams:{naptanCode: 'abcd123'},
      $sce:mockSce,
      busStopsService: mockBusStopsService,
      busTimesService: mockBusTimesService
    });

    expect(scope.stop_times).toEqual('get bus times invoked with abcd123');
  }));
});
