
// icon hide/display
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
  let newIcon = e.target.children[0];
  let oldIcon = e.relatedTarget.children[0];
  if (newIcon.classList.contains('fa-window-close'))
    newIcon.classList.remove('invisible');
  if (oldIcon.classList.contains('fa-window-close'))
    oldIcon.classList.add('invisible');
})
