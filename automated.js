var pager = require('webpage').create();
var system = require('system');
var parseId = system.args.splice(1);
console.log(parseId);
var fs = require('fs');
var env = system.env;
if(!("OPENSHIFT_DATA_DIR" in env)){
    env["OPENSHIFT_DATA_DIR"] = fs.workingDirectory + "/data/";
}
var TEXT = fs.read(env["OPENSHIFT_DATA_DIR"]+"input/"+parseId+".txt");
console.log(TEXT);
phantom.exit();
pager.open('http://ltrc.iiit.ac.in/full_analyzer/hindi/index.cgi', function(status) {
    if (status !== 'success') {
        phantom.exit();
    } else {
        var value = pager.evaluate(function(TEXT) {
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
                var content = pager.evaluate(function() {
                    return document.getElementsByTagName('pre')[0].innerText;
                });
                try{
                    fs.write(env["OPENSHIFT_DATA_DIR"]+"output/"+parseId+".txt", content, 'w');
                }catch(e){
                    console.log(e);
                }
                console.log("Done")
                phantom.exit();

            }
        });
    }
};
