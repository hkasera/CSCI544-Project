var phantomjs = require('phantomjs');
var child_process = require('child_process');
var helper = require("./helper.js");
var fs = require('fs');
var phantomjsPath = helper.phantomjsPath;
var inputPath = helper.inputPath;
var outputPath = helper.outputPath;

module.exports = { 
	fetchParseTree : function (parseId,callback) {
		var phantom = child_process.exec(phantomjsPath+" "+__dirname+"/automated.js "+parseId , function (error, stdout, stderr) {
            if (error) {
               	console.error(error);
                callback(error,null); 
                return;
            }
            console.log(stdout);
            console.log(stderr);
        });

        	phantom.on('exit', function (code) {
               if(code == 0){
                    fs.readFile(outputPath+parseId+'.txt', 'utf8', function (err,stdout) {
                      if (err) {
                        console.log(err);
                        callback(err,null); 
                        return;
                      }

                        var storeData = {
                           "parseId": parseId,
                            "parseText": stdout
                        };
                        fs.unlink(inputPath+parseId+'.txt');
                        fs.unlink(outputPath+parseId+'.txt');
                        callback(null,stdout);
                    });
                    
               }else{
                    callback(code,null);
               }
            });
	}
}