var NodeService = angular.module('NodeService', ['SocketService']);

NodeService.service('Node', ['$http', '$rootScope', 'Socket', '$q', function ($http, $rootScope, Socket, $q){
    this.nodes = {};
    var self = this;
    loading_historic = false;
    var timers = {};
    this.init = function(){
        var d = $q.defer();
        $http.get(api_url+"/node/nodes").then(function(response){
            for(var n in response.data[0].nodes){
                self.nodes[response.data[0].nodes[n]] = {historic:{}, realtime:{}};
            }
            d.resolve(self.nodes);
        });

        Socket.ws.$on('node', function(data){
            var d = JSON.parse(data);
            var n = d.tags.node;
            self.nodes[n] = self.nodes[n] || {};
            self.nodes[n]['last'] = self.nodes[n]['last'] || {};
            self.nodes[n]['last'][d.measurement] = {x:new Date(d.time), y:d.fields.value};
            $rootScope.$broadcast("node:"+n+":"+d.measurement, d);
        });
        return d.promise;
    };

    function fill_data(node, measurement){
        var k = node+":"+measurement;
        console.log("Filling: ", node, measurement);
        if(!timers[k]){
            timers[k] = setInterval(function(){
                var v = self.nodes[node]['realtime'][measurement];
                if(v.length > 50) v.shift();
                var d = self.nodes[node]['last'][measurement];
                d.x = new Date();
                v.push(d);
            }, 1000);
        };
    };

    this.pause = function(){
        for(var t in timers){
            clearInterval(timers[t]);
            timers[t] = null;
            console.log("Timer: ", t, timers[t]);
        }
    };

    this.resume = function(){
        for(var t in timers){
            fill_data(t.split(":")[0], t.split(":")[1]);
        }
    };

    this.get_data = function(node, measurement){
        if(!node){
            for(var i in self.nodes){
                node = i;
                //break;
            }
        }
        self.nodes[node] = self.nodes[node] || {};
        self.nodes[node]['last'] = self.nodes[node]['last'] || {};
        self.nodes[node]['last'][measurement] = self.nodes[node]['last'][measurement] || {x:new Date(), y:0};
        self.nodes[node]['realtime'] = self.nodes[node]['realtime'] || {};
        self.nodes[node]['realtime'][measurement] = self.nodes[node]['realtime'][measurement] || [];
        fill_data(node, measurement);
        return self.nodes[node]['realtime'][measurement];
    };

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
    };

    this.get_historic = function(node, measurement){
        if(!node){
            for(var i in self.nodes){
                node = i;
                //break;
            }
        }
        self.nodes[node]['historic'][measurement] = self.nodes[node]['historic'][measurement] || [];
        get_historic_data(node);
        return self.nodes[node]['historic'][measurement];
    };
}]);
