var dataPath =  __dirname+"/data/";
var phantomjs = require('phantomjs');
var phantomjsPath = phantomjs.path;

if(process.env.OPENSHIFT_DATA_DIR){
    dataPath = process.env.OPENSHIFT_DATA_DIR;
}

module.exports = {
	dataPath : dataPath,
	inputPath : dataPath+"input/",
	outputPath : dataPath+"output/",
	phantomjsPath: phantomjsPath
}

