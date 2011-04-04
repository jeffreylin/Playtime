// NodeJS script to serve files and redirect requests to /db/ to couchDB

http = require('http');
url = require('url');
fs = require('fs');

// CONSTANTS
COUCHDB_HOST = 'localhost';
COUCHDB_PORT = 5984;
PORT = 3000;
HOST = '0.0.0.0';

// set command line settings
if(process.argv[2] == null){ 
	console.log('----------------------------------------');
	console.log('USAGE: node quicktest.js DIR_TO_SERVE');
	console.log('Will serve ./ by default');
	console.log('----------------------------------------');
};
var FILE_SERVER_PATH = process.argv[2] || '.';
console.log('Serving '+FILE_SERVER_PATH);

it = {};

// couchDB proxy handler
dbHandler = function(req,res){
	it.req = req;	//TEST
	it.resData = '';	//TEST
	console.log(req.headers);	//TEST
	console.log('handling db req');	//TEST
	var theURL = url.parse( req.url );
	var proxyReq = http.request({
		host: COUCHDB_HOST,
		port: COUCHDB_PORT,
		path: theURL.pathname,	//.slice(3),	// cut off the '/db' part - not very robust...
		method: req.method,
		headers: req.headers
	});
	
	// bind callbacks to couchDB response
	proxyReq.on('response', function(proxyRes){
		it.proxyRes = proxyRes;	//TEST
		res.writeHead(200 /*proxyRes.statusCode*/, proxyRes.headers);
		proxyRes.on('data', function(chunk){
			res.write(chunk, 'binary');
			it.resData += chunk;	//TEST
		});
		proxyRes.on('end', function(){
			res.end();
		});
	});
	
	// bind callbacks to data/close from client
	req.on('data', function(chunk){
		proxyReq.write(chunk, 'binary');
	});
	req.on('end', function(){
		proxyReq.end();
	});
};

contentTypes = [
	{ regex: /\.html$/, type: 'text/html' },
	{ regex: /\.js$/, type: 'application/javascript' },
	{ regex: /\.css$/, type: 'text/css' },
	{ regex: /\.(jpg|jpeg)$/, type: 'image/jpeg' },
	{ regex: /\.png$/, type: 'image/x-png' },
	{ regex: /\.gif$/, type: 'image/gif' }
];

// file server helper function
getContentType = function( filepath ){
	for(var i in contentTypes){
		if( contentTypes[i].regex.test(filepath) ){
			return contentTypes[i].type;
		}
	}
	return 'text/plain';	// default
};

// file server handler
serveDirHandler = function(req,res){
	var theURL = url.parse( req.url, true );
	var thePath = FILE_SERVER_PATH + theURL.pathname;
	console.log('opening file: '+thePath);
	fs.readFile( thePath, function(err,data){
		if(err){
			res.writeHead(400, err.message);
			res.end(err.message);
			return;
		}
		res.writeHead(200, {'Content-Type': getContentType(theURL.pathname)});
		res.end(data);
	});
};

// setup request handlers
requestHandlers = [
	{
		matcher: function( theURL ){
			return (/^\/db/).test( theURL.pathname );
		},
		execFn: function( req, res ){
			dbHandler(req,res);
		}
	},
	{
		matcher: function( theURL ){
			return true;
		},
		execFn: function( req, res ){
			serveDirHandler(req,res);
		}
	}
];

// start server
http.createServer(function(req,res){
	// handle request:
	var parsedURL = url.parse( req.url );
	for(var i in requestHandlers){
		if(requestHandlers[i].matcher( parsedURL )){
			requestHandlers[i].execFn(req,res);
			break;
		}
	}
}).listen( PORT, HOST );

// start a debugging console
require('repl').start();