/*
 * Test the wordSearchFilter filter
 */
describe('wordSearchFilter', function() {
  var wordSearchFilter;
  beforeEach(function() {
    module('brightBusFilters');
    inject(function($filter) {
      wordSearchFilter = $filter('wordSearchFilter');
    });
  });

  it('Should return all the items that match all the words', function() {
    var result = wordSearchFilter([{
      name: 'n1',
      search: 'one four'
    }, {
      name: 'n2',
      search: 'two four'
    }, {
      name: 'n3',
      search: 'one four two'
    },{
      name: 'n4',
      search: 'four oneandtwo'
    }, {
      name: 'n5',
      search: 'on four two'
    }], 'one four two');

    var result_names = result.map(function(e) {return e.name;});
    expect(result_names).toEqual(['n3', 'n4']);
  });
});
