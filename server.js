#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
var parses  = require('./models.js')
var crypto = require('crypto');
var bodyParser = require('body-parser');
var spawn = require("child_process").spawn;

/**
 *  Define the sample application.
 */
var EquationSolverApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
        self.zcache['algebra.js'] = fs.readFileSync('./algebra.js');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };

        self.routes['/algebra.js'] = function(req, res) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            res.send(self.cache_get('algebra.js') );
        };

        self.routes['/parses'] = function(req, res) {    
            parses.getAllParses(req.params,function(err,docs){
                res.setHeader('Content-Type', 'application/json');
                if(!err){
                    res.send(docs);
                }else{
                    res.send(err);
                }
            }); 
        };

        self.routes['/parse/:parseId'] = function(req, res) {    
            var params = { 'parseId':req.params.parseId};
            parses.getParseById(params,function(err,docs){
                res.setHeader('Content-Type', 'application/json');
                if(!err){
                    res.send(docs);
                }else{
                    res.send(err);
                }
            }); 
        };


        self.routes['/parser/:parseId'] = function(req,res){
            res.setHeader('Content-Type', 'application/json');
            var python = spawn('python',["parser.py",self.ipaddress,self.port,req.params.parseId]);
            var output = "";
            python.stdout.on('data', function(data){ output += data });
            python.on('close', function(code){ 
               if (code !== 0) {  
                   return res.send(500, code); 
               }
               return res.send(200, JSON.parse(output));
             });
        }

        self.post_routes = { };

        self.post_routes['/saveStatement'] = function(req,res){       
            parses.storeSentence(req.body.data,function(err,docs){
                    if(!err){
                        res.send(docs);
                    }else{
                        res.send(err);
                    }
            });
        }

        self.post_routes['/getParse'] = function(req, res){
            res.header("Content-Type", "application/json; charset=utf-8");
            var dataArr = req.body.dataArr;
            if(!dataArr || dataArr.length == 0){
                return res.send(500);
            }else {
                parses.storeAndFetchSentences(dataArr,function(err,docs){
                    if(err){
                        return res.send(500,err);
                    }
                    return res.send(200,docs);
                });
            }
            
        }
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();
        self.app.use(bodyParser.json()); // support json encoded bodies
        self.app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }

        for (var r in self.post_routes) {
            self.app.post(r, self.post_routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new EquationSolverApp();
zapp.initialize();
zapp.start();

