var LocationService = angular.module('LocationService', []);

LocationService.service('Location', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope){
    var self = this;
    this.locations = {}
    this.init = function(){
        var d = $q.defer();
        $http.get(api_url+"/location/list").then(function(response){
            self.locations = response.data[0];
            $rootScope.$broadcast("location:loaded", self.locations);
            d.resolve(self.locations);
        });
        return d.promise;
    };

    this.get_location_data = function(location_id){
        var d = $q.defer();
        $http.get(api_url+"/location/"+location_id).then(function(response){
            d.resolve(response.data[0]);
        });
        return d.promise;
    };
}]);
