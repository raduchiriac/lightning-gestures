var express = require('express'),
  app = express(),
  http = require('http'),
  server = http.createServer(app),
  routes = require('./routes'),
  Stopwatch = require('./models/stopwatch.js'),
  socket = require('./routes/socket.js'),
  io = require('socket.io').listen(server, {
    log: false
  });

// Configuration
var config = require('./config')(app, express);

// Routes
app.locals.duration = 10 * 1000;
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);
app.get('*', routes.index);

// Start counter
var sessions = ['triangle', 'x', 'rectangle', 'circle', 'check', 'caret', 'zig-zag', 'arrow', 'left square bracket', 'right square bracket', 'v', 'delete', 'left curly brace', 'right curly brace', 'star', 'pigtail'],
  stopwatch = new Stopwatch(app.locals.duration, sessions),
  stopwatch_config = require('./models/stopwatch_config')(stopwatch, io);

// Socket.io Communication
io.sockets.on('connection', socket);

// Tell Socket.io about Stopwatch
socket.meetStopwatch(stopwatch);

// Start server
var port = process.env.PORT || 8080;

server.listen(port, function() {
  console.log("> Express server listening on port %d in %s mode", port, app.settings.env);
});