http = require('http');
repl = require('repl');
fs = require('fs')
url = require('url')

//##########
// CONFIG
//##########

var FILE_SERVER_PATH = '.';

// for debugging
Capturer = function(){
	this.val = {};
	this.setVal = function(v){this.val = v;}
	this.getVal = function(){return this.val;}
}
it = new Capturer();

serveDirHandler = function(req,res){
	var theURL = url.parse( req.url, true );
	var thePath = '.' + theURL.pathname;
	console.log('opening file: '+thePath);
	fs.readFile( thePath, function(err,data){
		if(err){
			res.writeHead(400, err.message);
			res.end(err.message);
			return;
		}
		res.writeHeader( getContentType( theURL.pathName ) );
		res.end(data);
	});
};

getContentType = function( filepath ){
	if( (/\.html$/).test(filepath) ){
		return 'text/html';
	} else if( (/\.js$/).test(filepath) ){
		return 'application/javascript';
	} else if( (/\.css$/).test(filepath) ){
		return 'test/css';
	} else{	//default
		return 'text/plain';
	}
}

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
