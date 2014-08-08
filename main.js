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
                            "<title>Your Incredible Webpage created on Fri, 8 Aug, 2014 6:19 PM</title>\n"+
                          "</head>\n"+
                          "<body>\n"+
                            "<img src='"+ info.srcUrl +"'/>\n"+
                            "<p>Make something amazing with the web</p>\n"+
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

