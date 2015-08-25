var LabControllers = angular.module('LabControllers', []);

LabControllers.controller('LabIndex', ['$scope', 'Team', function($scope, Team){
    $scope.team = Team;
}]);

LabControllers.controller('LabUser', ['$scope', '$routeParams', 'Team', function($scope, $routeParams, Team){
    for(var i in Team.users){
        if(Team.users[i]._id == $routeParams.userId){
            $scope.user = Team.users[i];
        }
    }
}]);

LabControllers.controller('LabSensors', ['$scope', '$routeParams', 'MQTT', function($scope, $routeParams, MQTT){
    $scope.data = {};
    $scope.data.light = [{ values: MQTT.get_data('/node/light'), key: 'Light' }, { values: MQTT.get_data('/node/pot'), key: 'Pot' }];
    $scope.data.temp = [{ values: MQTT.get_data('/node/temperature'), key: 'Temperature' }, { values: MQTT.get_data('/node/humidity'), key: 'Humidity' }];
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
