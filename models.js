var db = require("./db.js");
var parses = db.collection('parses');
var mongojs = require('mongojs');
var ObjectId = mongojs.ObjectId; 
var phantomjs = require('phantomjs')
var phantomjsPath = phantomjs.path;
if (process.env.OPENSHIFT_NODEJS_IP) {
    phantomjsPath = "/var/lib/openshift/58e6fdc62d5271985600016d/app-root/runtime/repo/node_modules/phantomjs/lib/phantom/bin/phantomjs";
}
var fs = require('fs');

var crypto = require('crypto');
var child_process = require("child_process");
module.exports = {
	getAllParses: function(sanitized_params, callback) {
        db.parses.find({}, function(err, docs) {
            callback(err,docs);
        });
    },
    getParseById: function(sanitized_params, callback) {
        db.parses.find({ parseId: sanitized_params.parseId}, function(err, docs) {
            callback(err,docs);
        });
    },
    getParseByIds: function(sanitized_params, callback) {
        db.parses.find({ parseId: { $in: sanitized_params.parseIds}}, function(err, docs) {
            callback(err,docs);
        });
    },
    storeIntoDB:function(data,res){
        console.log(phantomjsPath+" automated.js "+data );
        console.log(phantomjs.path);
        console.log(__dirname+"/automated.js")
        var parseId = crypto.createHash('md5').update(data,'utf-8').digest("hex");
        var phantom = child_process.exec(phantomjsPath+" "+__dirname+"/automated.js "+data , function (error, stdout, stderr) {
           if (error) {
             return res.send(500, 'Error'); 
           }
         });

         phantom.on('exit', function (code) {
           if(code == 0){
                fs.readFile(process.env.OPENSHIFT_DATA_DIR+'output.txt', 'utf8', function (err,stdout) {
                  if (err) {
                    return console.log(err);
                  }
                    var storeData = {
                       "parseId": parseId,
                        "parseText": stdout
                    };
                    db.parses.insert(storeData, function(err, result) {
                        if(err) { return res.send(500, err);  }
                        return res.send(200, result);
                    });
                });
                
           }else{
                return res.send(500, 'Error'); 
           }
         });
    }
}