#!/usr/bin/env node

var settings = require('./settings.json');
var secretkeys = settings.secretkeys;
var dbserver = settings.dbserver;

var connect = require("connect"),
    mongoose = require("mongoose"),
    connectRoute = require("connect-route"),
    io = require("socket.io"),
    http = require("http");

var Schema = mongoose.Schema;

var CounterSchema = new Schema({
  count: { type: Number, "default": 1 }
});
var AccessSchema = new Schema({
  session: String,
  date: Date
});


var Access = mongoose.model('Access', AccessSchema);
var Counter = mongoose.model('Counter', CounterSchema);

(function(root, port) {
  var db = mongoose.connect(dbserver);
  console.log(db);
  var route = connectRoute(function (router) {
    router.get('/api/counter', function(req, res, next) {
      Counter.findOne({}, function(err, counter){
        if (err) res.end(err);
        res.end(JSON.stringify(counter.count));
      });
    }); 
  });
  var httpServer = connect()
    .use(require("compression")())
    .use(require("cookie-session")({
      keys: secretkeys
    }))
    .use(function(req,res,next){
      if(req.session.user === undefined) {
        console.log('new user')
        req.session.user = { name: 'guest' };
        Counter.findOneAndUpdate({}, { $inc:{count:1}}, {upsert: true}, function(err) {
          console.log(err);
        });
      }
      console.log('accessed by ' + req.session.user.name);
      next();
    })
    .use(require("body-parser")())
    .use(route)
    .use(require("serve-static")(root, {'index': ['index.html']}))
    .listen(port);

  var sockServer = io.listen(httpServer);
  sockServer.sockets.on('connection', function(sockClient){
    sockClient.on('set user', function(name) {
      sockClient.set('user', {name:name, color:'#' + Math.floor(Math.random() * 0xFFFFFF).toString(16)});
    });
    sockClient.on('msg', function(msg){ 
      sockClient.get('user', function (err, user) {
        sockServer.sockets.emit('msg', {user:user, msg:msg});
      });
    });
  });

  console.log("http server running at http://localhost:" + port + "/ (" + root + ")");
}(process.argv[2] || "./assets",
  process.argv[3] || "80"));

