var phantomjs = require('phantomjs');
var child_process = require('child_process');
var helper = require("./helper.js");
var fs = require('fs');
var phantomjsPath = helper.phantomjsPath;
var inputPath = helper.inputPath;
var outputPath = helper.outputPath;
var spawn = child_process.spawn;
var crypto = require('crypto');

module.exports = {
  fetchPosTag : function(data,callback){
            var parseId = crypto.createHash('md5').update(data,'utf-8').digest("hex");
            var python = spawn('python',["pos_tagger.py",parseId, data]);
            python.stdout.on('data', function(data){ console.log(data.toString('utf8')); });
            python.on('close', function(code){ 
               if (code !== 0) {  
                    callback(code,null) 
               }
               fs.readFile(outputPath+parseId+'-pos-tag.txt', 'utf8', function (err,stdout) {
                      if (err) {
                        console.log(err);
                        callback(err,null); 
                        return;
                      }
                      var storeData = {
                          "parseId": parseId,
                          "sentence": data,
                          "posTag":stdout
                      };
                      fs.unlink(outputPath+parseId+'-pos-tag.txt');
                      callback(null,storeData);
             });
             });
  }, 
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