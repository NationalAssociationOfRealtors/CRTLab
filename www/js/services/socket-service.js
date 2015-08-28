var SocketService = angular.module('SocketService', ['ngWebsocket']);

SocketService.service('Socket', ['$rootScope', '$websocket', function ($rootScope, $websocket){
    this.ws = null;
    var me = this;
    var pinger = null;
    this.init = function(url, token, client_id){
        me.ws = $websocket.$new({
            url:url+"?token="+token+"&client_id="+client_id,
            protocols: "json",
            lazy: true,
            enqueue: true,
            reconnect: true,
            reconnectInterval: 5000
        });
        me.ws.$on('$open', function(data){
            console.log("WS is open");
        });
        me.ws.$on('invalid_access', function(data){
            me.ws.$close();
            $rootScope.$broadcast('event:auth-loginRequired', data);
        });
        me.ws.$on('node', function(data){
            console.log(data);
        });
        me.ws.$open();
        ping();
    }

    function ping(){
        pinger = setInterval(function(){
            if(me.is_open()){
                me.emit('ping', {});
            }
        }, 1000);
    }

    this.is_open = function(){
        try{
            return me.ws.$status() == me.ws.$OPEN;
        }catch(e){
            return false;
        }
    }

    this.send = function(to, event, data){
        data['to'] = to;
        me.ws.$emit(event, data);
    }

    this.emit = function(event, data){
        console.log("emitting: "+event);
        console.log(data);
        me.ws.$emit(event, data);
    }
}]);
