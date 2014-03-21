var fb = new Firebase('https://nancy.firebaseio.com/');
// var marked = require('marked');
// marked.setOptions({
//   renderer: new marked.Renderer(),
//   gfm: true,
//   tables: true,
//   breaks: false,
//   pedantic: false,
//   sanitize: true,
//   smartLists: true,
//   smartypants: false
// });

$(document).ready(function() {
  $("#wysiwyg").summernote({
    toolbar: [
      ['style', ['style']], // no style button
      ['style', ['bold', 'italic']],
      ['para', ['ul', 'ol']],
      ['insert', ['picture', 'video', 'link']], // no insert buttons
      //['table', ['table']], // no table button
      //['help', ['help']] //no help button
    ],
    height: 546,
    onkeyup: function(e) {
      wys2md();
      wys2html();
    }, 
    oninit: function(e) {
      $("#wysiwyg").next().find(".note-toolbar").find("button").mouseup(function() { 
        wys2md();
        wys2html();
      })
    },
    ontoolbarclick: function(e) {
      wys2md();
      wys2html();
    }
  });


  function md2wys() {
    html = marked($("#markdown").val());
    $("#wysiwyg").next().find(".note-editable").html(html);
  }
  function wys2html() {
    html = $("#wysiwyg").next().find(".note-editable").html();
    html = html.replace(/&nbsp;/gi, ' ');
    $("#html").val(html);
  }
  function html2wys() {
    html = $("#html").val();
    $("#wysiwyg").next().find(".note-editable").html(html);
  }
  function wys2md() {
    // wys = $("#wysiwyg");
    // wys.find('div').contents().unwrap().wrap('<p/>');
    h = $("#wysiwyg").next().find(".note-editable").html();
    h = h.replace(/<div/gi, '<p');
    h = h.replace(/<\/div>/gi, '</p>');
    h = h.replace(/&nbsp;/gi, ' ');
    m = toMarkdown(h);
    $("#markdown").val(m);
  }


  $("#markdown").keyup(function() {
    md2wys();
    wys2html();
  });
  $("#html").keyup(function() {
    html2wys();
    wys2md();
  });


  $(".wsy-bold").click(function() {
    wrapSelection("<strong>", "</strong>") 
  });

});


function wrapSelection(tag1, tag2) {
  document.execCommand("insertHTML", false, tag1 + document.getSelection()+ tag2);
}

function wrapCurrent() {
  $("#currentSelection").contents().unwrap()
  wrapSelection("<span id='currentSelection'>", "</span>")
}