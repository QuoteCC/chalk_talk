const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

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

	socket.emit('newMessage', {
		from: 'noah@newMessage.com',
		text: 'HI!',
		createAt: 123
	});

	//event listener
	socket.on('createMessage', (message) => {
		console.log('createMessage', message);
	});

	socket.on('disconnect', (socket) => {
		console.log('user is disconnected');
	});
});

//using http instead of app
server.listen(port, () => {
	console.log(`server is up on ${port}`);
});