$(function (){
  function escape(val){
    return $('<div/>').text(val).html();
  }

  var sock = io.connect('',{'sync disconnect on unload':true});
  sock.on('connect', function () {
    sock.emit('set user', window.prompt('Namae wo irete ne!'));
  });

  $('#messageform').submit(function() {
    sock.emit('msg', $('#messageform input').val());
    $('#messageform input').val('');
    return false;
  });

  sock.on('msg', function(msg) {
    $("#chat").prepend($("<p/>").text(escape(msg.user.name) + ': ' + escape(msg.msg)).css({color:msg.user.color}));
  });

  sock.on('members', function(members) {
    $members= $("#members").empty();
    for (var i = 0; i < members.length; i++) {
      $members.append($("<li/>").text(escape(members[i].name)));
    }
  });
});
