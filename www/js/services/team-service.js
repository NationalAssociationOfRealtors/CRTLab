var TeamService = angular.module('TeamService', ['SocketService']);

TeamService.service('Team', ['$http', 'Socket', function ($http, Socket){
    this.users = [];
    var self = this;
    this.me = {};
    this.init = function(){
        $http.get(api_url+"/lab/me").then(function(response){
            self.me = response.data[0];
        }).then(function(){
            $http.get(api_url+"/lab/team").then(function(response){
                angular.copy(response.data[0], self.users);
            });
        });

        Socket.ws.$on('inoffice', function(data){
            for(i in self.users){
                if(self.users[i]._id == data.user._id){
                    self.users[i] = data.user;
                }
            }
            if(data.user._id == self.me._id){
                self.me = data.user;
            }
            var state = data.result ? "arrived" : "departed";
            cordova.plugins.notification.local.schedule({
                id: parseInt(data.user._id),
                title: data.user.name+' has '+state+'.',
                icon: "file://img/crt_logo.png",
            });
        });
    }
}]);
