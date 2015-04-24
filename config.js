module.exports = function (app, express, io) {

  var config = this;

  // Heroku config only
  if (process.env.PORT) {
    /* io.configure(function () {
      io.set("transports", ["xhr-polling"]);
      io.set("polling duration", 10);
    });
    */
  }

  // Express Configuration
  app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', {
      layout: false
    });
    app.use(express.favicon(__dirname + '/public/favicon.ico'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/public'));
    app.use(app.router);
  });

  app.configure('development', function () {
    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
    app.locals.pretty = true;
  });

  app.configure('production', function () {
    app.use(express.errorHandler());
  });

  return config;
};
