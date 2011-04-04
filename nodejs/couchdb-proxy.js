// proxy server for couchDB port (but really general purpose)

net = require('net');
//util = require('util');

theServer = net.createServer(function(sock){
	var proxyTarget = net.createConnection(5984);

	sock.on('error', function(err){
		console.log(err);
	});
	proxyTarget.on('error', function(err){
		console.log(err);
		sock.end();
		proxyTarget.end();
	});

	var sockCB = function(data){
		proxyTarget.write(data);
	};
	sock.on('data', sockCB);
	var proxyTargetCB = function(data){
		sock.write(data);
	};
	proxyTarget.on('data', proxyTargetCB);
	
	sock.on('end', function(){
		proxyTarget.removeListener('data', proxyTargetCB);
		proxyTarget.end();
	});
	proxyTarget.on('end', function(){
		sock.removeListener('data', sockCB);
		sock.end();
	});

	//util.pump( proxyTarget, sock )
	//util.pump( sock, proxyTarget )
}).listen(3000, '0.0.0.0');

require('repl').start();
