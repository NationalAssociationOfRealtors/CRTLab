/*
 *    Auth.login({
 *        auth_url: '',         // required
 *        response_type: '',    // required
 *        token_url: '',        // required if response_type = 'code'
 *        logout_url: '',       // recommended if available
 *        client_id: '',        // required
 *        client_secret: '',    // required if response_type = 'code'
 *        redirect_uri: '',     // required - some dummy url
 *        other_params: {}      // optional params object for scope, state, display...
 *    }, function(token, response){
 *          // do something with token and response
 *    }, function(error){
 *          // do something with error
 *    });
*/

// String prototype to parse and get url params
String.prototype.getParam = function( str ){
    str = str.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regex = new RegExp( "[\\?&]*"+str+"=([^&#]*)" );
    var results = regex.exec( this );
    if( results == null ){
        return "";
    } else {
        return results[1];
    }
}

var LoginService = angular.module('LoginService', []);

    LoginService.service('Auth', ['$q', '$http', '$window',  function ($q, $http, $window) {
    this.open = false;
    this.cfg = {};
    var me = this;

    this.init = function(config){
        this.cfg = config;
    }

    this.get_token = function(){
        var d = $q.defer();
        var token = $window.localStorage.getItem("token");
        if(token){
            me.set_token(token);
            d.resolve(token);
        }else{
            d.reject();
        }
        return d.promise;
    }

    this.set_token = function(token){
        $http.defaults.headers.common.Authorization = "Bearer " + token;
        $window.localStorage.setItem("token", token);
    }

    this.login = function(){
        var d = $q.defer();
        var paramObj = {
            client_id: me.cfg.client_id,
            redirect_uri: me.cfg.redirect_uri,
            response_type: me.cfg.response_type
        };
        $.extend(paramObj, me.cfg.other_params);
        var login_url = me.cfg.url + '?' + $.param(paramObj);

        // open Cordova inapp-browser with login url
        if(!me.open){
            me.open = true;
            var loginWindow = $window.open(login_url, '_blank', 'location=no');
            loginWindow.addEventListener('loadstart', function(e) {
                console.log(e);
                var url = e.url;

                // if authorization code method check for code/error in url param
                if(me.cfg.response_type == "code"){
                    url = url.split("#")[0];
                    var code = url.getParam("code");
                    var error = url.getParam("error");
                    if (code || error){
                        loginWindow.close();
                        this.open = false;
                        if (code) {
                            $.ajax({
                                url: me.cfg.token_url,
                                data: {code:code, client_id:me.cfg.client_id, client_secret:me.cfg.client_secret, redirect_uri:me.cfg.redirect_uri, grant_type:"authorization_code"},
                                type: 'POST',
                                success: function(data){
                                    var access_token;
                                    if((data instanceof Object)){
                                        access_token = data.access_token;
                                    } else {
                                        access_token = data.getParam("access_token");
                                    }
                                    me.set_token(access_token);
                                    d.resolve({token:access_token, data:data});
                                },
                                error: function(error){
                                    d.reject({error:error});
                                }
                            });
                        } else if (error) {
                            d.reject({error:error, data:url.split("?")[1]});
                        }
                    }
                // if implicit method check for acces_token/error in url hash fragment
                } else if(me.cfg.response_type == "token") {
                    try{
                        var access_token = url.split("access_token=")[1].split("&")[0];
                        var error = url.split("error=")[1];
                        if(access_token || error){
                            if(access_token){
                                me.set_token(access_token);
                                d.resolve({token:access_token, data:url.split("#")[1]});
                            } else if(error){
                                d.reject({error:error, data:url.split("#")[1]});
                            }
                            loginWindow.close();
                            this.open = false;
                        }
                    }catch(e){
                        console.log(e);
                    }
                }
            });
        }
        return d.promise;
    }
}]);
