var NodeService = angular.module('NodeService', ['SocketService']);

NodeService.service('Node', ['$http', '$rootScope', 'Socket', '$q', function ($http, $rootScope, Socket, $q){
    this.nodes = {};
    var self = this;
    this.init = function(){
        var d = $q.defer();
        $http.get(api_url+"/node/nodes").then(function(response){
            for(var n in response.data[0].nodes){
                self.nodes[response.data[0].nodes[n]] = {};
            }
            d.resolve(self.nodes);
        })

        Socket.ws.$on('node', function(data){
            var d = JSON.parse(data);
            console.log(d);
            var n = d.tags.node;
            self.nodes[n] = self.nodes[n] || {};
            self.nodes[n][d.measurement] = self.nodes[n][d.measurement] || [];
            var v = self.nodes[n][d.measurement];
            if (v.length > 50) v.shift();
            v.push({x:new Date(d.time), y:d.fields.value});
            $rootScope.$broadcast("node:"+n+":"+d.measurement, d);
        });
        return d.promise;
    }

    this.get_data = function(node, measurement){
        if(!node){
            for(var i in self.nodes){
                node = i;
                break;
            }
        }
        self.nodes[node][measurement] = self.nodes[node][measurement] || [];
        return self.nodes[node][measurement];
    }

}]);
