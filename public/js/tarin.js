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
  });

  // add new chat room
  $('body').on('click', '#addnew', function() {
    console.log('add new chat room');
  });

  // delete chat room from view
  $('body').on('click', '.fa-window-close', function() {
    console.log('delete a tab');
  });

});
