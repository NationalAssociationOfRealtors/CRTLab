var SocketService = angular.module('SocketService', ['ngWebsocket']);

SocketService.service('Socket', ['$rootScope', '$websocket', function ($rootScope, $websocket){
    this.ws = null;
    this.data = {};
    var me = this;
    var pinger = null;
    var paused = false;
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
            if(paused){
                setTimeout(function(){
                    me.pause();
                }, 10000);
            }
        });
        me.ws.$on('$close', function(data){
            console.log("WS is closed");
        });
        me.ws.$on('invalid_access', function(data){
            me.ws.$close();
            $rootScope.$broadcast('event:auth-loginRequired', data);
        });
        me.ws.$open();
        ping();
    }

    function ping(){
        clearInterval(pinger);
        pinger = setInterval(function(){
            if(me.is_open()){
                me.emit('ping', {});
            }
        }, 45000);
    }

    this.pause = function(e){
        paused = true;
        clearInterval(pinger);
        me.ws.$close();
    }

    this.resume = function(e){
        paused = false;
        me.ws.$open();
        ping();
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
        if(paused && !me.is_open()) me.ws.$open();
        me.ws.$emit(event, data);
    }
}]);
