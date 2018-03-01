angular.module('myApp', ['io.service']).

run(function (io) {
	io.init({
		ioServer: 'http://localhost:3696',
	});
}).

controller('MainController', function ($scope, io) {

	//	SET NICKNAME
	$scope.setUsername = function(){
		if ( $scope.username ) {
			$scope.showme = true;
		} else {
			$('.validusername.error').show();
			setTimeout(function(){
				$('.validusername.error').fadeOut();
			}, 500);
		}
	}

	$scope.send = function () {

		if ( $scope.message ) {

			//	CREATE TIMESTAMP
			var msgTS_ 		= new Date(),
				msgTS_H		= msgTS_.getHours(),
				msgTS_M		= msgTS_.getMinutes(),
				msgTS_Day	= msgTS_.getDay(),
				msgTS_Mth	= msgTS_.getMonth(),
				msgTS_Year	= msgTS_.getFullYear(),
				msgTS	= (msgTS_H < 10 ? '0' + msgTS_H : msgTS_H) + ':' + (msgTS_M < 10 ? '0' + msgTS_M : msgTS_M) + ' - ' + (msgTS_Day < 10 ? '0' + msgTS_Day : msgTS_Day) + '/' + (msgTS_Mth < 10 ? '0' + msgTS_Mth : msgTS_Mth) + '/' + msgTS_Year;

			//	SEND MESSAGE
			io.emit({
				room: $scope.roomname,
				message: $scope.message,
				username: $scope.username,
				timestamp: msgTS
			});

			//	ADD MESSAGES TO THE CONVERSATION
			$('.conversation ul').append('<li class="clearfix mine"><span class="user">' + $scope.username +'</span><span class="message">' + $scope.message + '</span><span class="timestamp">' + msgTS + '</span></li>');
			$('.conversation').stop().animate({
				scrollTop: $('.conversation')[0].scrollHeight
			}, 800);


			//	EMPTY MESSAGE BOX
			$scope.message = null;

		} else {
			$('.validmessage.error').show();
			setTimeout(function(){
				$('.validmessage.error').fadeOut();
			}, 500);
		}
	}

	//	CHOOSE ROOM
	$scope.chooseRoom = function(){
		$scope.whichroom = true;
	}

	//	JOIN ROOM
	$scope.joinRoom = function(){
		if ( $scope.roomname ) {
			io.subscribe( $scope.roomname );
			$scope.inroom = true;
			$scope.whichroom = false;
			$scope.roomnameentered = $scope.roomname;

			//	EMPTY MESSAGE BOX
			$scope.message = null;

			$('.conversation ul').html('');
		} else {
			$('.validroomname.error').show();
			setTimeout(function(){
				$('.validroomname.error').fadeOut();
			}, 500);
		}
	}

	//	LEAVE ROOM
	$scope.leaveRoom = function(){
		io.unsubscribe( $scope.roomname );
		$scope.roomname = null;
		$scope.roomnameentered = null;
		$scope.inroom = false;
		$scope.whichroom = false;
		$('.conversation ul').html('');
	}

});