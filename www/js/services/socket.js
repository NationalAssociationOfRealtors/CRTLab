var SocketService = angular.module('SocketService', []);

SocketService.service('Socket', ['$rootScope', function ($rootScope) {
    this.ws = null;
    this.token = null;
    var me = this;
    this.init = function(ws, token, client_id){
        me.token = token;
        me.ws = ws;
        me.client_id = client_id;
        me.ws.$on('$open', function(data){
            console.log("WS is open");
        });
        me.ws.$on('invalid_access', function(data){
            me.ws.$close();
            $rootScope.$broadcast('event:auth-loginRequired', data);
        })
        me.ws.$open();
    }

    this.is_open = function(){
        try{
            return me.ws.$status() == me.ws.$OPEN;
        }catch(e){
            return false;
        }
    }

    this.send = function(to, event, data){
        data.auth = {
            'token':me.token,
            'client_id': me.client_id,
        }
        data['to'] = to;
        me.ws.$emit(event, data);
    }

    this.emit = function(event, data){
        data.auth = {
            'token':me.token,
            'client_id': me.client_id,
        }
        me.ws.$emit(event, data);
    }
}]);
