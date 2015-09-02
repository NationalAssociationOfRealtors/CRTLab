var NodeService = angular.module('NodeService', ['SocketService']);

NodeService.service('Node', ['$http', '$rootScope', 'Socket', '$q', function ($http, $rootScope, Socket, $q){
    this.nodes = {};
    var self = this;
    loading_historic = false;
    this.init = function(){
        var d = $q.defer();
        $http.get(api_url+"/node/nodes").then(function(response){
            for(var n in response.data[0].nodes){
                self.nodes[response.data[0].nodes[n]] = {historic:{}, realtime:{}};
            }
            d.resolve(self.nodes);
        })

        Socket.ws.$on('node', function(data){
            var d = JSON.parse(data);
            var n = d.tags.node;
            self.nodes[n]['realtime'] = self.nodes[n]['realtime'] || {};
            self.nodes[n]['realtime'][d.measurement] = self.nodes[n]['realtime'][d.measurement] || [];
            var v = self.nodes[n]['realtime'][d.measurement];
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
        self.nodes[node]['realtime'][measurement] = self.nodes[node]['realtime'][measurement] || [];
        return self.nodes[node]['realtime'][measurement];
    }

    function get_historic_data(node){
        if(!loading_historic){
            loading_historic = true;
            $http.get(api_url+"/node/"+node+"/sensors").then(function(resp){
                for(var i in resp.data[0]){
                    angular.copy(resp.data[0][i], self.nodes[node]['historic'][i]);
                }
                loading_historic = false;
            });
        }

    }

    this.get_historic = function(node, measurement){
        if(!node){
            for(var i in self.nodes){
                node = i;
                break;
            }
        }
        self.nodes[node]['historic'][measurement] = self.nodes[node]['historic'][measurement] || [];
        get_historic_data(node);
        return self.nodes[node]['historic'][measurement];
    }

}]);
