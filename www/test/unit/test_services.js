/*
 * Test the busStopsService service
 */
describe('busStopsService', function() {
  // Canned data
  var stop_data = [{
    naptanCode: 'c1',
    name: 'name1',
    indicator: null
  },{
    naptanCode: 'c2',
    name: 'name2',
    indicator: 'opp'
  },{
    naptanCode: 'c3',
    name: 'name3',
    indicator: 'adj'
  },{
    naptanCode: 'c4',
    name: 'name4',
    indicator: 'o/s'
  },{
    naptanCode: 'c5',
    name: 'name5',
    indicator: 'Entrance'
  }, {
    naptanCode: 'c6',
    name: 'name6',
    indicator: 'other indicator'
  }];

  // Mocks
  var busStopsService;
  beforeEach(function() {
    module('brightBusApp', function($provide) {
      $provide.value('$http', {
        'get': function (url) {
          return {
            'success': function(cb) {
              cb(stop_data);
              return 'mock promise'; 
            }
          }
        }
      });
    });

    inject(function($httpBackend, _busStopsService_) {
      busStopsService = _busStopsService_;
    });
  });

  // Tests
  it('Should fetch the list of stops from the json file and set a promise to resolved when the data is ready', function() {
    expect(busStopsService.promise).toEqual('mock promise');
  });

  it('Should return the list of stops with correct naptan codes when list is invoked', function() {
    var naptan_codes = [];
    var list = busStopsService.list();
    for (var i = 0; i < list.length; i++) {
      naptan_codes.push(list[i].naptanCode);
    }
    expect(naptan_codes).toEqual(['c1', 'c2', 'c3', 'c4', 'c5', 'c6']);
  });

  it('Should return the list of stops with generated friendly names', function() {
    var friendly_names = [];
    var list = busStopsService.list();
    for (var i = 0; i < list.length; i++) {
      friendly_names.push(list[i].friendlyName);
    }
    expect(friendly_names).toEqual([
      'name1', 'Opposite name2', 'Adjacent to name3', 'Outside name4', 
      'Entrance of name5', 'name6 (other indicator)'
    ]);
  });

  it('Should return the requested stop when get is invoked with naptanCode', function() {
    expect(busStopsService.get('c2')).toEqual({
      naptanCode: 'c2', 
      name: 'name2', 
      indicator: 'opp', 
      friendlyName: 'Opposite name2'
    });
  });
});
