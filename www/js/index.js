var uri = "crtlabsdev.realtors.org";
var api_url = "https://"+uri;
var socket_url = "wss://"+uri+"/socket";
var client_id = "55df1e9c64bd32000c24b167";
var api_token = null;

var CRTLab = angular.module('CRTLab', ['ngRoute', 'RegionService', 'http-auth-interceptor', 'SocketService', 'LoginService', 'TeamService', 'nvd3', 'ngTouch', 'NodeService', 'LabControllers']);

var views = {
    index:{
        next:'sensors',
        previous:'sensors'
    },
    sensors:{
        next:'index',
        previous:'index'
    }
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
        otherwise({
            redirectTo: '/index'
        });
}]);

CRTLab.run(['$http', '$rootScope', '$interval', '$location', 'Region', 'Socket', 'Auth', 'Team', 'authService', 'Node', function($http, $rootScope, $interval, $location, Region, Socket, Auth, Team, authService, Node){
    cordova.plugins.locationManager.isBluetoothEnabled()
        .then(function(isEnabled){
            console.log("Bluetooth isEnabled: " + isEnabled);
            if (!isEnabled) {
                cordova.plugins.locationManager.enableBluetooth();
            }
        })
        .fail(console.error)
        .done();

    $rootScope.team = Team;

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
                console.log(result);
                if(Team.me.in_office != result){
                    Team.me.in_office = result;
                    Socket.emit('inoffice', {'result':result});
                }
            });
            Region.init({
                uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
                id:'CRT Lab'
            });
        });

        $rootScope.$on('event:auth-loginRequired', function(event, data){
            login();
        });

        Node.init();

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
