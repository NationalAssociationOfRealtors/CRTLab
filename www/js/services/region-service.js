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
        me.region = new cordova.plugins.locationManager.BeaconRegion(
            uuid.id,
            uuid.uuid);

        start_monitoring();
        start_ranging();
    }

    this.pause = function(e){
        //stop_monitoring();
        stop_ranging();
    }

    this.resume = function(e){
        //start_monitoring();
        start_ranging();
    }


    function start_monitoring(errorCallback){
        cordova.plugins.locationManager.startMonitoringForRegion(me.region)
            .fail(onError)
            .done();
    }

    function start_ranging(errorCallback){
        cordova.plugins.locationManager.startRangingBeaconsInRegion(me.region)
			.fail(onError)
			.done();
    }

    function stop_monitoring(errorCallback){
        cordova.plugins.locationManager.stopMonitoringForRegion(me.region)
            .fail(onError)
            .done();
    }

    function stop_ranging(errorCallback){
        cordova.plugins.locationManager.stopRangingBeaconsInRegion(me.region)
			.fail(onError)
			.done();
    }

}]);
