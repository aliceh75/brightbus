/*
 * Test the busStopsService service
 */
describe('busStopsService', function() {
  // Canned data
  var stop_data = [{
    naptanCode: 'c1',
    name: 'name1',
    street: 'street1',
    lines: ['line1']
  },{
    naptanCode: 'c2',
    name: 'name2',
    street: 'street2',
    lines: ['line2']
  },{
    naptanCode: 'c3',
    name: 'name3',
    street: 'street3',
    lines: ['line3']
  },{
    naptanCode: 'c4',
    name: 'name4',
    street: 'street4',
    lines: ['line4']
  },{
    naptanCode: 'c5',
    name: 'name5',
    street: 'street5',
    lines: ['line5']
  }, {
    naptanCode: 'c6',
    name: 'name6',
    street: 'street6',
    lines: ['line6']
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
    expect(busStopsService.get('c2').name).toEqual('name2');
  });

  it('Should build a list of words for each entry', function() {
    expect(busStopsService.get('c2').search).toEqual('name2 street2 line2');
  });
});
