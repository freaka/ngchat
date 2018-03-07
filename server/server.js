var express = require('express');
var server = require('http').createServer(app);
var app = express();
var io = require('socket.io')(server);
var port = 3696;

var usersNames = [];
var nickNames = [];
var usersRooms = [];
var usersTotal = 0;

server.listen(port, function () {
	console.log('Server listening at port %d', port);
});

io.on('connection', function (socket) {


	function checkUsers( whichroom ) {
		var nsp = (typeof _nsp !== 'string') ? '/' : _nsp;
		var usersInfo = [];

		if ( io.nsps[nsp].adapter.rooms[ whichroom ] != undefined ) {

			var room2check = Object.keys( io.nsps[nsp].adapter.rooms[ whichroom ] );
			var usersInThisRoom = Object.keys( io.nsps[nsp].adapter.rooms[ whichroom ]['sockets'] );
			var usersConnected = Object.keys( usersNames );

			for (i=0;i<usersInThisRoom.length;i++){
				for (j=0;j<usersConnected.length;j++) {

					if ( usersConnected[j] == usersInThisRoom[i] ) {
						usersInfo[i] = {
							ID:usersConnected[j],
							nickname:nickNames[usersConnected[j]],
							roomname:usersRooms[usersConnected[j]],
						}
					}
				}
			}

		}

		return usersInfo;
	}


	//	ADD USER
	socket.on('add user', function () {

		usersNames[ socket.id ] = socket.id;
		usersRooms[ socket.id ] = 'lobby';
		nickNames [ socket.id ] = socket.id;

		socket.join( usersRooms[ socket.id ] );

		++usersTotal;

		//	send back
		io.in( usersRooms[ socket.id ] ).emit('user added', {
			roomUsers: checkUsers( usersRooms[ socket.id ] ),
		});

		//	user name
		socket.emit('nickname', {
			nickname: nickNames[ socket.id ],
			socketid: socket.id,
		});

		//	user room
		socket.emit('roomname', {
			roomname: usersRooms[ socket.id ],
		});

		//	total count
		socket.emit('refresh total count', {
			totalUsers: usersTotal,
		});
		socket.broadcast.emit('refresh total count', {
			totalUsers: usersTotal,
		});

		io.in( usersRooms[ socket.id ] ).emit('message received', {
			message: nickNames [ socket.id ] + ' has entered the room',
			action: 'INFO',
		});

	});

	//	CHANGE NAME
	socket.on('change name', function ( name ) {

		var room	= usersRooms[ socket.id ];
		var oldName	= nickNames [ socket.id ];

		nickNames [ socket.id ] = name;

		//	user name
		socket.emit('nickname', {
			nickname: nickNames[ socket.id ],
			socketid: socket.id,
		});

		io.in( room ).emit('room changed', {
			roomUsers: checkUsers( room ),
		});

		io.in( room ).emit('message received', {
			message: oldName + ' has changed its name to ' + nickNames [ socket.id ],
			action: 'INFO',
		});

	});

	//	CHANGE ROOM
	socket.on('change room', function ( room ) {

		var room2leave = usersRooms[ socket.id ];

		usersRooms[ socket.id ] = room;

		socket.leave( room2leave );
		socket.join( room );

		io.in( room2leave ).emit('room changed', {
			roomUsers: checkUsers( room2leave ),
		});

		io.in( room ).emit('room changed', {
			roomUsers: checkUsers( room ),
		});

		//	user room
		socket.emit('roomname', {
			roomname: usersRooms[ socket.id ],
		});

		//	total count
		socket.emit('refresh total count', {
			totalUsers: usersTotal,
		});
		socket.broadcast.emit('refresh total count', {
			totalUsers: usersTotal,
		});

		io.in( room ).emit('message received', {
			message: nickNames [ socket.id ] + ' has entered the room',
			action: 'INFO',
		});

		io.in( room2leave ).emit('message received', {
			message: nickNames [ socket.id ] + ' has left the room',
			action: 'INFO',
		});

	});

	//	SEND MESSAGE
	socket.on('message', function( data, action ){

		var _message	= data.message;
			_userSent	= data.user,
			_timestamp	= data.tstamp,
			_action		= action,
			room		= usersRooms[ socket.id ];

		if ( _action == 'DIRECT' ) {
			socket.emit('message received', {
				from		: usersNames[ socket.id ],
				message		: 'DIRECT TO ' + nickNames[ _userSent ] + ': ' + _message,
				timestamp	: _timestamp,
				action		: _action,
			});

			socket.to( _userSent ).emit('message received', {
				from		: nickNames [ socket.id ],
				message		: _message,
				timestamp	: _timestamp,
				action		: _action,
			});

		} else {
			io.in( room ).emit('message received', {
				from		: nickNames[ _userSent ],
				message		: _message,
				timestamp	: _timestamp,
				action		: _action,
			});
		}

	});

	//	USER TYPING
	socket.on('user typing', function( user ){

		var room = usersRooms[ socket.id ];

		socket.to( room ).emit('has user typing', {
			user: user,
		});

	});

	//	USER TYPED
	socket.on('user typed', function( user ){

		var room = usersRooms[ socket.id ];

		socket.to( room ).emit('has user typed', {
			user: user,
		});

	});


	//	DISCONNECT USER
	socket.on('disconnect', function(){

		var room2leave = usersRooms[ socket.id ];
		var user2leave = nickNames [ socket.id ];

		delete usersNames[ socket.id ];
		delete usersRooms[ socket.id ];
		delete nickNames [ socket.id ];

		--usersTotal;

		//	send back
		io.in( room2leave ).emit('user disconnected', {
			roomUsers: checkUsers( room2leave ),
		});

		io.in( room2leave ).emit('message received', {
			message: user2leave + ' has left the room',
			action: 'INFO',
		});

		//	total count
		socket.emit('refresh total count', {
			totalUsers: usersTotal,
		});
		socket.broadcast.emit('refresh total count', {
			totalUsers: usersTotal,
		});

	});


});