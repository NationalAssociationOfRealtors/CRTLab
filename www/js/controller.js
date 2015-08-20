var CRTLab = angular.module('CRTLab', ['RegionService', 'http-auth-interceptor', 'SocketService', 'LoginService']);

CRTLab.controller('LabCtrl', ['$scope', '$http', '$q', 'Region', 'authService', 'Socket', 'Auth', function($scope, $http, $q, Region, authService, Socket, Auth){
    var address = "172.16.121.163"
    var api_url = "http://"+address;
    var socket_url = "ws://"+address+"/socket";
    var client_id = '55d603c0fb3d90000b009fe3'
    $scope.user = {};
    $scope.team = [];
    $scope.times = [];
    $scope.region = Region;
    $scope.token = null;
    Auth.init({
        url: api_url+'/auth/authorize',
        response_type: 'token',
        client_id: client_id,
        redirect_uri: api_url+"/",
        other_params: {scope: 'inoffice'}
    });

    Auth.get_token().then(function(token){
        $http.defaults.headers.common.Authorization = token;
        $scope.token = token;
        init();
    }, function(){
        login();
    });

    function login(){
        Auth.login().then(function(result){
            window.localStorage.setItem("token", result.token);
            $http.defaults.headers.common.Authorization = result.token;
            $scope.token = result.token;
            authService.loginConfirmed();
            init();
        }, function(error){
            console.log(error);
        });
    }

    function get_times(){
        $http.get(api_url+"/lab/user/"+$scope.user._id).then(function(response){
            $scope.times = response.data[0];
        });
    }

    function init(){
        var ws = Socket.init(socket_url, $scope.token, client_id);
        cordova.plugins.locationManager.isBluetoothEnabled()
            .then(function(isEnabled){
                console.log("Bluetooth isEnabled: " + isEnabled);
                if (!isEnabled) {
                    cordova.plugins.locationManager.enableBluetooth();
                }
            })
    .fail(console.error)
    .done();
        ws.$on('inoffice', function(data){
            for(i in $scope.team){
                if($scope.team[i]._id == data.user._id){
                    $scope.team[i] = data.user;
                }
            }
            var state = data.result ? "arrived" : "departed";
            cordova.plugins.notification.local.schedule({
                id: parseInt(data.user._id),
                title: data.user.name+' has '+state+'.',
                icon: "file://img/crt_logo.png",
            });
            if(data.user._id == $scope.user._id) get_times();
        });

        $scope.$on('region:state', function(event, result){
            if($scope.user.in_office != result){
                $scope.user.in_office = result;
                Socket.emit('inoffice', {'result':result});
            }
        });

        $scope.$on('event:auth-loginRequired', function(event, data){
            login();
        });

        $http.get(api_url+"/lab/me").then(function(response){
            $scope.user = response.data[0];
            Region.init({
                uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
                id:'CRT Lab'
            });
            get_times();

        });

        $http.get(api_url+"/lab/team").then(function(response){
            $scope.team = response.data[0];
        });
    }
}]);
