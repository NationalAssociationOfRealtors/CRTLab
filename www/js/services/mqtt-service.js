var MQTTService = angular.module('MQTTService', []);

MQTTService.service('MQTT', ['$rootScope', function ($rootScope){
    this.client = new Paho.MQTT.Client(address, 80, "/mqtt", "crtlabs");
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
        console.log(message.destinationName, ': ', message.payloadString);
        $rootScope.$broadcast("mqtt:"+message.destinationName, message.payloadString);
    };

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
