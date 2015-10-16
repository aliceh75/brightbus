/*
 * Test the busStopsService service
 */
describe('busStopsService', function() {
  // Canned data
  var stop_data = [{
    naptanCode: 'c1',
    name: 'name1',
  },{
    naptanCode: 'c2',
    name: 'name2',
  },{
    naptanCode: 'c3',
    name: 'name3',
  },{
    naptanCode: 'c4',
    name: 'name4',
  },{
    naptanCode: 'c5',
    name: 'name5',
  }, {
    naptanCode: 'c6',
    name: 'name6',
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

  it('Should return the requested stop when get is invoked with naptanCode', function() {
    expect(busStopsService.get('c2')).toEqual({
      naptanCode: 'c2', 
      name: 'name2', 
    });
  });
});
