angular.module('io.service', []).
factory('io', function ($http) {
	var socket,
	ioServer,
	ioRoom,
	watches = {};

	return {
		init: function (conf) {
			ioServer = conf.ioServer;
			ioRoom = conf.ioRoom;

			socket = io.connect(conf.ioServer);

			//	READ MESSAGE
			socket.on('event.response', function (data) {

				if ( data.message.room == ioRoom) {

					// ADD MESSAGES TO THE CONVERSATION
					$('.conversation ul').append('<li class="clearfix"><span class="user">' + data.message.username +'</span><span class="message">' + data.message.message + '</span><span class="timestamp">' + data.message.timestamp + '</span></li>');
					$('.conversation').stop().animate({
						scrollTop: $('.conversation')[0].scrollHeight
					}, 800);

				}

			});

		},

		subscribe: function ( room ) {
			//	SUBSCRIBE TO ROOM
			ioRoom = room;
			socket.emit('event.subscribe', room);

			$('.conversation ul').html('');
		},

		unsubscribe: function ( room ) {
			//	UNSUBSCRIBE TO ROOM
			ioRoom = '';
			socket.emit('event.unsubscribe', room);

			$('.conversation ul').html('');
		},

		emit: function ( arguments ) {
			//	MESSAGES
			socket.emit('event.message', ioRoom, {
				message: arguments
			});
		}
	};
});