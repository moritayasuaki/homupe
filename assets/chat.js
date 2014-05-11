$(function (){
  function escape(val){
    return $('<div/>').text(val).html();
  }

  var sock = io.connect();
  sock.on('connect', function () {
    sock.emit('set name', window.prompt('Namae wo irete ne!'));
  });

  $('#messageform').submit(function() {
    sock.emit('msg', $('#messageform input').val());
    $('#messageform input').val('');
    return false;
  });

  sock.on('msg', function(msg) {
    $("#chat").prepend($("<p/>").text(escape(msg.name) + ': ' + escape(msg.msg)));
  });

  sock.on('members', function(members) {
    $("#members ul li").empty();
    for (member in members) {
      $("#members ul").append($("<li/>").text(escape(member)));
    }
  });
});
