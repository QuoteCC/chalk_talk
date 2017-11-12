//method available to us from socket.io lib
//critical for sending data
var socket = io();

socket.on('connect', function(){
	console.log('Connected to server');

	socket.emit('createMessage', {
		from: "Noah",
		text: "This message is from noah"
	});

});

socket.on('disconnect', function(){
	console.log('disconnected from server!');
});

//listener for new email
socket.on('newMessage', function (message){
	console.log('newMessage', message);
});