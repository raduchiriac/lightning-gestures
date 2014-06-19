module.exports = function(stopwatch, io) {
  var config = this;

  stopwatch.on('stopwatch:tick', function(data) {
    io.sockets.emit('session:time', {
      'time': data.time
    });
  });
  stopwatch.on('stopwatch:reset', function(data) {
    io.sockets.emit('session:time', {
      'time': data.time
    });
  });
  stopwatch.on('stopwatch:start', function(data) {
    io.sockets.emit('session:start', {
      'time': data.time,
      'drawing': data.drawing
    })
  });

  stopwatch.start();

  return config;
}