var CRTLab = angular.module('CRTLab', ['RegionService']);

CRTLab.controller('LabCtrl', ['$scope', '$http', 'Region', function($scope, $http, Region){
    var url = "http://172.16.121.179/";
    window.open = cordova.InAppBrowser.open;
    $.oauth2({
        auth_url: url+'auth/authorize',
        response_type: 'token',
        client_id: '55ce4ad1333e0a2df4eb434d',
        redirect_uri: url,
        other_params: {scope: 'inoffice'}
    }, function(token, response){
        $http.defaults.headers.common.Authorization = token;
        console.log(token);
        Region.start({
            uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
            id:'CRT Lab'
        });
        $http.get(url+"auth/hello").then(function(response){
            alert(response);
        })
    }, function(error, response){
        alert(error);
    });
    $scope.orderProp = 'rssi';
    $scope.region = Region;
}]);
