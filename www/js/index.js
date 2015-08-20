var CRTLab = angular.module('CRTLab', ['ngRoute', 'RegionService', 'http-auth-interceptor', 'SocketService', 'LoginService', 'LabControllers']);

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
