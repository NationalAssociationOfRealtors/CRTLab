describe('BeaconListCtrl', function(){

  beforeEach(module('CRTBeacons'));

  it('should create "beacon" model with 3 beacons', inject(function($controller) {
    var scope = {},
        ctrl = $controller('BeaconListCtrl', {$scope:scope});

    expect(scope.beacons.length).toBe(3);
  }));

});
