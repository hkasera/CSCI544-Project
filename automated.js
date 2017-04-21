var pager = require('webpage').create();
var system = require('system');
var args = system.args;
args = args.splice(1)


var TEXT = args.join(" ");

console.log(TEXT);
phantom.exit();

pager.open('http://ltrc.iiit.ac.in/full_analyzer/hindi/index.cgi', function(status) {
  if (status !== 'success') {
    //console.log('Unable to access network');
  } else {
  	pager.render('screen.png');
    //var TEXT = "नदी के दाहिने किनारे पर 8 पेड़ हैं।";
    var value = pager.evaluate(function(TEXT) {
        console.log(TEXT);
    		document.getElementsByTagName('textarea')[0].value = TEXT;
      	document.getElementById("form1").submit.click();
        return document.getElementsByTagName('textarea')[0].value;
    },TEXT);
    console.log(value);
    //phantom.exit();
  }
  //phantom.exit();
});

pager.onConsoleMessage = function(msg) {
    console.log(msg);
};

pager.onLoadFinished = function(){
    pager.render("nextPage.png");
    console.log('Content: ' + pager.url);

    if(pager.url == 'http://ltrc.iiit.ac.in/full_analyzer/hindi/run.cgi'){
        pager.open('http://ltrc.iiit.ac.in/full_analyzer/hindi/out.txt', function(status) {
        if (status !== 'success') {
          console.log('Unable to access network');
        } else {
          var content = pager.evaluate(function() {
            return document.getElementsByTagName('pre')[0].innerText;
          });
          console.log(content);
          phantom.exit();
          
        }
    });
  }
};

pager.onNavigationRequested = function(url, type, willNavigate, main) {
  //console.log('Trying to navigate to: ' + url);
  //console.log('Caused by: ' + type);
  //console.log('Will actually navigate: ' + willNavigate);
  //console.log('Sent from the page\'s main frame: ' + main);

}