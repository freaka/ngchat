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



			// USER ADDED
			socket.on('user added', function( data ){

				console.log('user added');
				console.log( data );

				watches['_added'](data);

			});

			// ROOM CHANGED
			socket.on('room changed', function( data ){

				console.log('room changed');
				console.log( data );

				watches['_roomChanged'](data);

			});

			// USER DISCONNECTED
			socket.on('user disconnected', function( data ){

				console.log('user disconnected');
				console.log( data );

				watches['_disconnected'](data);

			});

			//	REFRESH COUNT
			socket.on('refresh total count', function( data ){

				console.log('refreshing count...');
				console.log( data );

				watches['_totalCount'](data);

			});

			//	NICKNAME
			socket.on('nickname', function( data ){

				console.log('setting nickname...');
				console.log( data );

				watches['_nickname'](data);
			});

			//	ROOMNAME
			socket.on('roomname', function( data ){

				console.log('setting roomname...');
				console.log( data );

				watches['_roomname'](data);
			});

			//	SEND MESSAGE
					// USER JOINED ROOM
					// USER LEFT ROOM
					// DIRECT MESSAGE
			socket.on('message received', function( data ){

				console.log('message received...');
				console.log( data );

				watches['_message'](data);

			});

			// USER TYPING
			socket.on('has user typing', function( data ){

				console.log('has user typing...');
				console.log( data );

				watches['_typing'](data);
			});

			// USER STOPPED TYPING
			socket.on('has user typed', function( data ){

				console.log('has user typed...');
				console.log( data );

				watches['_typed'](data);
			});

		},

		userTyping:function( user ){
			socket.emit('user typing', user);
		},

		userTyped:function( user ){
			socket.emit('user typed', user);
		},

		addUser:function(){
			socket.emit('add user');
		},

		changeName:function( user ){
			socket.emit('change name', user);
		},

		changeRoom:function( room ) {
			socket.emit('change room', room);
		},

		sendMessage:function( data, action ){
			socket.emit('message', data, action);
		},

	    watch:function (item, data) {
			watches[item] = data;
	    }
	};
});