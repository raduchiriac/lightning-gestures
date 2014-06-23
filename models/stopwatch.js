var util = require('util'),
  events = require('events'),
  _ = require('underscore');

// ---------------------------------------------
// Constructor
// ---------------------------------------------
function Stopwatch(_duration, _sessions, _translations) {
  if (false === (this instanceof Stopwatch)) {
    return new Stopwatch();
  }
  this.duration = _duration;
  this.hour = 3600000;
  this.minute = 60000;
  this.second = 1000;
  this.time = _duration;
  this.sessions = _sessions;
  this.translations = _translations;

  this.sessionTimestamp = undefined;
  this.sessionDrawing = undefined;
  this.interval = undefined;

  events.EventEmitter.call(this);

  // Use Underscore to bind all of our methods
  // to the proper context
  _.bindAll(this);
};

// ---------------------------------------------
// Inherit from EventEmitter
// ---------------------------------------------
util.inherits(Stopwatch, events.EventEmitter);

// ---------------------------------------------
// Methods
// ---------------------------------------------
Stopwatch.prototype.start = function() {
  if (this.interval) {
    return;
  }

  //console.log('Starting Stopwatch!');
  // note the use of _.bindAll in the constructor
  // with bindAll we can pass one of our methods to
  // setInterval and have it called with the proper 'this' value
  this.sessionDrawing = this.sessions[Math.floor(Math.random() * this.sessions.length)];
  this.sessionTimestamp = new Date().getTime();
  this.interval = setInterval(this.onTick, this.second);

  var localsessionDrawing = this.sessionDrawing;
  this.emit('stopwatch:start', {
    'time': this.formatTime(this.duration),
    'drawing': this.sessionDrawing,
    'translation': this.translations[localsessionDrawing],
  });
};

Stopwatch.prototype.stop = function() {
  //console.log('Stopping Stopwatch!');
  if (this.interval) {
    clearInterval(this.interval);
    this.interval = undefined;
    this.emit('stopwatch:stop');
  }
};

Stopwatch.prototype.reset = function() {
  //console.log('Resetting Stopwatch!');
  this.emit('stopwatch:reset', {
    'time': this.formatTime(this.time)
  });
};

Stopwatch.prototype.onTick = function() {
  this.time -= this.second;

  var formattedTime = this.formatTime(this.time, false);
  this.emit('stopwatch:tick', {
    'time': formattedTime
  });

  if (this.time === 0) {
    this.stop();
    this.time = this.duration;
    this.start();
  }
};

Stopwatch.prototype.formatTime = function(time, everything) {
  var remainder = time,
    numHours,
    numMinutes,
    numSeconds,
    output = "";

  numHours = String(parseInt(remainder / this.hour, 10));
  remainder -= this.hour * numHours;

  numMinutes = String(parseInt(remainder / this.minute, 10));
  remainder -= this.minute * numMinutes;

  numSeconds = String(parseInt(remainder / this.second, 10));

  if ( !! everything) {
    output = _.map([numHours, numMinutes, numSeconds], function(str) {
      if (str.length === 1) {
        str = "0" + str;
      }
      return str;
    }).join(":");
  } else {
    output = numSeconds;
  }

  return output;
};

Stopwatch.prototype.getTime = function(everything) {
  return this.formatTime(this.time, everything);
};

Stopwatch.prototype.getSession = function() {
  return {
    'time': this.sessionTimestamp,
    'drawing': this.sessionDrawing
  }
}

Stopwatch.prototype.getDuration = function() {
  return this.duration;
}

// ---------------------------------------------
// Export
// ---------------------------------------------
module.exports = Stopwatch;