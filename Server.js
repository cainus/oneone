var Router = require('detour').Router;
var http = require('http');
var https = require('https');
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');
var fs = require('fs');

/*

public interface?
.route()
.routeDirectory()
.onRequest()
.listen()
.close()

*/

Server = function(options){
  options = options || {};
  this.handlers = {
    404 : function($){ $.res.statusCode = 404;  $.res.end(); },
    405 : function($){ $.res.statusCode = 405;  $.res.end(); },
    414 : function($){ $.res.statusCode = 414;  $.res.end(); },
    500 : function($, err){ $.res.statusCode = 500;
                            console.log(err);
                            $.res.end(); },
    501 : function($){ $.res.statusCode = 501;  $.res.end(); },
    OPTIONS : function(resource){
                var methods = getMethods(resource);
                resource.OPTIONS = function($){
                  $.res.setHeader( 'Allow', methods.join(","));
                  $.res.writeHead(200);
                  $.res.end();
                };
                return resource;
              }
  };
  this.server = null;
  this.options = options;
  this.options.port = this.options.port || 3000;
  this.options.protocol = this.options.protocol || 'http';
  this.options.resourcePath = this.options.resourcePath || '/';
  this.port = this.options.port;
  this.protocol = this.options.protocol;
  this.resourcePath = this.options.resourcePath;
  this.router = new Router(this.resourcePath);
  var router = this.router;
  var protocol = this.protocol;
  var that = this;
  this.onRequestHandler = function(handler, context, cb){
    cb(context);  // do nothing with it by default
  };
  router.onRequest = function(handler, context, cb){
    context.app = that.options;
    context.router = router;
    var req = context.req;
    var res = context.res;
    that.onRequestHandler(handler, context, function(context){
      cb(null, context);
    });
  };
  router.setResourceDecorator(function(resource){
    // set the OPTIONS method at route-time, so the router won't 405 it.
    resource = that.handlers.OPTIONS(resource);
    return resource;
  });
  router.on404(function($){
    that.handlers['404']($);
  });
  router.on414(function($){
    that.handlers['414']($);
  });
  router.on500(function($, err){
    that.handlers['500']($, err);
  });
  router.on501(function($){
    that.handlers['501']($);
  });
  router.on405(function($){
    that.handlers['405']($);
  });
};

Server.prototype = Object.create(EventEmitter.prototype);

Server.prototype.route = function(path, handler){
  return this.router.route(path, handler);
};

Server.prototype.onRequest = function(handler){
  this.onRequestHandler = handler;
};

// run the directory router and call the callback afterward
Server.prototype.routeDirectory = function(directory, cb){
  this.router.routeDirectory(directory, cb);
};

Server.prototype.on404 = function(handler){
  // the handler should be a function that takes a context
  this.handlers['404'] = handler;
};
Server.prototype.on405 = function(handler){
  // the handler should be a function that takes a context
  this.handlers['405'] = handler;
};
Server.prototype.on500 = function(handler){
  // the handler should be a function that takes a context
  this.handlers['500'] = handler;
};
Server.prototype.on501 = function(handler){
  // the handler should be a function that takes a context
  this.handlers['501'] = handler;
};
Server.prototype.on414 = function(handler){
  // the handler should be a function that takes a context
  this.handlers['414'] = handler;
};
Server.prototype.onOPTIONS = function(handler){
  // the handler should be a function that takes a resource
  // this should be called BEFORE routing.
  this.handlers.OPTIONS = handler;
};

/*
// TODO have a server.on414(), etc for every type that the router supports
// default responses can just be body-less

  router.on500(function(context, ex){
    console.log("===============================");
    console.log("Uncaught Exception");
    console.log(ex);
    console.log(context.req.method, ' ', context.req.url);
    console.log(ex.stack);
    statusman.createResponder(context.req, context.res).internalServerError();
  });


};
*/

Server.prototype.listen = function(cb){
  var that = this;
  var router = this.router;
  var protocolLibrary = this.protocol === 'https' ? https : http;
  var server = protocolLibrary.createServer(function(req, res){
      router.dispatch({req : req, res : res});
  });
  server.listen(that.port, cb);
  that.server = server;
};

Server.prototype.close = function(cb){
  this.server.close(cb);
};

module.exports = Server;



var getMethods = function(resource){
  var serverSupportedMethods = ["GET", "POST", 
                                "PUT", "DELETE",
                                "HEAD", "OPTIONS"];
  var moduleMethods = _.functions(resource);
  var methods = _.intersection(moduleMethods, serverSupportedMethods);
  var additionalMethods = ['OPTIONS'];
  if (_.isFunction(resource.GET)){
    additionalMethods.push('HEAD');
  }
  methods = _.union(additionalMethods, methods);
  return methods;
};
