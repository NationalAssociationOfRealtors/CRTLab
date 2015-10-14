var LabControllers = angular.module('LabControllers', []);

LabControllers.controller('LabIndex', ['$scope', 'Location', function($scope, Location){
    $scope.location = Location;
}]);

LabControllers.controller('LabLocation', ['$scope', '$routeParams', 'Location', function($scope, $routeParams, Location){
    $scope.data = {};
    $scope.options = {};
    $scope.options.sparkline = {
        chart:{
            type: 'sparklinePlus',
            height: 50,
            showLastValue: false,
            margin:{
                top:0,
                left:5,
                bottom:5,
                right: 15,
            },
            x: function(d){
                var da = new Date(d.time);
                return da;
            },
            y: function(d){ return d.value; },
            xTickFormat: function(d){
                return d3.time.format('%x %X')(d);
            },
            transitionDuration: 0,
            noData: "Loading..."
        }
    }

    $scope.options.bullet = {
        chart: {
            height: 50,
            type: 'bulletChart',
            transitionDuration: 100,
            margin:{
                left:10,
                top:0,
                right: 10,
                bottom: 25,
            },
        }
    }

    Location.get_location_data($routeParams.locationId).then(function(data){
        console.log(data);
        $scope.data = data;
    });
}]);

LabControllers.controller('LabUser', ['$scope', '$routeParams', 'Lab', function($scope, $routeParams, Lab){
    for(var i in Lab.users){
        if(Lab.users[i]._id == $routeParams.userId){
            $scope.user = Lab.users[i];
        }
    }
}]);

LabControllers.controller('LabBeacons', ['$scope', 'Region', function($scope, Region){
    $scope.region = Region;
}]);

LabControllers.controller('LabSensors', ['$scope', '$routeParams', 'Node', function($scope, $routeParams, Node){
    $scope.data = {};
    $scope.data.light = [{ values: Node.get_data(null, 'node.light'), key: 'Light' }, { values: Node.get_data(null, 'node.co2'), key: 'CO2' }];
    $scope.data.temp = [{ values: Node.get_data(null, 'node.temperature'), key: 'Temperature' }, { values: Node.get_data(null, 'node.humidity'), key: 'Humidity' }];
    $scope.options = {
        chart:{
            type: 'lineChart',
            height: 180,
            margin : {
                top: 35,
                right: 25,
                bottom: 40,
                left: 30
            },
            x: function(d){ return d.x; },
            y: function(d){ return d.y; },
            useInteractiveGuideline: true,
            transitionDuration:100,
            xAxis: {
                tickFormat: function(d){
                    var da = new Date(d);
                    return d3.time.format('%H:%M:%S')(da);
                }
            },
            noData: "Loading..."
        }
    }
}]);

LabControllers.controller('LabSensorsHistoric', ['$scope', 'Node', 'Lab', function($scope, Node, Lab){
    $scope.data = {};
    $scope.data.light = [{ values: Node.get_historic(null, 'node.light'), key: 'Light' }, { values: Node.get_historic(null, 'node.co2'), key: 'CO2' }];
    $scope.data.temp = [{ values: Node.get_historic(null, 'node.temperature'), key: 'Temperature' }, { values: Node.get_historic(null, 'node.humidity'), key: 'Humidity' }];
    $scope.data.power_usage = Lab.get_power_usage();
    $scope.data.weather_data = Lab.get_weather_data();
    $scope.data.energy_usage = Lab.get_energy_usage();
    $scope.options = {
        chart:{
            type: 'lineChart',
            height: 180,
            margin : {
                top: 35,
                right: 25,
                bottom: 40,
                left: 30
            },
            x: function(d){
                var f = d3.time.format('%Y-%m-%dT%H:%M:%SZ')
                return f.parse(d.time ? d.time : d[0]);
            },
            y: function(d){ return d.value ? d.value : d[1]; },
            useInteractiveGuideline: true,
            transitionDuration:100,
            xAxis: {
                tickFormat: function(d){
                    var da = new Date(d);
                    return d3.time.format('%Y-%m-%d %H:%M')(da);
                }
            },
            noData: "Loading..."
        }
    }
}]);
