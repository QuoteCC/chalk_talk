$(document).ready(function() {
  // icon hide/display on tab switch
  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    let newIcon = e.target.children[0];
    let oldIcon = e.relatedTarget.children[0];
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
    // add and enter a new chat room
  });

  // delete chat room from view
  $('body').on('click', '.fa-window-close', function() {
    // remove a chat room from view
    // save settings for the deleted chat room, until user re-enters?
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
