angular.module('myApp', ['io.service']).

run(function (io) {
  io.init({
    ioServer: 'http://localhost:3696',
  });
}).

controller('MainController', function ($scope, io) {

  $scope.send = function () {
    io.emit({
      message: $scope.message
    });
    $scope.message = null;
  }

  io.watch('message', function (data) {
    $scope.lastMessage = data.message;
    $scope.$apply();
  });
});
