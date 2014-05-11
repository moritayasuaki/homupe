$(function() {
  $.ajax({
    url:'https://api.instagram.com/v1/tags/neko/media/recent',
    dataType: "jsonp",
    data: { access_token: "10861679.d98c7b1.8c36483703784cb191134023b004c7de" },
    success: function (data, txtsts, jqxhr) {
      var nekos = data.data; 
      var i = 0;
      var captured_neko;
      var timer = window.setInterval(function () {
        y = $(window).height/2;
        var neko = nekos[i];
        $("body").append($("<div>")
          .css({position:'absolute', top:y, left:0})
          .animate({ left:$(window).width() }, 1800, function(){$(".neko").remove()})
          .click(function(){
            clearInterval(timer);
            $(".neko").remove();
            $("body").append(
              $("<div>").css('text-align','center').append(
                $("<h1>").text("NEKO!")).append(
                $("<a>").attr("href", neko.link).css("align","center").attr("target","_blank").append(
                  $("<img>").attr("src",neko.images.standard_resolution.url))));
          })
         .addClass("neko")
         .append($("<img>").attr("src", neko.images.low_resolution.url)));
        i++;
        i = i % nekos.length
      }, 2500);
    }
  });
})
