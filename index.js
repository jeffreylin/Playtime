$(function(){
	$('#dropTarget').bind('dragenter', {}, false);
	$('#dropTarget').bind('dragover', {}, false);
	$('#dropTarget').bind('drop', {}, function(e){
		e.stopPropagation();
		e.preventDefault();
		var dt = e.originalEvent.dataTransfer;
		var files = dt.files;
		it = files;
		for (var i=0; i<files.length; i++){
			console.log('starting file upload');
			new FileUpload( files[i] );
		}
	});
});

function FileUpload( file ){
	var reader = new FileReader();
	var xhr = new XMLHttpRequest();
	this.xhr = xhr;
	
	/* start progress update code */
	var self = this;
	this.xhr.upload.addEventListener('progress', function(e){
		if( e.lengthComputable ){
			var percentage = Math.round((e.loaded*100)/e.total);
			console.log(''+percentage+'% uploaded');
		}
	}, false);
	
	xhr.upload.addEventListener('load', function(e){
		console.log('100% uploaded');
	}, false);
	/* end progres update code */
	
		// TO-DO: SANITIZE THIS INPUT
	console.log('starting post request'); //remove later
	xhr.open('POST', 'http://localhost:3000/upload?'+file.fileName);
	xhr.overrideMimeType('text/plain; charset=x-user-definied-binary');
	reader.onload = function(evt){
		xhr.sendAsBinary(evt.target.result);
	};
	reader.readAsBinaryString(file);
}