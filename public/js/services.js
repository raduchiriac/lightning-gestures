'use strict';

app.factory('socket', function($rootScope) {
  var socket = io.connect();
  return {
    on: function(eventName, callback) {
      socket.on(eventName, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          callback.apply(socket, args);
        });
      });
    },
    emit: function(eventName, data, callback) {
      socket.emit(eventName, data, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

app.factory('allowDrawing', function($rootScope) {
  var allow = {
    retries: 0
  };
  return {
    init: function() {
      allow = {
        retries: 2
      }
      return allow;
    },
    get: function() {
      return allow;
    },
    update: function(value) {
      allow.retries += value;
      return allow;
    },
    eligible: function() {
      if(allow.retries>0){
        return true;
      }
      return false;
    }
  };
})