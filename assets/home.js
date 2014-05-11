$(function() {
  $.get('/api/counter', {}, function(data, textStatus, jqXHR){
    $('body').append($('<div/>').addClass("counter"));
    $('.counter').append($('<h2/>').text("Anata ha " + data + " nin me no Visitor!!" ))
                 .append($('<button/>').text("kiriban houkoku").click(function(){
                   alert("shikumi ga dekite inai node atode kanrisha ni mail shite ne!");
                 }));
  });
})
