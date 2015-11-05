var API_VERSION = "v1.0";
var BEACON_UUID = "C3CE6B3E-E801-4E7F-8F05-8A83D9B8A183";
var uri = "crtlabsdev.realtors.org";
var api_url = "https://"+uri+"/api/"+API_VERSION;
var auth_url = "https://"+uri;
var socket_url = "wss://"+uri+"/socket";
var client_id = "55df1e9c64bd32000c24b167";
var api_token = null;

var CRTLab = angular.module('CRTLab', ['ngRoute', 'http-auth-interceptor', 'SocketService', 'LoginService', 'LocationService', 'InterfaceService', 'nvd3', 'ngTouch', 'LabControllers']);

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
        when('/location/:locationId', {
            templateUrl: 'partials/location.html',
            controller: 'LabLocation',
        }).
        when('/sensors', {
            controller: 'LabSensors',
        }).
        when('/historic', {
            templateUrl: 'partials/sensors.html',
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

CRTLab.run(['$http', '$window', '$rootScope', '$interval', '$location', 'Socket', 'Auth', 'Location', 'authService', 'Interface', function($http, $window, $rootScope, $interval, $location, Socket, Auth, Location, authService, Interface){

    $rootScope.location = Location;

    $rootScope.$on("$locationChangeStart", function(event, next, current){
        current_view = next.split("#/");
        current_view = current_view.length > 1 ? current_view[1] : 'index';
    });

    $rootScope.load_next = function(event){
        $location.url("/"+views[current_view].next);
    }

    $rootScope.load_previous = function(event){
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
        console.debug("Initializing");
        Socket.init(socket_url, api_token, client_id);
        Interface.init();
        Location.init();
        document.addEventListener('pause', pause, false);
        document.addEventListener('resign', pause, false);
        document.addEventListener('resume', resume, false);
        console.log("Initialized");

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
