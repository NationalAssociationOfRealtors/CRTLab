var API_VERSION = "v1.0";
var BEACON_UUID = "C3CE6B3E-E801-4E7F-8F05-8A83D9B8A183";
var uri = "crtlabsdev.realtors.org";
var api_url = "https://"+uri+"/api/"+API_VERSION;
var auth_url = "https://"+uri;
var socket_url = "wss://"+uri+"/socket";
var client_id = "55df1e9c64bd32000c24b167";
var api_token = null;

var CRTLab = angular.module('CRTLab', ['ngRoute', 'RegionService', 'http-auth-interceptor', 'SocketService', 'LoginService', 'LabService', 'nvd3', 'ngTouch', 'NodeService', 'LabControllers']);

var views = {
    index:{
        next:'sensors',
        previous:'beacons'
    },
    sensors:{
        next:'historic',
        previous:'index'
    },
    historic:{
        next:'beacons',
        previous:'sensors'
    },
    beacons:{
        next:'index',
        previous:'historic'
    },
}
var current_view = 'index'

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
        when('/sensors', {
            templateUrl: 'partials/sensors.html',
            controller: 'LabSensors',
        }).
        when('/historic', {
            templateUrl: 'partials/historic.html',
            controller: 'LabSensorsHistoric',
        }).
        when('/beacons', {
            templateUrl: 'partials/beacons.html',
            controller: 'LabBeacons',
        }).
        otherwise({
            redirectTo: '/index'
        });
}]);

CRTLab.run(['$http', '$window', '$rootScope', '$interval', '$location', 'Region', 'Socket', 'Auth', 'Lab', 'authService', 'Node', function($http, $window, $rootScope, $interval, $location, Region, Socket, Auth, Lab, authService, Node){
    try{
        cordova.plugins.locationManager.isBluetoothEnabled()
            .then(function(isEnabled){
                console.log("Bluetooth isEnabled: " + isEnabled);
                if (!isEnabled) {
                    cordova.plugins.locationManager.enableBluetooth();
                }
            })
            .fail(console.error)
            .done();
    }catch(e){
        console.error(e);
    }

    $rootScope.lab = Lab;

    $rootScope.$on("$locationChangeStart", function(event, next, current){
        console.log(next);
        current_view = next.split("#/");
        current_view = current_view.length > 1 ? current_view[1] : 'index';
    });

    $rootScope.load_next = function(event){
        console.log(event);
        console.log(views[current_view].next);
        $location.url("/"+views[current_view].next);
    }

    $rootScope.load_previous = function(event){
        console.log(event);
        console.log(views[current_view].previous);
        $location.url("/"+views[current_view].previous);
    }

    $window.addEventListener("message", function(data){
        if(data.data.access_token){
            api_token = data.data.access_token;
            Auth.set_token(data.data.access_token);
            init();
        }
    });

    $rootScope.$on('event:auth-loginRequired', function(event, data){
        console.log("login required!");
        login();
    });

    Auth.init({
        url: auth_url+'/auth/authorize',
        response_type: 'token',
        client_id: client_id,
        redirect_uri: auth_url+"/",
        other_params: {scope: 'inoffice analytics'}
    });

    Auth.get_token().then(function(token){
        api_token = token;
        init();
    }, function(){
        login();
    });

    function init(){
        console.log("Init App");
        Socket.init(socket_url, api_token, client_id);
        Lab.init().then(function(me){
            $rootScope.$on('region:state', function(event, result){
                if(Lab.me.in_office != result){
                    Lab.me.in_office = result;
                    Socket.emit('inoffice', {'result':result});
                }
            });
            try{
                Region.init({
                    uuid:BEACON_UUID,
                    id:'CRTLabs'
                });
            }catch(e){
                console.error(e);
            }
        });

        Node.init();

        document.addEventListener('pause', pause, false);
        document.addEventListener('resign', pause, false);
        document.addEventListener('resume', resume, false);

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

    function pause(e){
        console.log("pausing...");
        Socket.pause();
        Region.pause();
        Node.pause();
    }

    function resume(e){
        Socket.resume();
        Region.resume();
        Node.resume();
        console.log("resuming...");
    }

}]);

var app = (function(){
    var app = {};

    app.initialize = function(){
        if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
            document.addEventListener("deviceready", onDeviceReady, false);
        }else{
            onDeviceReady();
        }
    };

    function onDeviceReady(){
        angular.bootstrap(document, ['CRTLab']);
    }

    return app;

})();

$(document).ready(function(){
    app.initialize();
});
