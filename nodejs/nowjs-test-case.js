// nowJS test case for NodeJS

// start http server
http = require('http');
httpServer = http.createServer(function(req,res){
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end('<html><head><script src="nowjs/now.js"></script></head></html>');
});
httpServer.listen(3000);

// setup nowJS
everyone = require('now').initialize( httpServer );
everyone.now.test = function( cb1, cb2 ){
	cb1();
	cb2();
}

// start console for debugging
require('repl').start();

// ###Run this client side in JS console:###
// now.test( function(){console.log('a');}, function(){console.log('b');} )
// Expected output:
// a
// b
//
// Actual output:
// b
// b
//