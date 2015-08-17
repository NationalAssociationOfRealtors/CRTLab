var CRTLab = angular.module('CRTLab', ['RegionService', 'http-auth-interceptor', 'ngWebsocket', 'SocketService']);

CRTLab.controller('LabCtrl', ['$scope', '$http', 'Region', 'authService', '$websocket', 'Socket', function($scope, $http, Region, authService, $websocket, Socket){
    var address = "172.16.121.179"
    var api_url = "http://"+address;
    var socket_url = "ws://"+address+"/socket";
    var client_id = '55d1f9e7333e0a203120fb0a'
    var token = get_token();
    $scope.user = {};
    $scope.orderProp = 'rssi';
    $scope.region = Region;

    var ws = $websocket.$new({
        url:socket_url,
        protocols: "json",
        lazy: true,
    });

    ws.$on('inoffice', function(data){
        console.log(data);
    });

    function init(){
        token = get_token();
        Region.init({
            uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
            id:'CRT Lab'
        });
        Socket.init(ws, token, client_id);
    }

    function get_token(){
        try{
            var token = window.localStorage.getItem("token");
            if(token){
                $http.defaults.headers.common.Authorization = token;
            }
            return token;
        }catch(e){
            console.log(e);
        }
    }

    $scope.$on('beacon:in-region', function(event, result){
        $scope.beacons = result.beacons;
        if(result.beacons.length && Socket.is_open()){
            Socket.emit('inoffice', {'result':result});
        }
    });

    $scope.$on('event:auth-loginRequired', function(event, data){
        $.oauth2({
            auth_url: api_url+'/auth/authorize',
            response_type: 'token',
            client_id: client_id,
            redirect_uri: api_url,
            other_params: {scope: 'inoffice'}
        }, function(token, response){
            console.log(token);
            window.localStorage.setItem("token", token);
            $http.defaults.headers.common.Authorization = token;
            init();
            authService.loginConfirmed();
        }, function(error, response){
            alert(error);
        });
    });

    //Kick everything off.
    $http.get(api_url+"/lab/me").then(function(response){
        $scope.user = response.data[0];
        init();
    });
}]);
