// [failed] script to recieve file uploads to /upload and serve other files to /

formidable = require('formidable')
http = require('http')
sys = require('sys');
repl = require('repl');
  
http.createServer(function(req, res) {
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
    // parse a file upload
    var form = new formidable.IncomingForm();
	form.on('file', function(filename, theFile){
		console.log('New file: '+filename);
		console.log(theFile);
	});
    form.parse(req, function(fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      res.end(sys.inspect({fields: fields, files: files}));
    });
    return;
  }

  // show a file upload form
  res.writeHead(200, {'content-type': 'text/html'});
  res.end
    ( '<form action="/upload" enctype="multipart/form-data" method="post">'
    + '<input type="text" name="title"><br>'
    + '<input type="file" name="upload" multiple="multiple"><br>'
    + '<input type="submit" value="Upload">'
    + '</form>'
    );
}).listen(3000, '0.0.0.0');

repl.start();