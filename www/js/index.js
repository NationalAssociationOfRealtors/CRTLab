var address = "192.168.1.174";
var api_url = "http://"+address;
var socket_url = "ws://"+address+"/socket";
var client_id = '55d603c0fb3d90000b009fe3';
var api_token = null;

var CRTLab = angular.module('CRTLab', ['ngRoute', 'RegionService', 'http-auth-interceptor', 'SocketService', 'LoginService', 'TeamService', 'MQTTService', 'LabControllers']);

CRTLab.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/index', {
            templateUrl: 'partials/index.html',
            controller: 'LabIndex',
        }).
        when('/user/:userId', {
            templateUrl: 'partials/user.html',
            controller: 'LabUser',
        }).
        otherwise({
            redirectTo: '/index'
        });
}]);

CRTLab.run(['$http', '$rootScope', '$interval', 'Region', 'Socket', 'Auth', 'Team', 'authService',  'MQTT', function($http, $rootScope, $interval, Region, Socket, Auth, Team, authService, MQTT){
    cordova.plugins.locationManager.isBluetoothEnabled()
        .then(function(isEnabled){
            console.log("Bluetooth isEnabled: " + isEnabled);
            if (!isEnabled) {
                cordova.plugins.locationManager.enableBluetooth();
            }
        })
        .fail(console.error)
        .done();

    Auth.init({
        url: api_url+'/auth/authorize',
        response_type: 'token',
        client_id: client_id,
        redirect_uri: api_url+"/",
        other_params: {scope: 'inoffice'}
    });

    Auth.get_token().then(function(token){
        api_token = token;
        init();
    }, function(){
        login();
    });

    function init(){
        Socket.init(socket_url, api_token, client_id);
        Team.init().then(function(me){
            $rootScope.$on('region:state', function(event, result){
                console.log(Team.me);
                if(Team.me.in_office != result){
                    Team.me.in_office = result;
                    Socket.emit('inoffice', {'result':result});
                }
            });
        });


        $rootScope.$on('event:auth-loginRequired', function(event, data){
            login();
        });

        Region.init({
            uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
            id:'CRT Lab'
        });

        MQTT.connect();

        //var in_office = false;
        //$interval(function(){
        //    in_office = !in_office;
        //    Socket.emit('inoffice', {'result':in_office});
        //}, 10000);
    }

    function login(){
        Auth.login().then(function(result){
            api_token = result.token;
            authService.loginConfirmed();
            init();
        }, function(error){
            console.log(error);
        });
    }

}])

var app = (function(){
    var app = {};

    app.initialize = function(){
        document.addEventListener('deviceready', onDeviceReady, false);
    };

    function onDeviceReady(){
        angular.bootstrap(document, ['CRTLab']);
    }

    return app;

})();

app.initialize();
