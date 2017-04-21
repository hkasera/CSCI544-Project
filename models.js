var db = require("./db.js");
var parses = db.collection('parses');
var mongojs = require('mongojs');
var ObjectId = mongojs.ObjectId; 
var phantomjs = require('phantomjs')
var phantomjsPath = phantomjs.path
if (process.env.OPENSHIFT_NODEJS_IP) {
    phantomjsPath = "/var/lib/openshift/58e6fdc62d5271985600016d/app-root/runtime/repo/node_modules/phantomjs/lib/phantom/bin/phantomjs";
}

var crypto = require('crypto');
var spawn = require("child_process").spawn;
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
        console.log(phantomjsPath);
        console.log(data);
        var phantom = spawn(phantomjsPath,["automated.js",data]);
        var output = "";
        var parseId = crypto.createHash('md5').update(data,'utf-8').digest("hex");
        phantom.stdout.setEncoding('utf8');
        phantom.stdout.on('data', function(rdata){
            console.log(rdata.toString()); 
            output += rdata 
        });
        console.log(output); 
        phantom.on('close', function(code){ 
            if (code !== 0) {  
                return res.send(500, code); 
            }
            var storeData = {
                "parseId": parseId,
                "parseText": output
              };
            db.parses.insert(storeData, function(err, result) {
                if(err) { return res.send(500, err);  }
                return res.send(200, result);
            });
            
        });
    }
}