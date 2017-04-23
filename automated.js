var pager = require('webpage').create();
var system = require('system');
var args = system.args.splice(1);
var fs = require('fs');
var path = 'output.txt';
var TEXT = args.join(" ");
var env = system.env;

pager.open('http://ltrc.iiit.ac.in/full_analyzer/hindi/index.cgi', function(status) {
    if (status !== 'success') {
        phantom.exit();
    } else {
        var value = pager.evaluate(function(TEXT) {
            console.log(TEXT);
            document.getElementsByTagName('textarea')[0].value = TEXT;
            document.getElementById("form1").submit.click();
            return document.getElementsByTagName('textarea')[0].value;
        }, TEXT);
    }
});

pager.onConsoleMessage = function(msg) {
    console.log(msg);
};

pager.onLoadFinished = function() {
    if (pager.url == 'http://ltrc.iiit.ac.in/full_analyzer/hindi/run.cgi') {
        pager.open('http://ltrc.iiit.ac.in/full_analyzer/hindi/out.txt', function(status) {
            if (status !== 'success') {
                phantom.exit();
            } else {
                var content = pager.evaluate(function(path) {
                    return document.getElementsByTagName('pre')[0].innerText;
                }, path);
                try{
                    fs.write(env["OPENSHIFT_DATA_DIR"]+"output.txt", content, 'w');
                }catch(e){
                    console.log(e);
                }
                console.log("Done")
                phantom.exit();

            }
        });
    }
};