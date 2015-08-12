var CRTLab = angular.module('CRTLab', ['RegionService']);

CRTLab.controller('LabCtrl', function($scope, Region){
    Region.start({
        uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
        id:'CRT Lab'
    });
    $scope.orderProp = 'rssi';
    $scope.region = Region;

});
