#!/usr/bin/env node

var settings = require('./settings.json');
var secretkeys = settings.secretkeys;
var dbserver = settings.dbserver;

var connect = require("connect"),
    mongoose = require("mongoose"),
    connectRoute = require("connect-route"),
    io = require("socket.io"),
    http = require("http");
    marked = require("marked");

var Schema = mongoose.Schema;

var CounterSchema = new Schema({
  count: { type: Number, "default": 1 }
});
var Counter = mongoose.model('Counter', CounterSchema);

var AccessSchema = new Schema({
  session: String,
  date: Date
});
var Access = mongoose.model('Access', AccessSchema);

var PoemSchema = new Schema({
  author: String,
  text: String,
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

var Poem = mongoose.model('Poem', PoemSchema);

(function(root, port) {
  var db = mongoose.connect(dbserver);
  var route = connectRoute(function (router) {
    router.get('/api/counter', function(req, res, next) {
      Counter.findOne({}, function(err, counter){
        if (err) console.log(err);
        res.end(JSON.stringify(counter.count));
      });
    }); 
    router.get('/api/relaypoem', function(req, res, next){
      Poem.find({}).sort({created:"asc"}).exec(function(err,poems) {
        if (err) return console.log(err);
        var text = "";
        for (var i = 0; i < poems.length; i++) {
          text += poems[i].text;
          text += "\n";
        }
        res.end(marked(text));
      });
    });
    router.post('/api/relaypoem', function(req, res, next){
      poem = new Poem();
      poem.author = req.body.author;
      poem.text = req.body.text;
      poem.save( function(err)  {
        if (err) return console.log(err);
      });
      res.end(JSON.stringify(poem));
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
  var members = {};
  var hash2list = function(hash) {
    var list = [];
    for (var key in hash) {
      list.push(hash[key]);
    }
    return list;
  };
  sockServer.sockets.on('connection', function(sockClient){
    sockClient.on('set user', function(name) {
      sockClient.set('user', {name:name, color:'#' + Math.floor(Math.random() * 0xFFFFFF).toString(16)});
      sockServer.sockets.emit("members", hash2list(members));
    });
    sockClient.on('msg', function(msg){ 
      sockClient.get('user', function (err, user) {
        sockServer.sockets.emit('msg', {user:user, msg:msg});
      });
    });
    sockClient.on('disconnect', function () {
      delete members[sockClient.id];
      sockServer.sockets.emit("members", hash2list(members));
    });
  });

  console.log("http server running at http://localhost:" + port + "/ (" + root + ")");
}(process.argv[2] || "./assets",
  process.argv[3] || "80"));

