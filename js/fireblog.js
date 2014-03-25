var fb = new Firebase('https://nancy.firebaseio.com/');
var auth = new FirebaseSimpleLogin(fb, function(error, user) {
  if (error) {
    console.log(error);
  } else if (user) {
    console.log('Logged in as User ID: ' + user.id + ', Provider: ' + user.provider);
    $(".showloggedin").show();
    $(".showloggedout").hide();
    $("#loginform").hide();

    $("#savedoc").attr("disabled", false);
    $("#savedoc").text("Save");

    $(document).ready(function() {
      updatewordcount();
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
          key = key.replace(/[^a-zA-Z]/g, '');
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
      styleuserdata = new Firebase('https://nancy.firebaseio.com/users/' + user.id);
      styleuserdata.on("value", function(data) {
        $("#styleselect").find(".styleoption-private").remove();
        $("head").find(".customstyles-private").remove();

        if(data.val() == null) {
          // new css template
          styleuserdata.push({
            title: "[CSS] Style Template", 
            html: "/* You can create your own styles by placing [CSS]   */\n/*   into the title. Try it, edit this doc and       */\n/*   click save. You should see an option in the     */\n/*   style dropdown in the header to apply your      */\n/*   own style to the editors.                       */\n.general {\n  /* anything that applies to all your editors       */\n}\n#markdown {\n  /* stuff that's specific for the markdown editor   */\n}\n#html {\n  /* stuff that's specific for the html editor       */\n}\n#wysiwyg {\n  /* stuff that's specific for the wysiwyg editor    */\n}\n\n/* you can also do specific styling for html         */\n/*   elements. Only used in the wysiwyg editor.      */\np {\n}\na {\n}\nh1 {\n}\nh2 {\n}",
            md: "/* You can create your own styles by placing [CSS]   */\n/*   into the title. Try it, edit this doc and       */\n/*   click save. You should see an option in the     */\n/*   style dropdown in the header to apply your      */\n/*   own style to the editors.                       */\n.general {\n  /* anything that applies to all your editors       */\n}\n#markdown {\n  /* stuff that's specific for the markdown editor   */\n}\n#html {\n  /* stuff that's specific for the html editor       */\n}\n#wysiwyg {\n  /* stuff that's specific for the wysiwyg editor    */\n}\n\n/* you can also do specific styling for html         */\n/*   elements. Only used in the wysiwyg editor.      */\np {\n}\na {\n}\nh1 {\n}\nh2 {\n}"
          })
        }
        else {
          $.each(data.val(), function(key, value) {
            key = key.replace(/[^a-zA-Z]/g, '');
            if (value.title.indexOf("[CSS]") != -1) { // IS CSS DEF FILE
              cssarr = value.md.split("}");
              cssnew = "";
              for (var i=0; i<cssarr.length-1; i++) { 
                cssnew += "." + key + " " + cssarr[i] + "}";
              }
              styleoption = $("<option class='styleoption styleoption-private' data-key='" + key + "' data-css='nothinghere' data-title='nothinghere'>" + value.title.replace("[CSS]", "[Private]") + "</option>")
              $("#styleselect").append(styleoption);
              $("<style class='customstyles customstyles-private' type='text/css'>" + cssnew + "</style>").appendTo("head");
            }
          })
        }
      });

      $("#styleselect").change(function() {
        stylekey = $("#styleselect option:selected").data("key")
        $(".editor-container").removeClass().addClass("editor-container row").addClass(stylekey);
      });

      // TITLE LIST
      userdata = new Firebase('https://nancy.firebaseio.com/users/' + user.id);
      userdata.on("value", function(data) {
        $("#titlelist").empty();

        newdoc = $("<li><a href='javascript:void(0)' id='newdoc'><i>New Doc</i></a></li>");
        $("#titlelist").append(newdoc);
        $("#titlelist").prepend("<li><hr></li>");
        newdoc.click(function() {
          clearEditor();
        })

        if(data.val() == null) {
          $("#titlelist").prepend("<li id='emptylistnotice'><a>Nothing here yet</a></li>");
        } else {
          window.d = data.val();
          $.each(data.val(), function(key, value) {
            $("#emptylistnotice").remove();
            if (value.title == "") {
              title = "No Title :(";
            } else {
              title = value.title; 
            }
            title = $("<a href='javascript:void(0);' class='titleselect' data-id='" + key + "'>" + title + "</a>")
            titleholder = $("<li></li>")
            titleholder.append(title);
            $("#titlelist").prepend(titleholder);
            title.click(function() {
              $("#html").val(value.html);
              $("#markdown").val(value.md);
              $("#wysiwyg").html(value.html);
              $("#title").val(value.title);
              $("#title").data("key", key);
              updatewordcount();
            });
          }); 
        }
      });

      document.addEventListener("keydown", function(e) {
        if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
          e.preventDefault();
          $("#savedoc").click();
        }
      }, false);

      $("#savedoc").click(function() {
        title = $("#title").val();
        doc = {title: title, html: $("#html").val(), md: $("#markdown").val()};
        $("#savedoc").html('Saving <i class="fa fa-spinner fa-spin"></i>');
        if($("#title").data("key") == "") { // new doc
          newkey = fb.child("users").child(user.id).push(doc, function() {
            setTimeout(function(){$("#savedoc").text("Save");},1000);
          });
          $("#title").data("key", newkey.name());
          fb.child("users").child(user.id).child(newkey.name()).child("modified").set(Firebase.ServerValue.TIMESTAMP);
          fb.child("users").child(user.id).child(newkey.name()).setPriority(Firebase.ServerValue.TIMESTAMP);
        } else { // old doc
          fb.child("users").child(user.id).child($("#title").data("key")).update(doc, function() {
            setTimeout(function(){$("#savedoc").text("Save");},1000);
          });
          fb.child("users").child(user.id).child($("#title").data("key")).child("modified").set(Firebase.ServerValue.TIMESTAMP);
          fb.child("users").child(user.id).child($("#title").data("key")).setPriority(Firebase.ServerValue.TIMESTAMP);
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
            
            $(".showloggedin").show();
            $(".showloggedout").hide();
            $("#signupform").hide();
          } else {
            console.log("Error: " + error);
          }
        });
      });
    })
  }
});

