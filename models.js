var db = require("./db.js");
var fs = require('fs');
var crypto = require('crypto');
var parseTree = require("./fetchParseTree.js");
var mongojs = require('mongojs');
var phantomjs = require('phantomjs')
var helper = require("./helper.js");
var inputPath = helper.inputPath;
var parses = db.collection('parses');
var ObjectId = mongojs.ObjectId; 
var async = require('async');



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
    storeParse:function(storeData,callback){
        db.parses.insert(storeData, function(err, result) {
            callback(err,result);
        });
    },
    storeSentence:function(storeData,callback){
        db.sentences.insert(storeData, function(err, result) {
            callback(err,result);
        });
    },
    storePosTag:function(storeData,callback){
        db.posTag.insert(storeData, function(err, result) {
            callback(err,result);
        });
    },
    fetchAndStorePosTag:function(data,callback){
        parseTree.fetchPosTag(data,function(err,storeData){
            if(err){
                callback(err,null);
            }

            db.posTag.insert(storeData, function(err, result) {
                callback(err,result);
            });
        });
    },
    storeIntoDB:function(data,res){
        var parseId = crypto.createHash('md5').update(data,'utf-8').digest("hex");

        fs.writeFile(inputPath+parseId+'.txt', data, function(err) {
            if(err) {      
                return res.send(500, 'Error'); 
            }

            parseTree.fetchParseTree(parseId,function(error,tree){
                if(error){
                    return res.send(500, 'Error'); 
                }

                var storeData = {
                    "parseId": parseId,
                    "parseText": tree,
                    "sentence":data
                };

                module.exports.storeParse(storeData, function(err, result) {
                    if(err) { 
                        return res.send(500, err);  
                    }
                    return res.send(200, result);
                });

            });

        }); 
        
    }
}