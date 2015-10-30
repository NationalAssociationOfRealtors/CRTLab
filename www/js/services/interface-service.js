var InterfaceService = angular.module('InterfaceService', ['SocketService']);

InterfaceService.service('Interface', ['$http', '$rootScope', 'Socket', '$q', function ($http, $rootScope, Socket, $q){
    this.interfaces = {};
    var self = this;
    loading_historic = false;
    var timers = {};
    this.init = function(){
        var d = $q.defer();
        Socket.ws.$on('node', function(data){
            var d = JSON.parse(data);
            var n = d.tags.interface;
            self.interfaces[n] = self.interfaces[n] || {};
            self.interfaces[n]['last'] = self.interfaces[n]['last'] || {};
            self.interfaces[n]['last'][d.measurement] = {x:new Date(), y:d.fields.value};
            //$rootScope.$broadcast("interface:"+n+":"+d.measurement, d);
        });
        return d.promise;
    };

    function fill_data(_interface, measurement){
        var k = _interface+":"+measurement;
        console.debug("Filling: ", _interface, measurement);
        if(!timers[k]){
            timers[k] = setInterval(function(){
                var v = self.interfaces[_interface]['realtime'][measurement];
                if(v.length == 30) v.shift();
                var d = {};
                angular.copy(self.interfaces[_interface]['last'][measurement], d);
                d.x = new Date();
                $rootScope.$apply(function(){
                    v.push(d);
                });
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

    this.get_data = function(_interface, measurement){
        if(!_interface){
            for(var i in self.interfaces){
                _interface = i;
                //break;
            }
        }
        self.interfaces[_interface] = self.interfaces[_interface] || {};
        self.interfaces[_interface]['last'] = self.interfaces[_interface]['last'] || {};
        self.interfaces[_interface]['last'][measurement] = self.interfaces[_interface]['last'][measurement] || {x:new Date(), y:0};
        self.interfaces[_interface]['realtime'] = self.interfaces[_interface]['realtime'] || {};
        self.interfaces[_interface]['realtime'][measurement] = self.interfaces[_interface]['realtime'][measurement] || [];
        fill_data(_interface, measurement);
        return self.interfaces[_interface]['realtime'][measurement];
    };

    function get_historic_data(_interface){
        if(!loading_historic){
            loading_historic = true;
            $http.get(api_url+"/node/"+node+"/sensors").then(function(resp){
                for(var i in resp.data[0]){
                    angular.copy(resp.data[0][i], self.interfaces[_interface]['historic'][i]);
                }
                loading_historic = false;
            });
        }
    };

    this.get_historic = function(_interface, measurement){
        if(!_interface){
            for(var i in self.interfaces){
                _interface = i;
                //break;
            }
        }
        self.interfaces[_interface]['historic'][measurement] = self.interfaces[_interface]['historic'][measurement] || [];
        get_historic_data(_interface);
        return self.interfaces[_interface]['historic'][measurement];
    };
}]);
