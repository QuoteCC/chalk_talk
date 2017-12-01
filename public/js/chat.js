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
  Set the room names //
  var tabs = $('#room-list');
  var chats = $('#chat');
  let roomList = localStorage.getItem('room_list').split(',');
  roomList.forEach(function (room) {
    // for the
    if (room === room_name) {
      tabs.append(
        `<li class="nav-item">
          <a class="nav-link active" data-toggle="tab" href="#${room}" role="tab">
            ${room}
            <i class="fa fa-window-close"></i></a>
        </li>`
      );
      chats.append(
        `<div class="tab-pane active" id="${room}" role="tabpanel">
          <div class="message-container">
            <ul id="messages"></ul>
          </div>
          <form id="message-form">
            <input id="chat-text-box" name="message" type="text" placeholder="type message here" autofocus="true" autocomplete="false">
            <button id="send-button">Send</button>
          </form>
        </div>`
      );
    } else {
      tabs.append(
        `<li class="nav-item">
          <a class="nav-link" data-toggle="tab" href="#${room}" role="tab">
            ${room}
            <i class="fa fa-window-close invisible"></i></a>
        </li>`
      );
      chats.append(
        `<div class="tab-pane" id="${room}" role="tabpanel">
          <div class="message-container">
            <ul id="messages"></ul>
          </div>
          <form id="message-form">
            <input id="chat-text-box" name="message" type="text" placeholder="type message here" autofocus="true" autocomplete="false">
            <button id= "send-button">Send</button>
          </form>
        </div>`
      );
    }
  });
  // append final + add new chat room tab
  tabs.append(
    `<li class="nav-item">
      <a class="nav-link" data-toggle="tab" href="#add" role="tab"><i class="fa fa-plus"></i></a>
    </li>`
  );
  ///////////////////////

  var params = {
    room_id,
    user_token
  }

  socket.emit('join', params, function(err) {
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

  var request = messages.forEach( function (message, index) {
    var formattedTime = moment(message.createdAt).format('MMM Do, h:mm a');

    var li = $('<li></li>');
    li.text(`${message.from}: ${formattedTime} ${message.text}`);

    $('#messages').append(li);
    // $(`#${room_name}`).find('#messages').append(li);

  });
});

socket.on('newMessage', function (message) {
  var formattedTime = moment(message.createdAt).format('MMM Do, h:mm a');

  var li = $('<li></li>');
  li.text(`${message.from}: ${formattedTime} ${message.text}`);

  $('#messages').append(li);
  // console.log($(`#${room_name}`).find('#messages'));
  // $(`#${room_name}`).find('#messages').append(li);


});


var message_form = $('#message-form');
// var _window = $(window);

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
