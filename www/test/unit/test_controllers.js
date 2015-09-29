describe('StopListCtrl', function() {
  beforeEach(module('brightBusApp'));

  var stop_data = [{
    naptanCode: 'c1',
    friendlyName: 'n1'
  },{
    naptanCode: 'c2',
    friendlyName: 'n2'
  }];

  var mockBusStopsService = {
      list: function() {
        return stop_data;
      }
  };

  it('Should invoke the busStopService to create a list of stops', inject(function($controller) {
    var scope = {};
    var ctrl = $controller('StopListCtrl', {$scope:scope, busStopsService: mockBusStopsService});
    expect(scope.stops).toEqual(stop_data);
  }));
});
