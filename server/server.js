const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const bodyParser = require('body-parser')

const {generateMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

const mongoCl = require('mongodb').MongoClient;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

//configure middleware
app.use(express.static(publicPath));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//db Connection

var db;

mongoCl.connect('mongodb://admin:chalk_talk@ds113606.mlab.com:13606/chalk_talk', (err, database) =>{
	if (err){
		return console.log(err + " err on Connect");
	}
	db = database;

});

//future home of the db Query for users
app.post('/chat', (req, res) =>{
	db.collection("users").save(req.body, (err, result) => {
		if (err){
			return console.log(err);
		}
		console.log("saved user");
		var redir = '/chat.html?name=' + req.body.user.name + '&room=' + req.body.user.room;
		res.redirect(redir);
	});
});



//lets you listen to new connection and do something
io.on('connection', (socket) => {
	console.log("new user connected");

	socket.on('join', (params, callback) => {
		if (!isRealString(params.name) || !isRealString(params.room)) {
			return callback('NAME AND ROOM REQUIRED.');
		}

		//to join chat rooms!!!
		socket.join(params.room);
		//socket.leave('name of room')
		//io.to('room Name').emit --- to send to everyone in room 'to'
		users.removeUser(socket.id);
		users.addUser(socket.id, params.name, params.room)

		io.to(params.room).emit('updateUserList', users.getUserList(params.room));

		socket.emit('newMessage', generateMessage('Admin', 'Welcome to chalk talk!'));
		socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
		callback();
	});

	//listening for client's 'createMessage'
	socket.on('createMessage', (message, callback) => {
		var user = users.getUser(socket.id);

		//only send if user exists and not just sending blank lines and spaces
		if (user && isRealString(message.text)) {
			//emit to only the room that user is in!!!
			io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
		}
		callback('This is from the server!');
		// broadcast sends to everyone but MYSELF
		// socket.broadcast.emit('newMessage', {
		// 	from: message.from,
		// 	text: message.text,
		// 	createdAt: new Date().getTime()
		// });
	});

	socket.on('disconnect', () => {
		console.log('user is disconnected');
		var user = users.removeUser(socket.id);

		//if user was removed
		if(user) {
			io.to(user.room).emit('updateUserList', users.getUserList(user.room));
			io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
		}
	});
});


//using http instead of app
server.listen(port, () => {
	console.log(`server is up on ${port}`);
});
