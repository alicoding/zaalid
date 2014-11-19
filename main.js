// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Returns a handler which will open a new window when activated.
 */
var fs, Path, sync, sh;
setTimeout(function() {
  fs = window.MakeDrive.fs({
    manual: true
  });
  sh = fs.Shell();
  sync = fs.sync;
  Path = window.MakeDrive.Path;
  function getRandomToken() {
      // E.g. 8 * 32 = 256 bits token
      var randomPool = new Uint8Array(32);
      crypto.getRandomValues(randomPool);
      var hex = '';
      for (var i = 0; i < randomPool.length; ++i) {
          hex += randomPool[i].toString(16);
      }
      // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
      return hex;
  }

  chrome.storage.sync.get('userid', function(items) {
    var userid = items.userid;
    if (userid) {
      useToken(userid);
    } else {
      userid = getRandomToken();
      chrome.storage.sync.set({userid: userid}, function() {
        useToken(userid);
      });
    }
    function useToken(userid) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function() {
        sync.connect("ws://localhost:9090", this.response.replace(/"/g, ""));
        sync.on('connected', function() {
          console.log('server has connected');
        });
        sync.on('completed', function() {
          console.log('completed')
        });
        sync.on('error', function(e) {
          if(e.code && e.message) {
              e = 'Error code: ' + e.code + ' - ' + e.message;
            } else if(e.stack) {
              e = e.stack;
            } else if(e.data) {
              e = e.data;
            } else if(e.error) {
              e = e.error;
            }
          console.log(e);
        });
      }
      xhr.open("GET", "http://localhost:9090/api/sync/");
      xhr.responseType = "string";
      xhr.send();
    }
  });

}, 1000);


function getClickHandler() {
  return function(info, tab) {

    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var that = this;
      var promptPath = prompt();

      var path = promptPath !== null ? Path.join('/', promptPath) : Path.join('/', Math.random()+"");
      var ext = Path.extname(info.srcUrl) || ".png";
      var imagePath = Path.join(path, "image" + ext);
      sh.mkdirp(path, function(err) {
        fs.writeFile(imagePath, new MakeDrive.Buffer(new Uint8Array(that.response)), function(err) {
          var template = "<!doctype html>\n"+
                          "<html>\n"+
                            "<head>\n"+
                              "<meta charset=\"utf-8\">\n"+
                              "<title>Your Incredible Webpage created on " + Date.now() + "</title>\n"+
                            "</head>\n"+
                            "<body style='background-color: rgb(243, 243, 243)'>\n"+
                              "<div style='padding: 45px; margin: 0 auto; width: 940px; text-align: center;'>\n"+
                                "<img src='/p"+ imagePath +"' style='box-shadow: 5px 5px 5px rgba(136, 136, 136, 0.1); max-width: 500px;'/>\n"+
                                "<p style='border-top: 2px dotted #3fb58e; border-bottom: 2px dotted #3fb58e; padding: 30px; width: 50%; margin: 30px auto; font-family: sans-serif; font-weight: bold;'>Make something amazing with the web.</p>\n"+
                              "</div>\n"+
                            "</body>\n"+
                          "</html>\n";
          fs.writeFile(Path.join(path, "template.html"), template, function(err) {
            sync.request();
          });
        });
      });
    }
    xhr.open("GET", info.srcUrl);
    xhr.responseType = "arraybuffer";
    xhr.send();
  };
};

/**
 * Create a context menu which will only show up for images.
 */
chrome.contextMenus.create({
  "title" : "Add image to MakeDrive",
  "type" : "normal",
  "contexts" : ["image"],
  "onclick" : getClickHandler()
});
