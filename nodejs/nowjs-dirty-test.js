// questions: how do you make an async request sync?

var http = require('http');
var dirtyLib = require('dirty');
var nowLib = require('now');
var connect = require('connect');
var uuid = require('node-uuid');

function g(){}

// Initialize DB
db = new dirtyLib('test.db');
db.on('load', function(){
	startServer();
});

// Start HTTP Server
function startServer(){
	// serve static files
	httpServer = connect.createServer( connect.static('.') );
	httpServer.listen(3000);
	
	// start nowJS server-side requirements
	everyone = nowLib.initialize(httpServer);
	everyone.now.dirtySync = function( method, modelJSON, isSuccessfulCB ){
		console.log( modelJSON );
		isSuccessfulCB( false );
	};
	function dirtySyncRead(){ return true; };

	everyone.now.getUUID = function _getUUID(cb){
		var theUUID = uuid();
		if( db.get(theUUID) != undefined ){
			_getUUID(cb);
		}
		else{
			//db.set(theUUID, '');
			cb( theUUID );
		}
	};
	
	everyone.now.dbGet = function(uuid, cb){
		cb = cb || function(){};
		cb( db.get(uuid) );
	};
	
	// does an update by removing and then adding the row again
	everyone.now.dbSet = function(model, cb){	//really should be named set model
		//val prevModel = db.get(model.id);
		cb = cb || function(){};
		db.rm(model.id);
		cb( db.set(model.id, model) );
	};
	
	everyone.now.dbRM = function(uuid, cb){
		cb = cb || function(){};
		cb( db.rm(uuid) );
	}
	
	// some test functions to learn from:
	everyone.now.t = function(cb){
		cb( uuid() );
	};
	everyone.now.tt = function(data, cb){
		cb( data );
	};
	everyone.now.ttt = function(cb){
		cb( this.now.auth );
	};
	everyone.now.tttt = function(){
		console.log( this.now.auth );
	};
}

// Start debugging REPL
require('repl').start();