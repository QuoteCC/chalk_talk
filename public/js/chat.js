/*
----------------------
CLIENT SIDE SOCKET.IO
----------------------
*/

var socket = io();

socket.on('connect', function () {

  var room_id = localStorage.getItem('room_id');
  var room_list = localStorage.getItem('room_list');
  var room_name = localStorage.getItem('room_name');
  var user_name = localStorage.getItem('user_name');
  var user_id = localStorage.getItem('user_id');
  var user_token = localStorage.getItem('user_token');


  if( !room_id || !room_name || !user_name || !user_id || !user_token) {
    alert('You MUST sign in to start chatting');
    return window.location.href = '/';
  }

  /////////////////////////////////////////////
  // Set the room names //
  var tabs = $('#room-list');
  var chats = $('#chat');
  let roomList = localStorage.getItem('room_list').split(',');
  roomList.forEach(function (room) {
    let validatedRoom = room.replace('!',''); // strip out special characters
    if (room === room_name) {
      tabs.append(
        `<li class="nav-item">
          <a id="${validatedRoom}" class="nav-link active" data-toggle="tab" href="#${validatedRoom}" role="tab">
            ${room}
            <i class="fa fa-window-close"></i></a>
        </li>`
      );
    } else {
      tabs.append(
        `<li class="nav-item">
          <a id="${validatedRoom}" class="nav-link" data-toggle="tab" href="#${validatedRoom}" role="tab">
            ${room}
            <i class="fa fa-window-close invisible"></i></a>
        </li>`
      );
    }
  });
  // append final + add new chat room tab
  tabs.append(
    `<li class="nav-item">
      <a id="addnew" class="nav-link" data-toggle="tab" href="#add" role="tab"><i class="fa fa-plus"></i></a>
    </li>`
  );
  ///////////////////////

  var params = {
    room_id,
    user_token
  }

  socket.emit('join', params, function(err) {
    console.log('client joined');
    if(err){
      console.log('Error: '+ err);
      alert(err);
      window.location.href = '/';
    }

  });
});

socket.on('disconnect',function () {
  console.log('Disconnected from the server');
    socket.emit('leaveRoom', {
      user_name: localStorage.getItem('user_name'),
      user_id: localStorage.getItem('user_id'),
      room_id: localStorage.getItem('room_id')
    });
});

socket.on('updateUserList', function (users) {
  var ol = $('<ol></ol>');

  users.forEach( function (user) {
    ol.append($('<li></li>').text(user.name));
  });

  $('#users').html(ol);
});

socket.on('updateMessageList', function (messages) {
  console.log('updatemessagelist');
  var request = messages.forEach( function (message, index) {
    var formattedTime = moment(message.createdAt).format('MMM Do, h:mm a');

    var li = $('<li></li>');
    li.text(`${message.from}: ${formattedTime} ${message.text}`);

    $('#messages').append(li);
    //scroll to the bottom at the beginning of loading
    $('.message-container').scrollTop($('.message-container')[0].scrollHeight)

  });
});

socket.on('newMessage', function (message) {
  console.log('new message');
  var formattedTime = moment(message.createdAt).format('MMM Do, h:mm a');

  var li = $('<li></li>');
  li.text(`${message.from}: ${formattedTime} ${message.text}`);

  $('#messages').append(li);
  //scroll to the bottom whena  new message is sent
  $('.message-container').scrollTop($('.message-container')[0].scrollHeight)

});

$(document).ready(function(){
    $('#chat-text-box').keypress(function(e){
      if(e.keyCode==13)
      $('#send-button').click();
    });
});


var message_form = $('#message-form');
// var _window = $(window);
$(function() {
  // Initializes and creates emoji set from sprite sheet
  window.emojiPicker = new EmojiPicker({
    emojiable_selector: '[data-emojiable=true]',
    assetsPath: '../lib/img/',
    popupButtonClasses: 'fa fa-smile-o'
  });
      // Finds all elements with `emojiable_selector` and converts them to rich emoji input fields
      // You may want to delay this step if you have dynamically created input fields that appear later in the loading process
      // It can be called as many times as necessary; previously converted input fields will not be converted again
      window.emojiPicker.discover();
    });

message_form.on('submit', function(e) {
  //If .preventDefault() is called, the default action of the event will not be triggered.
  e.preventDefault();
  var text = $('[name=message]').val();
  socket.emit('createMessage', {
    room_id: localStorage.getItem('room_id'),
    user_name: localStorage.getItem('user_name'),
    text: text
  }, function () {
    $('[name=message]').val('');
  });
});


















// console.log('Just for scrolling');
