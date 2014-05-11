$(function() {
  $.get('/api/counter', {}, function(data, textStatus, jqXHR){
    $('.counter').append($('<h2/>').text("Anata ha " + data + " nin me no Visitor!!" ))
                 .append($('<button/>').text("kiriban houkoku").click(function(){
                   alert("shikumi ga dekite inai node atode kanrisha ni mail shite ne!");
                 }));
  });

  var sock = io.connect();
  sock.on('members', function(members) {
    $members= $("#members").empty();
    for (var i = 0; i < members.length; i++) {
      $members.append($("<li/>").text(escape(members[i].name) + ' is NOW online!!'));
    }
  });
})
