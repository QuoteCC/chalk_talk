const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage} = require('./utils/message');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

//configure middleware
app.use(express.static(publicPath));

//lets you listen to new connection and do something
io.on('connection', (socket) => {
	console.log("new user connected");

	socket.emit('newMessage', generateMessage('Admin', 'Welcome to chalk talk'));
	
	socket.broadcast.emit('newMessage', generateMessage('Admin', 'New user joined'));

	//listening for client's 'createMessage'
	socket.on('createMessage', (message, callback) => {
		console.log('createMessage', message);
		//io emits to every person
		io.emit('newMessage', generateMessage(message.from, message.text));
		callback('This is from the server!');
		// broadcast sends to everyone but MYSELF
		// socket.broadcast.emit('newMessage', {
		// 	from: message.from,
		// 	text: message.text,
		// 	createdAt: new Date().getTime()
		// });
	});

	socket.on('disconnect', (socket) => {
		console.log('user is disconnected');
	});
});

//using http instead of app
server.listen(port, () => {
	console.log(`server is up on ${port}`);
});