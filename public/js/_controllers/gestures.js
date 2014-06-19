'use strict';

app.controller('GesturesCtrl', ['$scope', 'socket',
  function($scope, socket) {
    $scope.swipedl = function($event) {
      $scope.toggle('rightSidebar');
    }
    $scope.swipedr = function($event) {
      $scope.toggle('leftSidebar');
    }
  }
]);