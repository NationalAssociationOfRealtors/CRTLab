var RegionService = angular.module('RegionService', []);

RegionService.service('Region', ['$rootScope', function ($rootScope) {
    var me = this;
    this.beacons = [];
    this.in_region = false;

    function onDidDetermineStateForRegion(result){
        var in_region = result.state == 'CLRegionStateInside';
        me.in_region = in_region;
        $rootScope.$broadcast('region:state', in_region)
    }

    function onDidRangeBeaconsInRegion(result){
        $rootScope.$apply(function(){
            me.beacons = result.beacons;
        });
        console.log(result);
        $rootScope.$broadcast('region:beacons', result);
    }

    function onError(errorMessage){
        console.log('Monitoring beacons did fail: ' + errorMessage);
    }

    // Request permission from user to access location info.
    cordova.plugins.locationManager.requestAlwaysAuthorization();

    // Create delegate object that holds beacon callback functions.
    var delegate = new cordova.plugins.locationManager.Delegate();
    cordova.plugins.locationManager.setDelegate(delegate);

    // Set delegate functions.
    delegate.didDetermineStateForRegion = onDidDetermineStateForRegion;
    delegate.didRangeBeaconsInRegion = onDidRangeBeaconsInRegion;

    this.init = function(uuid){
        start_monitoring(uuid, onError);
        start_ranging(uuid, onError);
    }


    function start_monitoring(uuid, errorCallback){
        // Create a region object.
        var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
            uuid.id,
            uuid.uuid);

        // Start monitoring.
        cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
            .fail(errorCallback)
            .done();
    }

    function start_ranging(uuid, errorCallback){
        var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
            uuid.id,
            uuid.uuid);

        cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
			.fail(errorCallback)
			.done();
    }

}]);
