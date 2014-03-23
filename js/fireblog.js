var fb = new Firebase('https://nancy.firebaseio.com/');
var auth = new FirebaseSimpleLogin(fb, function(error, user) {
  if (error) {
    console.log(error);
  } else if (user) {
    console.log('User ID: ' + user.id + ', Provider: ' + user.provider);
    $("#savedoc").attr("disabled", false);
    $("#savedoc").text("Save");
    $("#openfile").show();
    $("#deletedoc").show();

    $(document).ready(function() {
      $("#logoutlink").show();
      $("#loginlink").hide();
      $("#signuplink").hide();
      $("#loginform").hide();
      $("#signupform").hide();
      $("#logininfo").html("<a>You are logged in as: " + user.email + "</a>")
      $("#logininfo").show();
      $("#logoutlink").click(function() {
        auth.logout();
        location.reload();
      });

      userdata = new Firebase('https://nancy.firebaseio.com/users/' + user.id);
      userdata.on("value", function(data) {
        $("#titlelist").empty();
        if(data.val() == null) {
          $("#titlelist").append("<li id='emptylistnotice'><a>Nothing here yet</a></li>");
        }
        $.each(data.val(), function(key, value) {
          $("#emptylistnotice").remove();
          title = $("<a href='#' class='titleselect' data-id='" + key + "'>" + value.title + "</a>")
          titleholder = $("<li></li>")
          titleholder.append(title);
          $("#titlelist").append(titleholder);
          title.click(function() {
            $("#html").val(value.html);
            $("#markdown").val(value.md);
            $("#wysiwyg").html(value.html);
            $("#title").val(value.title);
            $("#title").data("key", key);
          });
        });
        $("#titlelist").append("<li><hr></li>");
        $("#titlelist").append("<li><a href='javascript:void(0)' id='newentry'><i>New Entry</i></a></li>");
      });

      $("#savedoc").click(function() {
        if($("#title").data("key") == "") {
          newkey = fb.child("users").child(user.id).push({title: $("#title").val(), html: $("#html").val(), md: $("#markdown").val()})
          $("#title").data("key", newkey.name());
        } else {
          fb.child("users").child(user.id).child($("#title").data("key")).update({title: $("#title").val(), html: $("#html").val(), md: $("#markdown").val()})
        }
      });
      $("#deletedoc").click(function() {
        if($("#title").data("key") == "") {
          clearEditor();
        } else {
          fb.child("users").child(user.id).child($("#title").data("key")).remove(function() {
            if(!error) {
              clearEditor();
            }
          });
        }
      });
    })
  } else {
    console.log("user logged out");
    $("#savedoc").attr("disabled", true);
    $("#savedoc").text("Log In to Save");
    $("#openfile").hide();
    $("#deletedoc").hide();
    
    $(document).ready(function() {
      $("#logoutlink").hide();
      $("#loginlink").show();
      $("#signuplink").show();

      $("#loginlink").click(function() {
        $("#loginform").toggle();
        $("#signupform").hide();
      });
      $("#signuplink").click(function() {
        $("#signupform").toggle();
        $("#loginform").hide();
      });

      $("#login-button").click(function() {
        // console.log($("#login-email").val(), $("#login-pw").val(), $("#login-remember").is(":checked"));
        auth.login('password', {
          email: $("#login-email").val(),
          password: $("#login-pw").val(),
          rememberMe: $("#login-remember").is(":checked")
        });
        // location.reload();
      });
      $("#signup-button").click(function() {
        auth.createUser($("#signup-email").val(), $("#signup-pw").val(), function(error, user) {
          if (!error) {
            console.log('Created New User Id: ' + user.id + ', Email: ' + user.email);
            auth.login('password', {
              email: $("#signup-email").val(),
              password: $("#signup-pw").val(),
              rememberMe: $("#signup-remember").is(":checked")
            });
          } else {
            console.log("Error: " + error);
          }
        });
      });
    })
  }
});

$(document).ready(function() {
  $("#mode-html").click(function() {
    $("#mode-nav").find("li").removeClass("active");
    $(this).closest("li").addClass("active");
    $("#wysiwyg").closest(".editor").hide();
    $("#markdown").closest(".editor").hide();
    $("#html").closest(".editor").show()
    $("#html").closest(".editor").removeClass("col-md-4").addClass("col-md-8 col-md-offset-2");
  });
  $("#mode-md").click(function() {
    $("#mode-nav").find("li").removeClass("active");
    $(this).closest("li").addClass("active");
    $("#wysiwyg").closest(".editor").hide();
    $("#markdown").closest(".editor").show();
    $("#html").closest(".editor").hide()
    $("#markdown").closest(".editor").removeClass("col-md-4").addClass("col-md-8 col-md-offset-2");
  });
  $("#mode-wys").click(function() {
    $("#mode-nav").find("li").removeClass("active");
    $(this).closest("li").addClass("active");
    $("#wysiwyg").closest(".editor").show();
    $("#markdown").closest(".editor").hide();
    $("#html").closest(".editor").hide()
    $("#wysiwyg").closest(".editor").removeClass("col-md-4").addClass("col-md-8 col-md-offset-2");
  });
  $("#mode-all").click(function() {
    $("#mode-nav").find("li").removeClass("active");
    $(this).closest("li").addClass("active");
    $("#wysiwyg").closest(".editor").show();
    $("#markdown").closest(".editor").show();
    $("#html").closest(".editor").show()
    $(".editor-container").find(".editor").removeClass("col-md-8 col-md-offset-2").addClass("col-md-4")
  });

  $("#wysiwyg-init").summernote({
    toolbar: [
      ['style', ['style']], // no style button
      ['style', ['bold', 'italic']],
      ['para', ['ul', 'ol']],
      ['insert', ['picture', 'video', 'link']], // no insert buttons
      //['table', ['table']], // no table button
      //['help', ['help']] //no help button
    ],
    id: "wysiwyg",
    height: 546,
    onkeyup: function(e) {
      wys2md();
      wys2html();
    },
    onkeydown: function(e) {
    },
    onenter: function(e) {
    },
    oninit: function(e) {
      $("#wysiwyg-init").next().find(".note-toolbar").find("button").mouseup(function() { 
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
    $("#wysiwyg").html(html);
  }
  function wys2html() {
    html = $("#wysiwyg").code();
    // html = html.replace(/&nbsp;/gi, ' ');
    $("#html").val(html);
  }
  function html2wys() {
    html = $("#html").val();
    $("#wysiwyg").html(html);
  }
  function wys2md() {
    h = $("#wysiwyg").html();
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

function clearEditor() {
  $("#title").val("");
  $("#title").data("key", "");
  $("#html").val("");
  $("#wysiwyg").html("");
  $("#markdown").val("");
}

function wrapSelection(tag1, tag2) {
  document.execCommand("insertHTML", false, tag1 + document.getSelection()+ tag2);
}

function wrapCurrent() {
  $("#currentSelection").contents().unwrap()
  wrapSelection("<span id='currentSelection'>", "</span>")
}