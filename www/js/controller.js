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
    $scope.data.light = [{ values: [], key: 'Light' }, { values: [], key: 'Pot' }];
    $scope.data.temp = [{ values: [], key: 'Temperature' }, { values: [], key: 'Humidity' }];
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

    $scope.$on('mqtt:/node/light', function(event, data){
        console.log(data);
        if ($scope.data.light[0].values.length > 50) $scope.data.light[0].values.shift();
        $scope.data.light[0].values.push({x:new Date(), y:data});
    });
    $scope.$on('mqtt:/node/pot', function(event, data){
        if ($scope.data.light[1].values.length > 50) $scope.data.light[1].values.shift();
        $scope.data.light[1].values.push({x:new Date(), y:data});
    });
    $scope.$on('mqtt:/node/humidity', function(event, data){
        if ($scope.data.temp[1].values.length > 50) $scope.data.temp[1].values.shift();
        $scope.data.temp[1].values.push({x:new Date(), y:data});
    });
    $scope.$on('mqtt:/node/temperature', function(event, data){
        console.log(data);
        if ($scope.data.temp[0].values.length > 50) $scope.data.temp[0].values.shift();
        $scope.data.temp[0].values.push({x:new Date(), y:data});
    });
}]);
