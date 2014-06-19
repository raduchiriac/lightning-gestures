app.directive('dial', function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      elem.knob();
    }
  };
});

app.directive('draw', ['socket', 'allowDrawing',
  function(socket, allowDrawing) {
    return function(scope, elm, attrs) {
      var tapping = false,
        startX, pointX,
        canvas = elm[0],
        ctx = canvas.getContext("2d"),
        _points,
        oldX, oldY,
        threshold = 3,
        _r = new DollarRecognizer();

      elm.on('touchstart mousedown', function(e) {
        if (allowDrawing.eligible()) {
          var touches = e.originalEvent.touches ? e.originalEvent.touches[0] : e,
            marginl = parseInt($('.app').css("marginLeft"));
          startX = touches.pageX - marginl;
          pointX = touches.pageY;
          _points = [];

          ctx.beginPath();
          ctx.strokeStyle = "#bae1ff";
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.lineWidth = 6;
          oldX = startX;
          oldY = pointX;
        }
        e.preventDefault();
      }).on('touchmove mousemove', function(e) {
        if (allowDrawing.eligible() && $.isArray(_points)) {
          var touches = e.originalEvent.touches ? e.originalEvent.touches[0] : e,
            marginl = parseInt($('.app').css("marginLeft"));
          if (oldX - (touches.pageX - marginl) < 3 && oldX - (touches.pageX - marginl) > -3) {
            return;
          }
          if (oldY - touches.pageY < 3 && oldY - touches.pageY > -3) {
            return;
          }
          ctx.moveTo(oldX, oldY);
          oldX = (touches.pageX - marginl);
          oldY = touches.pageY;
          ctx.lineTo(oldX, oldY);
          ctx.stroke();
          ctx.shadowColor = 'rgba(169,236,255,0.25)';
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 10;
          _points[_points.length] = new Point(oldX, oldY);
        }
        e.preventDefault();
      }).on("touchend mouseup", function(e) {
        if (allowDrawing.eligible()) {
          ctx.closePath();
          if (_points.length >= 10) {
            var result = _r.Recognize(_points);

            // CALL THE MESSAGE FUNCTION IN THE SCOPE TO TELL HIM WHAT YOU DID
            var drawing = result.Name,
              precision = Math.round(result.Score * 100);
            scope.sendMessage(drawing, precision);
          }
          _points = false;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        e.preventDefault();
      });
    }
  }
]);
//*/

app.directive('resizable', function($window) {
  return function($scope, elem, attrs) {
    $scope.initializeWindowSize = function() {
      $scope.windowHeight = $window.innerHeight;
      $scope.windowWidth = $window.innerWidth;
      $(elem[0]).attr('width', $('.app-body').innerWidth());
      $(elem[0]).attr('height', $('.app-body').innerHeight());

      return true;
    };
    $scope.initializeWindowSize();
    return angular.element($window).bind('resize', function() {
      $scope.initializeWindowSize();
      return $scope.$apply();
    });
  };
});