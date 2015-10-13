var LocationService = angular.module('LocationService', []);

LocationService.service('Location', ['$http', '$q', function ($http, $q){
    var self = this;
    this.me = {};
    this.locations = {}
    this.init = function(){
        var d = $q.defer();
        $http.get(api_url+"/location/list").then(function(response){
            self.locations = response.data[0];
            d.resolve(self.me);
        });


    this.get_power_usage = function(){
        $http.get(api_url+"/lab/ups").then(function(resp){
            self.power_usage.splice(0,self.power_usage.length)
            for(var i in resp.data[0]){
                var a = {values:resp.data[0][i], key:i};
                self.power_usage.push(a);
            }
            console.log(self.power_usage);
        });
        return self.power_usage;
    };

    this.get_weather_data = function(){
        $http.get(api_url+"/lab/weather").then(function(resp){
            self.weather_data.splice(0,self.weather_data.length)
            for(var i in resp.data[0]){
                var a = {values:resp.data[0][i], key:i};
                self.weather_data.push(a);
            }
            console.log(self.weather_data);
        });
        return self.weather_data;
    };

    this.get_energy_usage = function(){
        $http.get(api_url+"/lab/energy").then(function(resp){
            self.energy_usage.splice(0,self.energy_usage.length)
            for(var i in resp.data[0]){
                var a = {values:resp.data[0][i], key:i};
                self.energy_usage.push(a);
            }
            console.log(self.energy_usage);
        });
        return self.energy_usage;
    };
}]);
