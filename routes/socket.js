// Keep track of which names are used so that there are no duplicates
var userMethods = (function() {
  var taken_names = {},
    all_user_objects = {};

  var claim = function(name) {
    if (!name || taken_names[name]) {
      return false;
    } else {
      taken_names[name] = true;
      return true;
    }
  };
  var setGuestCredentials = function() {
    var name,
      nextUserId = 1,
      user_object = {
        'clid': new Date().getTime(),
        'score': 0,
      };
    do {
      name = 'Guest' + nextUserId;
      nextUserId += 1;
    } while (!claim(name));
    user_object.name = name;
    all_user_objects[name] = user_object;

    return user_object;
  };
  var getAll = function() {
    var res = [];
    for (user in all_user_objects) {
      res.push(all_user_objects[user]);
    }
    return res;
  };
  var free = function(name) {
    if (taken_names[name]) {
      delete taken_names[name];
      delete all_user_objects[name];
    }
  };
  var changeUserName = function(oldName, newName) {
    // This functin changes the name in the whole array
    var obj = all_user_objects[oldName];
    obj.name = newName;
    all_user_objects[newName] = obj;
  }
  return {
    claim: claim,
    setGuestCredentials: setGuestCredentials,
    getAll: getAll,
    free: free,
    changeUserName: changeUserName,
  };
}());

// export function for listening to the socket
module.exports = function(socket) {
  var user = userMethods.setGuestCredentials(),
    name = user.name,
    users = userMethods.getAll();

  socket.emit('init', {
    user: user,
    users: users
  });

  // EVENT FROM CLIENT
  socket.on('send:message', function(data, fn) {
    var timestamp = new Date().getTime(),
      session = stopwatch.getSession(),
      calculated_score = (stopwatch.getDuration() - (timestamp - session.time)) / 1000;

    user.score += calculated_score;

    if (session.drawing.toLowerCase() == data.drawing) {
      socket.broadcast.emit('send:message', {
        user: user,
        text: data.drawing
      });
      socket.broadcast.emit('set:score', {
        name: name,
        score: user.score,
      });
      fn(true, user.score);
    } else {
      fn(false);
    }
  });
  socket.broadcast.emit('user:join', {
    data: user
  });
  socket.on('change:name', function(data, fn) {
    if (userMethods.claim(data.name)) {
      var oldName = name;

      userMethods.changeUserName(oldName, data.name);
      userMethods.free(oldName);
      name = data.name;
      user.name = name;

      socket.broadcast.emit('change:name', {
        oldName: oldName,
        newName: name
      });
      fn(true);
    } else {
      fn(false);
    }
  });
  socket.on('disconnect', function() {
    socket.broadcast.emit('user:left', {
      user: user
    });
    userMethods.free(user.name);
  });
};

// Attach the Stopwatch Class to socket.io
var stopwatch;
module.exports.meetStopwatch = function(_stopwatch) {
  stopwatch = _stopwatch;
  return false;
}