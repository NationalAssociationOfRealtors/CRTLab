var CRTLab = angular.module('CRTLab', ['RegionService', 'http-auth-interceptor']);

CRTLab.controller('LabCtrl', ['$scope', '$http', 'Region', 'authService', function($scope, $http, Region, authService){
    var url = "http://192.168.1.128";
    window.open = cordova.InAppBrowser.open;
    $scope.user = {};

    $scope.$on('beacon:in-range', function(event, beacon){
        $http.post(url+'/lab/beacon', beacon);
    });

    try{
        var token = window.localStorage.getItem("token");
        $http.defaults.headers.common.Authorization = token;
    }catch(e){
        console.log(e);
    }

    $scope.$on('event:auth-loginRequired', function(event, data){
        $.oauth2({
            auth_url: url+'/auth/authorize',
            response_type: 'token',
            client_id: '55ce4ad1333e0a2df4eb434d',
            redirect_uri: url,
            other_params: {scope: 'inoffice'}
        }, function(token, response){
            console.log(token);
            window.localStorage.setItem("token", token);
            $http.defaults.headers.common.Authorization = token;
            Region.start({
                uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
                id:'CRT Lab'
            });
            authService.loginConfirmed();
        }, function(error, response){
            alert(error);
        });
    });
    $scope.orderProp = 'rssi';
    $scope.region = Region;
    $http.get(url+"/lab/me").then(function(response){
        $scope.user = response.data[0];
    });
}]);
