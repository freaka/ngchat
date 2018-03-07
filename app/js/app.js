angular.module('myApp', ['io.service']).

run(function (io) {
	io.init({
		ioServer: 'http://localhost:3696',
	});
}).

controller('MainController', function ($scope, io) {

	//	RESETING VARS
	$scope.allUsers = [];
	$scope.allMessages = [];
	$scope.totalUsers = 0;
	$scope.somebodyTyping = '';

	//	ADD USER
	io.addUser();

	//	CHANGE ROOM
	$scope.changeRoom = function(){
		if ( $scope.myRoomname ) {
			io.changeRoom( $scope.myRoomname );
			$scope.allMessages = [];
			$scope._roomnameError = false;

		} else {
			$scope._roomnameError = true;
			document.getElementById('inputRoomname').focus();
		}
	}
	$scope.typingRoom = function( $event ){
		var _key = $event.keyCode;
		$scope._roomnameError = false;

		if ( _key == 13 ) {
			$scope.changeRoom();
		}
	}

	//	CHANGE NAME
	$scope.setNickname = function(){
		if ( $scope.myNickname ) {
			io.changeName( $scope.myNickname );
			$scope._nicknameError = false;
		} else {
			$scope._nicknameError = true;
		}
		document.getElementById('inputNickname').focus();
	}
	$scope.typingNickname = function( $event ){
		var _key = $event.keyCode;
		$scope._nicknameError = false;

		if ( _key == 13 ) {
			$scope.setNickname();
		}
	}

	//	SEND MESSAGE
	$scope.sendMessage = function() {

		var message = $scope.message;
		var username = $scope.mySocketID;

		if ( message ) {
			io.sendMessage({
				message: message,
				user: username,
				tstamp: getTimestamp(),
			}, 'MESSAGE');
			$scope._messageError = false;
			$scope.message = '';

		} else {
			$scope._messageError = true;
		}

		document.getElementById('inputMessage').focus();
	}

	// TYPING MESSAGE
	var typingTimer;
	$scope.typingMessage = function( $event ){
		var _key = $event.keyCode;

		$scope._messageError = false;

		clearTimeout( typingTimer );

		if ( _key == 13 ) {
			$scope.sendMessage();
			io.userTyped( $scope.myNickname );


		} else {
			io.userTyping( $scope.myNickname );
			typingTimer = setTimeout(function(){
				io.userTyped( $scope.myNickname );
			}, 2000);
		}

	}

	// SEND DIRECT
	$scope.sendDirect = function( element ){
		var _messageTo = element.currentTarget.getAttribute('data-user');
		var _messageToNickname = element.currentTarget.getAttribute('data-nickname');

		var messageBox = prompt('Type your message to ' + _messageToNickname + ':', '');

		if ( messageBox == null || messageBox == "") {
			//
		} else {
			io.sendMessage({
				message: messageBox,
				user: _messageTo,
				tstamp: getTimestamp(),
			}, 'DIRECT');
		}

	}



	io.watch('_typing', function( data ){
		$scope.somebodyTyping = data.user + ' is typing...';
		$scope.$apply();
	});

	io.watch('_typed', function( data ){
		$scope.somebodyTyping = '';
		$scope.$apply();
	});

	io.watch('_message', function( data ){
		$scope.allMessages.push( data );
		$scope.$apply();


		runScroll('scrollmessages','end');
	});

	io.watch('_totalCount', function( data ){
		$scope.totalUsers = data.totalUsers;
		$scope.$apply();
	});

	io.watch('_nickname', function( data ){
		$scope.myNickname = data.nickname;
		$scope.mySocketID = data.socketid;
		$scope.$apply();
	});

	io.watch('_roomname', function( data ){
		$scope.myRoomname = data.roomname;
		$scope.$apply();
	});

	io.watch('_added', function( data ) {
		$scope.totalRoomUsers = data.roomUsers.length;
		$scope.roomUsers = data.roomUsers;
		$scope.$apply();
	});

	io.watch('_roomChanged', function( data ) {
		$scope.totalRoomUsers = data.roomUsers.length;
		$scope.roomUsers = data.roomUsers;
		$scope.$apply();
	});

	io.watch('_disconnected', function( data ) {
		$scope.totalRoomUsers = data.roomUsers.length;
		$scope.roomUsers = data.roomUsers;
		$scope.$apply();
	});


	function getTimestamp(){

		var _today	= new Date(),
			_day	= _today.getDate(),
			_month	= _today.getMonth() + 1,
			_year	= _today.getFullYear(),
			_hour	= _today.getHours(),
			_minute	= _today.getMinutes(),
			_time	= '',
			_date	= '';
			now		= '';

		if ( _day < 10 )	{ _day = '0' + _day; }
		if ( _month < 10 )	{ _month = '0' + _month; }
		if ( _hour < 10 )	{ _hour = '0' + _hour; }
		if ( _minute < 10 )	{ _minute = '0' + _minute; }

		_time = _hour + ':' + _minute;
		_date = _day + '/' + _month + '/' + _year;
		now = _time + '—' + _date;

		return now;
	}

	function runScroll(parentDivId,targetID) {
		var longdiv = document.querySelector("#" + parentDivId);
		var div3pos = document.getElementById(targetID).offsetTop;
		scrollTo(longdiv, div3pos, 600);
	}

	function scrollTo(element, to, duration) {
		if (duration < 0) return;
		var difference = to - element.scrollTop;
		var perTick = difference / duration * 10;
		if (perTick == Infinity) return;
		setTimeout(function () {
			element.scrollTop = element.scrollTop + perTick;
			if (element.scrollTop == to) return;
			scrollTo(element, to, duration - 10);
		}, 10);
	}

});