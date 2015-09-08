var LabControllers = angular.module('LabControllers', []);

LabControllers.controller('LabIndex', ['$scope', 'Lab', 'Region', function($scope, Lab, Region){
    $scope.region = Region;
    $scope.lab = Lab;
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
    $scope.data.light = [{ values: Node.get_data(null, 'light'), key: 'Light' }, { values: Node.get_data(null, 'pot'), key: 'Pot' }];
    $scope.data.temp = [{ values: Node.get_data(null, 'temperature'), key: 'Temperature' }, { values: Node.get_data(null, 'humidity'), key: 'Humidity' }];
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
            transitionDuration:1000,
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
    $scope.data.light = [{ values: Node.get_historic(null, 'light'), key: 'Light' }, { values: Node.get_historic(null, 'pot'), key: 'Pot' }];
    $scope.data.temp = [{ values: Node.get_historic(null, 'temperature'), key: 'Temperature' }, { values: Node.get_historic(null, 'humidity'), key: 'Humidity' }];
    $scope.data.power_usage = Lab.get_power_usage();
    $scope.data.weather_data = Lab.get_weather_data();
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
            transitionDuration:1000,
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
