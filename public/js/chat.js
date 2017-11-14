//method available to us from socket.io lib
//critical for sending data
var socket = io();

socket.on('connect', function(){
	var params = $.deparam(window.location.search);

	socket.emit('join', params, function (err){
		if(err){
			//alert user of error
			alert(err);
			//send back to home page
			window.location.href = '/';
		} else {
			console.log('No error');
		}
	})
});

socket.on('disconnect', function(){
	console.log('disconnected from server!');
});

//add listener for updating user list
socket.on('updateUserList', function (users) {
	var ol = $('<ol></ol>');

	users.forEach(function (user) {
		ol.append($('<li></li>').text(user));
	});

	$('#users').html(ol);
});

//listener for newMessage from server
socket.on('newMessage', function (message){
	var formattedTime = moment(message.createdAt).format('h:mm a');
	var li = $('<li></li>');
	li.text(`${message.from}: ${formattedTime} ${message.text}`);

	$('#messages').append(li);
});

// socket.emit('createMessage', {
// 	from: 'Noah',
// 	text: 'new message from noah'
// 	}, function (data) {
// 		console.log('Acknowledged on client side', data);
// 	});

$('#message-form').on('submit', function(e) {
	e.preventDefault();

	var nameTextBox = $('[name=name]');
	var messageTextBox = $('[name=message]');

	socket.emit('createMessage', {
		text: messageTextBox.val()
	}, function(){
		messageTextBox.val('');
	});
})
