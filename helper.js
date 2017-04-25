var dataPath =  __dirname+"/data/";
var phantomjs = require('phantomjs');
var phantomjsPath = phantomjs.path;

if(process.env.OPENSHIFT_DATA_DIR){
    dataPath = process.env.OPENSHIFT_DATA_DIR;
}

if (process.env.OPENSHIFT_NODEJS_IP) {
    phantomjsPath = "/var/lib/openshift/58e6fdc62d5271985600016d/app-root/runtime/repo/node_modules/phantomjs/lib/phantom/bin/phantomjs";
}

module.exports = {
	dataPath : dataPath,
	inputPath : dataPath+"input/",
	outputPath : dataPath+"output/",
	phantomjsPath: phantomjsPath
}

