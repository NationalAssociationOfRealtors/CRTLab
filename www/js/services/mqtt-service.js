var MQTTService = angular.module('MQTTService', []);

MQTTService.service('MQTT', ['$rootScope', function ($rootScope){
    this.client = new Paho.MQTT.Client(mqtt_url, "crtlabs");
    this.data = {};
    var me = this;
    var ret = null;

    function retry(){
        clearInterval(ret);
        ret = setInterval(function(){
            me.client.connect(options);
        }, 5000);
    }

    this.client.onConnectionLost = function (responseObject) {
        console.log("connection lost: " + responseObject.errorMessage);
        retry();
    };

    this.client.onMessageArrived = function (message) {
        var n = message.destinationName;
        console.log(message.destinationName, ': ', message.payloadString);
        me.data[n] = me.data[n] || [];
        if (me.data[n].length > 50) me.data[n].shift();
        me.data[n].push({x:new Date(), y:message.payloadString});
        $rootScope.$broadcast("mqtt:"+message.destinationName, message.payloadString);
    };

    this.get_data = function(n){
        me.data[n] = me.data[n] || [];
        return me.data[n];
    }

    var options = {
        timeout: 3,
        keepAliveInterval: 45000,
        onSuccess: function () {
            clearInterval(ret);
            console.log("mqtt connected");
            me.client.subscribe('/node/#', {qos: 1});
            me.client.subscribe('outTopic', {qos: 1});

            var message = new Paho.MQTT.Message("RED");
            message.destinationName = "inTopic";
            me.client.send(message);
        },

        onFailure: function (message) {
            console.log("Connection failed: " + message.errorMessage);
            retry();
        }
    };

    this.connect = function(){
        console.log("MQTT Connecting...")
        me.client.connect(options);
    }
}]);
