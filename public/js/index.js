//method available to us from socket.io lib
//critical for sending data
var socket = io();

socket.on('connect', function(){
	console.log('Connected to server');
});

socket.on('disconnect', function(){
	console.log('disconnected from server!');
});

//listener for newMessager from server
socket.on('newMessage', function (message){
	console.log('newMessage', message);
});