$(function() {
  $.get('/api/relaypoem', {}, function(data, textStatus, jqXHR){
    $('.relaypoem').html(data);
  });
  $("#submit").click(function(){
    poem = {
      author: $("#author").val(),
      text: $("#text").val(),
    };
    $.post('/api/relaypoem', poem, function(data, textStatus, jqXHR){
      $('.relaypoem').text(data);
    });
  });
})
