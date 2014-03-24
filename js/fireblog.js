var fb = new Firebase('https://nancy.firebaseio.com/');
var auth = new FirebaseSimpleLogin(fb, function(error, user) {
  if (error) {
    console.log(error);
  } else if (user) {
    console.log('User ID: ' + user.id + ', Provider: ' + user.provider);
    $("#savedoc").attr("disabled", false);
    $("#savedoc").text("Save");
    // $("#openfile").show();
    // $("#deletedoc").show();

    $(document).ready(function() {
      $(".showloggedin").show();
      $(".showloggedout").hide();
      $("#logininfo").html("<a>You are logged in as: " + user.email + "</a>");
      $("#logoutlink").click(function() {
        auth.logout();
        location.reload();
      });

      styledata = new Firebase('https://nancy.firebaseio.com/styles/public');
      styledata.on("value", function(data) {
        $("#styleselect").find(".styleoption").remove();
        $("head").find(".customstyles").remove();
        $.each(data.val(), function(key, value) {
          cssarr = value.css.split("}");
          cssnew = "";
          for (var i=0; i<cssarr.length-1; i++) { 
            cssnew += "." + key + " " + cssarr[i] + "}";
          }
          styleoption = $("<option class='styleoption' data-key='" + key + "' data-css='nothinghere' data-title='nothinghere'>" + value.title + "</option>")
          $("#styleselect").append(styleoption);
          $("<style class='customstyles' type='text/css'>" + cssnew + "</style>").appendTo("head");
        })
      });

      $("#styleselect").change(function() {
        stylekey = $("#styleselect option:selected").data("key")
        $(".editor-container").removeClass().addClass("editor-container row").addClass(stylekey);
      });

      userdata = new Firebase('https://nancy.firebaseio.com/users/' + user.id);
      userdata.on("value", function(data) {
        $("#titlelist").empty();
        if(data.val() == null) {
          $("#titlelist").append("<li id='emptylistnotice'><a>Nothing here yet</a></li>");
        } else {
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
        }
        $("#titlelist").append("<li><hr></li>");
        newentry = $("<li><a href='javascript:void(0)' id='newentry'><i>New Entry</i></a></li>");
        $("#titlelist").append(newentry);
        newentry.click(function() {
          clearEditor();
        })
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
    // $("#openfile").hide();
    // $("#deletedoc").hide();
    
    $(document).ready(function() {
      $(".showloggedout").show();
      $(".showloggedin").hide();

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
    $("#html").closest(".editor").show();
    $("#html").removeClass("squished");
    // $("#html").closest(".editor").removeClass("col-md-4").addClass("col-md-8 col-md-offset-2");
  });
  $("#mode-md").click(function() {
    $("#mode-nav").find("li").removeClass("active");
    $(this).closest("li").addClass("active");
    $("#wysiwyg").closest(".editor").hide();
    $("#markdown").closest(".editor").show();
    $("#html").closest(".editor").hide();
    $("#markdown").removeClass("squished");
    // $("#markdown").closest(".editor").removeClass("col-md-4").addClass("col-md-8 col-md-offset-2");
  });
  $("#mode-wys").click(function() {
    $("#mode-nav").find("li").removeClass("active");
    $(this).closest("li").addClass("active");
    $("#wysiwyg").closest(".editor").show();
    $("#markdown").closest(".editor").hide();
    $("#html").closest(".editor").hide();
    $("#wysiwyg").removeClass("squished");
    // $("#wysiwyg").closest(".editor").removeClass("col-md-4").addClass("col-md-8 col-md-offset-2");
  });
  $("#mode-all").click(function() {
    $("#mode-nav").find("li").removeClass("active");
    $(this).closest("li").addClass("active");
    $("#wysiwyg").closest(".editor").show();
    $("#markdown").closest(".editor").show();
    $("#html").closest(".editor").show();
    $("#wysiwyg").addClass("squished");
    $("#html").addClass("squished");
    $("#markdown").addClass("squished");
    // $(".editor-container").find(".editor").removeClass("col-md-8 col-md-offset-2").addClass("col-md-4")
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
    addid: "wysiwyg",
    addclass: "general squished",
    addcontainerclass: "general",
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