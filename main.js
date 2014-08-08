// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Returns a handler which will open a new window when activated.
 */

 var fs, Path, sync;
setTimeout(function() {
  fs = window.MakeDrive.fs({
    manual: true
  });
  sync = fs.sync;
  Path = window.MakeDrive.Path;
  sync.connect("ws://localhost:9090");
  sync.on('connected', function() {
    console.log('server has connected');
  });
  sync.on('completed', function() {
    console.log('completed')
  });
  sync.on('error', function(e) {
    console.log(e);
  });
}, 1000);


function createTemplate(path) {

}

function getClickHandler() {
  return function(info, tab) {

    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var path = Path.join('/', Date.now() + Path.basename(info.srcUrl));
      fs.writeFile(path, new MakeDrive.Buffer(new Uint8Array(this.response)), function(err) {
        console.log(err);
        var template = "<!doctype html>\n"+
                        "<html>\n"+
                          "<head>\n"+
                            "<meta charset=\"utf-8\">\n"+
                            "<title>Your Incredible Webpage created on " + Date.now() + "</title>\n"+
                          "</head>\n"+
                          "<body style='background-color: rgb(243, 243, 243)'>\n"+
                            "<div style='padding: 45px; margin: 0 auto; width: 940px; text-align: center;'>\n"+
                              "<img src='"+ info.srcUrl +"' style='box-shadow: 5px 5px 5px rgba(136, 136, 136, 0.1); max-width: 500px;'/>\n"+
                              "<p style='border-top: 2px dotted #3fb58e; border-bottom: 2px dotted #3fb58e; padding: 30px; width: 50%; margin: 30px auto; font-family: sans-serif; font-weight: bold;'>Make something amazing with the web.</p>\n"+
                            "</div>\n"+
                          "</body>\n"+
                        "</html>\n";
        fs.writeFile(path + ".html", template, function(err) {
          console.log(err);
          sync.request();
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

