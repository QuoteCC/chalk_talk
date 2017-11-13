//method available to us from socket.io lib
//critical for sending data
var socket = io();

socket.on('connect', function(){
	console.log('Connected to server');
});

socket.on('disconnect', function(){
	console.log('disconnected from server!');
});

//listener for newMessage from server
socket.on('newMessage', function (message){
	var formattedTime = moment(message.createdAt).format('h:mm a');
	var li = $('<li></li>');
	li.text(`${message.from}: ${formattedTime} ${message.text}`);

	$('#messages').append(li);
});

socket.emit('createMessage', {
	from: 'Noah',
	text: 'new message from noah'
	}, function (data) {
		console.log('Acknowledged on client side', data);
	});

$('#message-form').on('submit', function(e) {
	e.preventDefault();

	var messageTextBox = $('[name=message]');

	socket.emit('createMessage', {
		from: 'User',
		text: messageTextBox.val()
	}, function(){
		messageTextBox.val('');
	});
})
