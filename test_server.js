var _ = require('underscore');
var Server = require('./Server');

// TODO collections proof-of-concept - POST, PUT, DELETE
// TODO make status man do conneg
// TODO producers of app/json should respond to requests for app/blah+json
// TODO get a specific mediatype in there
// TODO don't use in/out for mediatype handlers
// == low priority ==
// TODO better error output when there's an error in mediaTypes, resources, etc.
// TODO how to put content-type in links
// TODO form post for create
// TODO better errors when you try to getUrl an unknown route
// TODO better way to see all routes


var server = new Server(8080);
server.onRequest(function(handler, context, cb){
  console.log(' <-- ', context.req.method, ' ', context.req.url);
  cb(null, context);
});

var resourceDir = __dirname + '/test/test_fixtures/resources';
server.staticRoute(__dirname + '/test/test_fixtures/static', function(){
  console.log("statically routed!");
});
server.routeDirectory(resourceDir, function(err){
  console.log("routed resources in " + resourceDir);

  server.route('/inside', 
                      { GET : function($){ 
                                console.log("hideyho");
                                $.res.end("muahahah!"); 
                              }
                      }).as('inside');

  if (err) {
    console.log("Routing error");
    console.log(err);
    return;
  }
  server.listen(function(err){
    if (err) {console.log(err);throw err;}
    console.log('Server running on ' + server.port);
  });
});
