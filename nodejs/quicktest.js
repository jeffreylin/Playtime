http = require('http');
repl = require('repl');
fs = require('fs');
url = require('url');

//##########
// CONFIG
//##########

if(process.argv[2] == null){ 
	console.log('----------------------------------------');
	console.log('USAGE: node quicktest.js DIR_TO_SERVE');
	console.log('Will serve ./ by default');
	console.log('----------------------------------------');
};
var FILE_SERVER_PATH = process.argv[2] || '.';
global.FILE_SERVER_PATH = FILE_SERVER_PATH;
console.log('Serving '+FILE_SERVER_PATH);

// for debugging
Capturer = function(){
	this.val = {};
	this.appendVal = function(v){this.val += v;}
	this.setVal = function(v){this.val = v;}
	this.getVal = function(){return this.val;}
};
it = new Capturer();

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

getContentType = function( filepath ){
	if( (/\.html$/).test(filepath) ){
		return 'text/html';
	} else if( (/\.js$/).test(filepath) ){
		return 'application/javascript';
	} else if( (/\.css$/).test(filepath) ){
		return 'text/css';
	} else{	//default
		return 'text/plaisn';
	}
};

uploadFileHandler = function(req, res){
	console.log('Got data:');
	it.setVal('');
	var theFile = fs.openSync('test.png', 'w');
	console.log(theFile);
	req.addListener('data', function(chunk){
		console.log(theFile);
		//console.log(chunk);
		it.appendVal(chunk);
		fs.writeSync(theFile, chunk, 0, chunk.length, null);
	});
	req.addListener('end', function(){
		fs.close(theFile);
	});
};

requestHandlers = [
	{
		matcher: function( theURL ){
			return (/^\/upload/).test( theURL.pathname );
		},
		execFn: function( req, res ){
			uploadFileHandler(req,res);
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

http.createServer(function(req,res){
	// log request
	it.setVal(req);
	////console.log(req);
	
	// handle request
	var parsedURL = url.parse( req.url );
	for(var i in requestHandlers){
		if(requestHandlers[i].matcher( parsedURL )){
			requestHandlers[i].execFn(req,res);
			break;
		}
	}
	
	////res.writeHeader({'Content-Type':'text/plain'});
	////res.end('yay??');
}).listen(3000, '0.0.0.0');

// for debugging
repl.start();
