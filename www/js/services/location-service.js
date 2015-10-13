var LocationService = angular.module('LocationService', []);

LocationService.service('Location', ['$http', '$q', function ($http, $q){
    var self = this;
    this.locations = {}
    this.init = function(){
        var d = $q.defer();
        $http.get(api_url+"/location/list").then(function(response){
            self.locations = response.data[0];
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
