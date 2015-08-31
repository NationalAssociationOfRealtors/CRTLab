var LabControllers = angular.module('LabControllers', []);

LabControllers.controller('LabIndex', ['$scope', 'Team', 'Region', function($scope, Team, Region){
    $scope.region = Region;
    $scope.team = Team;
}]);

LabControllers.controller('LabUser', ['$scope', '$routeParams', 'Team', function($scope, $routeParams, Team){
    for(var i in Team.users){
        if(Team.users[i]._id == $routeParams.userId){
            $scope.user = Team.users[i];
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
