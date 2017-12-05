$(document).ready(function() {

  $("#chat-text-box").emojioneArea();

  // icon hide/display on tab switch
  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    let newIcon = '';
    let oldIcon = '';
    if (e.target) {
      newIcon = e.target.children[0];
    }
    if (e.relatedTarget) {
      oldIcon = e.relatedTarget.children[0];
    }
    if (newIcon.classList.contains('fa-window-close')) {
      newIcon.classList.remove('invisible');
    }
    if (oldIcon.classList.contains('fa-window-close')) {
      oldIcon.classList.add('invisible');
    }
    updateChat(e.target);
  });

  // add new chat room
  $('body').on('click', '#addnew', function() {
    let roomName = window.prompt("New Room: ","Room Name");
    if (!!roomName) {
      socket.emit('newRoom', {
        name: roomName
      }, function(room) {
        if (room) {
          alert('Room created successfuly');
          localStorage.setItem('room_id', room._id);
          localStorage.setItem('room_name', room.name);
          window.location.href = '/chat.html';
        } else {
          alert('Unable to create the room, room name is unique');
        }
      });
    } else {
      alert('Invalid room name.');
    }
  });

  // delete chat room from view
  $('body').on('click', '.fa-window-close', function() {
    $(this).parent().parent().remove();
    // save settings for the deleted chat room, until user re-enters?
  });

  $('body').on('click', '#send-button', function() {
    $('.emojionearea-editor').html('');
  });

  // $('#chat-text-box').keyup(function (e) {
  //   if (e.which == 13) {
  //     console.log('farts');
  //     console.log($('#send-button'));
  //   }
  // });

  // $(".message-input").emojioneArea({
	// 	events: {
	// 		keyup: function (editor, event) {
	// 			console.log(editor);
	// 			console.log(event);
	// 			console.log('event:keypress');
	// 		}
	// 	}
	// });

  $("#chat-text-box").emojioneArea({
    events: {
      keyup: function(editor, event) {
      	// catches everything but enter
        if (event.which == 13) {
          alert("Enter key pressed");
          $("#form").submit();
          // event.preventDefault();
          // return false;
        } else {
        	alert("Key pressed: " + event.which);
        }
      }
    }
  });

});

function updateChat(newChat) {
  var socket = io();
  console.log('switching to this room: ', newChat.getAttribute('id'));
  let room = newChat.getAttribute('id');
  socket.emit('getRoom', {
    name: room
  }, function(room) {
    if(room){
      localStorage.setItem('room_id', room._id);
      localStorage.setItem('room_name', room.name);
      window.location.href = '/chat.html'; // reload page
    } else{
      alert('There is an error with this room, please chose another one.');
    }
  });
}
