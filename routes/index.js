exports.index = function(req, res) {
  res.render('index', {
    data: {
      duration: req.app.locals.duration / 1000
    }
  });
};

exports.partials = function(req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};