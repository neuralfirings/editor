var fb = new Firebase('https://nancy.firebaseio.com/');
// var marked = require('marked');
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

$(document).ready(function() {

  function md2wys() {
    html = marked($("#markdown").val());
    $("#wysiwyg").html(html);
  }
  function wys2html() {
    html = $("#wysiwyg").html();
    $("#html").val(html);
  }
  function html2wys() {
    html = $("#html").val();
    $("#wysiwyg").html(html);
  }
  function wys2md() {
    md = toMarkdown($("#wysiwyg").html());
    $("#markdown").val(md);
  }

  $("#markdown").keyup(function() {
    md2wys();
    wys2html();
  });
  $("#wysiwyg").keyup(function() {
    wys2md();
    wys2html();
  });
  $("#html").keyup(function() {
    html2wys();
    wys2md();
  });

  // $("#tohtml").click(function() {
  //   html = marked($("#markdown").val());
  //   $("#wysiwyg").html(html);
  //   wys2html();
  // });

  // $("#tohtml2").click(function() {
  //   html = $("#actualhtml").val();
  //   $("#wysiwyg").html(html);
  // });

  // $("#tomarkdown").click(function() {
  //   md = toMarkdown($("#wysiwyg").html());
  //   $("#markdown").val(md);
  // });

  // $("#wysiwyg").keypress(function() {
  //   updateActualHTML();
  // });



  $('#input').change(function(){
    fb.push($('input').val());
    $(this).val("");
  });
  fb.on('child_added', function(snapshot) {
    $('.output').html($('.output').html() + '<hr>' + snapshot.val());
  });
  $(".editable").keypress(function() {
    $(".showeditablehtml").text($(".editable").html());
  });

  $(".markit").click(function() {
    $(".editable").each(function() {
      $(".test1").text($(this).html());
      html = "";
      $(this).find("div").each(function() {
        html += $(this).html() + "\n";
      });
      html = html.replace(/<br\s*[\/]?>/gi, "\n");
      $('.test2').text(html);
      // $(this).html(marked(html));
      // html = $(this).html().replace(/<br\s*[\/]?>/gi, "\n");
      // html = htmlDecode(html); //$(this).html().replace("&gt;", ">");
      // console.log("pre", html);
      // // html.replace(regex, "\n");
      md = marked(html)
      // md = md.replace(/\n/g, "<br />");
      md = "<div>" + md + "</div>"
      // mdiv.append(md);
      $('.test3').text(md);
      // md = md.replace(/\n/g, "<br />");
      // // console.log(md);
      // // md.find("p").each(function() {
      // //   $(this).parent.html($(this).html());
      // // });
      $(this).html(md)
    }); 
  });
});

function htmlDecode(input){
  var e = document.createElement('div');
  e.innerHTML = input;
  return e.childNodes[0].nodeValue;
}