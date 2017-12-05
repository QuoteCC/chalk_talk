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

//handles clicking the generated buttons
$("#messages").on('click', '.upvote' , function(){
    console.log(this.value);
    var room_id = localStorage.getItem('room_id');
    var user_id = localStorage.getItem('user_id');
    var currSpan = $('#'+this.value);
    var msgId = this.value;

     //send votes to the server
     var params = {
       msgId,
       room_id,
       user_id
     }
    socket.emit('upvote', params, function(err){
      if(err){
        console.log(err);
      }
      console.log('upvote data sent');

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

socket.on('updateUpvote', function (params) {
  var currSpan = $('#'+params.mId);
  currSpan.html(params.len);
});

socket.on('updateUserList', function (users) {
  users.forEach( function (user) {
    let li = $('<li></li>');
    li.html(`<i class="fa fa-dot-circle-o"></i> ${user.name}`);
    $('#users').append(li);
  });

});

socket.on('updateMessageList', function (messages) {
  console.log('updatemessagelist');
  var request = messages.forEach( function (message, index) {
    var formattedTime = moment(message.createdAt).format('MMM Do, h:mm a');

    var li = $('<li class="list-group-item justify-content-between"></li>');
    //li.text(`${message.from}: ${formattedTime} ${message.text}`);
    li.html(`
        <div>
          <span class="from">${message.from}</span> <span class="timestamp">${formattedTime}</span></br>
          ${message.text}
        </div>
        <div>
          <button class='btn btn-outline-success upvote' value=${message.mId}><i class="fa fa-plus" aria-hidden="true"></i></button>
          <span id=${message.mId} class="badge badge-default badge-pill">0</span>
        </div>
    `);

    $('#messages').append(li);

  });
});

socket.on('newMessage', function (message) {
  //console.log('new message');
  var formattedTime = moment(message.createdAt).format('MMM Do, h:mm a');
  //get the array maxlength and add it to span

  var li = $('<li class="list-group-item justify-content-between"></li>');
  //console.log(message.mId);
  li.html(`
      <div>
        <span class="from">${message.from}</span> <span class="timestamp">${formattedTime}</span></br>
        ${message.text}
      </div>
      <div>
        <button class='btn btn-outline-success upvote' value=${message.mId}><i class="fa fa-plus" aria-hidden="true"></i></button>
        <span id=${message.mId} class="badge badge-default badge-pill">0</span>
      </div>
  `);
  // li.text(`${message.from}: ${formattedTime} ${message.text}`);

  $('#messages').append(li);

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
