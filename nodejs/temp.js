http = require('http');

http.get({ host: 'localhost', port: '5984', path: '/db/' }, function(res){
	res.on('data', function(data){
		console.log('Got data: ' + data);
	});
	it = res;
});
	
require('repl').start();