$(document).ready(function() {
  updatewordcount();
  $(".make-tooltip").tooltip();

  $("textarea").keydown(function(e) { checkTab(e); });


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
      updatewordcount();
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
  $("#markdown").keyup(function() {
    md2wys();
    wys2html();
    updatewordcount();
  });
  $("#html").keyup(function() {
    html2wys();
    wys2md();
    updatewordcount();
  });
  $(".wsy-bold").click(function() {
    wrapSelection("<strong>", "</strong>") 
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

});

function updatewordcount() {
  $("#wordcount").text(wordcount($("#wysiwyg")));
}

function wordcount(jq) {
  function get_text(el) {
    if(el != undefined) {
      ret = "";
      var length = el.childNodes.length;
      for(var i = 0; i < length; i++) {
          var node = el.childNodes[i];
          if(node.nodeType != 8) {
              ret += node.nodeType != 1 ? node.nodeValue : get_text(node);
          }
      }
      return ret;
    } else {
      return false;
    }
  }

  var words = get_text(jq[0]);
  if(words) {
    var count = words.split(/\s+/).length;
    return count-1;
  } else {
    return 0;
  }
}


// Set desired tab- defaults to four space softtab
// Set desired tab- defaults to four space softtab
var tab = "  ";
function checkTab(evt) {
  var t = evt.target;
  var ss = t.selectionStart;
  var se = t.selectionEnd;

  // Tab key - insert tab expansion
  if (evt.keyCode == 9) {
      evt.preventDefault();
             
      // Special case of multi line selection
      if (ss != se && t.value.slice(ss,se).indexOf("\n") != -1) {
          // In case selection was not of entire lines (e.g. selection begins in the middle of a line)
          // we ought to tab at the beginning as well as at the start of every following line.
          var pre = t.value.slice(0,ss);
          var sel = t.value.slice(ss,se).replace(/\n/g,"\n"+tab);
          var post = t.value.slice(se,t.value.length);
          t.value = pre.concat(tab).concat(sel).concat(post);
                 
          t.selectionStart = ss + tab.length;
          t.selectionEnd = se + tab.length;
      }
             
      // "Normal" case (no selection or selection on one line only)
      else {
          t.value = t.value.slice(0,ss).concat(tab).concat(t.value.slice(ss,t.value.length));
          if (ss == se) {
              t.selectionStart = t.selectionEnd = ss + tab.length;
          }
          else {
              t.selectionStart = ss + tab.length;
              t.selectionEnd = se + tab.length;
          }
      }
  }
         
  // Backspace key - delete preceding tab expansion, if exists
 else if (evt.keyCode==8 && t.value.slice(ss - 4,ss) == tab) {
      evt.preventDefault();
             
      t.value = t.value.slice(0,ss - 4).concat(t.value.slice(ss,t.value.length));
      t.selectionStart = t.selectionEnd = ss - tab.length;
  }
         
  // Delete key - delete following tab expansion, if exists
  else if (evt.keyCode==46 && t.value.slice(se,se + 4) == tab) {
      evt.preventDefault();
           
      t.value = t.value.slice(0,ss).concat(t.value.slice(ss + 4,t.value.length));
      t.selectionStart = t.selectionEnd = ss;
  }
  // Left/right arrow keys - move across the tab in one go
  else if (evt.keyCode == 37 && t.value.slice(ss - 4,ss) == tab) {
      evt.preventDefault();
      t.selectionStart = t.selectionEnd = ss - 4;
  }
  else if (evt.keyCode == 39 && t.value.slice(ss,ss + 4) == tab) {
      evt.preventDefault();
      t.selectionStart = t.selectionEnd = ss + 4;
  }
}

function clearEditor() {
  $("#title").val("");
  $("#title").data("key", "");
  $("#html").val("");
  $("#wysiwyg").html("");
  $("#markdown").val("");
  updatewordcount();
}

function wrapSelection(tag1, tag2) {
  document.execCommand("insertHTML", false, tag1 + document.getSelection()+ tag2);
}

function wrapCurrent() {
  $("#currentSelection").contents().unwrap()
  wrapSelection("<span id='currentSelection'>", "</span>")
}