'use strict';

app.controller('MainCtrl', ['$scope', 'socket', 'allowDrawing', '$filter',
  function($scope, socket, allowDrawing, $filter) {

    var txt_wait = '...',
      txt_success = 'Bravo : ',
      txt_error = 'perdu...';

    // ---- INIT
    socket.on('init', function(data) {
      $scope.current_username = data.user;
      $scope.name = $scope.current_username.name;
      $scope.users = data.users;
      $scope.score = 0;
      $scope.currentDrawing = txt_wait;
      $scope.messages = [];
    });

    // ---- SEND MESSAGE
    socket.on('send:message', function(data) {
      $scope.messages.push({
        user: data.user.name,
        text: data.text
      });
    });

    // ----- CHANGE NAME
    socket.on('change:name', function(data) {
      changeName(data.oldName, data.newName);
    });

    // ----- JOIN
    socket.on('user:join', function(data) {
      $scope.users.push(data.data);
    });

    // ----- LEFT
    socket.on('user:left', function(data) {
      var user;
      for (var i = 0; i < $scope.users.length; i++) {
        user = $scope.users[i].name;
        if (user === data.user.name) {
          $scope.users.splice(i, 1);
          break;
        }
      }
    });

    socket.on('set:score', function(data) {
      $scope.score = data.score;
      var user;
      for (var i = 0; i < $scope.users.length; i++) {
        user = $scope.users[i].name;
        if (user === data.name) {
          $scope.users[i].score = data.score;
          break;
        }
      }
    });

    //-----TICK DOM REFRESH
    socket.on('session:time', function(data) {
      $('#timer').val(data.time).trigger("change");
    });

    // ----- CYCLE START
    socket.on('session:start', function(data) {
      $scope.currentDrawing = data.drawing;
      // WE USE THE TRANSLATION INSTEAD
      $scope.currentDrawing = data.translation;
      allowDrawing.init();

      $('#sessionname').addClass('active');
      $('#timer').val(data.time).trigger("change");
      $('.app-body').removeClass('error success');
    });


    var retrieveUsername = function() {
      var username;
      username = (localStorage.getItem("username") || false);
      if (!username) {
        return $scope.name;
      }
      return username;
    };

    var setup_member = function() {
      var username;
      username = retrieveUsername();
      if (username) {
        socket.emit('change:name', {
          name: username,
          score: 0
        }, function(result) {
          if (!result) {
            // ...
          } else {
            changeName($scope.name, username);

            $scope.name = username;
            $scope.newName = '';
          }
        });
        return;
      }
      return false;
    };

    // Check if message has a mention for current user
    var getMention = function(message) {
      var text, pattern, mention;
      text = message;
      pattern = /\B\@([\w\-]+)/gim;
      mention = text.match(pattern);

      if (mention) {
        mention = String(mention).split("@")[1];
        if (mention === $scope.current_username) return mention;
      }

      return false;
    };

    $scope.mention = function(name) {
      $scope.message = '@' + name + ' ';
      $('.input-message').focus()
    };

    var changeName = function(oldName, newName, member) {
      for (var i = 0; i < $scope.users.length; i++) {
        if ($scope.users[i].name === oldName) {
          $scope.users[i].name = newName;
          break;
        }
      }

      localStorage.setItem("username", newName);
      $scope.current_username.name = newName;
    };


    $scope.changeName = function() {
      socket.emit('change:name', {
        name: $scope.newName
      }, function(result) {
        if (!result) {
          // ...
        } else {
          changeName($scope.name, $scope.newName);

          $scope.name = $scope.newName;
          $scope.newName = '';
        }
      });
    };

    $scope.sendMessage = function(_drawing, _precision) {
      var drawing = $scope.message || _drawing,
        precision = $scope.precision || _precision;

      // SEND AND WAIT FOR REPLY
      socket.emit('send:message', {
        drawing: drawing,
        precision: precision
      }, function(result, message) {
        $('#sessionname').removeClass('active');
        if (!result) {
          $('.app-body').addClass('error');
          allowDrawing.update(-1);
          if (allowDrawing.eligible()) {
            // Bring in helper
          } else {
            $scope.currentDrawing = txt_error;
          }
        } else {
          $('.app-body').addClass('success');
          allowDrawing.update(-2);

          $scope.score = message;

          for (var i = 0; i < $scope.users.length; i++) {
            if ($scope.users[i].name === $scope.name) {
              $scope.users[i].score = $scope.score;
              break;
            }
          }
          // Show possition
          $scope.currentDrawing = txt_success + $filter('number')($scope.score, 2);
          // add the message to our model locally
          // as it was already sent to the other ones
          $scope.messages.push({
            user: $scope.name,
            text: drawing
          });
        }
      });

      // clear message box
      $scope.message = $scope.precision = '';
    };
  }
])