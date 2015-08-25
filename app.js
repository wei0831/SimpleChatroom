// Author: Jack Chang
// Date: 08/25/2015
// Description: Simple chatroom using socket.io

///////////////////////////////////////
// Variables
///////////////////////////////////////
var path = require("path");
var express = require("express");
var app = express();
var _ = require("underscore");
var sanitizeHtml = require('sanitize-html');
var port = process.env.PORT || 4000;
var max_history = 100;

app.use(express.static(path.join(__dirname, "./static")));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

///////////////////////////////////////
// Routes
///////////////////////////////////////
app.get('/', function (req, res){
  res.render('index');
});

///////////////////////////////////////
// Server
///////////////////////////////////////
var server = app.listen(port, function(){
  console.log("listening on port " + port);
});

var user_list = [];
var history_list = [];
var history_length = 0;

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {

  socket.emit('establish', {
    id: socket.id
  });

  socket.on('add_user', function (data){
    user_list.push({id: socket.id, name: data.name});
    socket.name = data.name;
    io.emit('user_enter', {id: socket.id, name: data.name});
  });

  socket.on('user_say', function(data){
    var cleancomment = sanitizeHtml(data.comment, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'iframe' ]),
      allowedAttributes: {
        a: [ 'href', 'name', 'target' ],
        iframe: [ 'width', 'height', 'src', 'frameborder' ],
        img: [ 'src' ]
      }
    });
    history_list.push({id : data.id, name: data.name, comment: cleancomment});
    if(history_length == max_history){
      history_list.shift();
    }
    else {
      ++history_length;
    }
    io.emit('user_say',
    {
      name : data.name,
      id : data.id,
      comment: cleancomment
    });
  });

  socket.on('update_users', function(data){
    for(var i = 0; i < user_list.length; ++i)
    {
      socket.emit('update_users', user_list[i]);
    }
  });

  socket.on('update_history', function(data){
    for(var i = 0; i < history_length; ++i)
    {
      socket.emit('update_history', history_list[i]);
    }
  });

  socket.on('disconnect',function(){
     user_list = user_list.filter(function(user){ return user.id != socket.id });
     io.emit('user_leave', {name : socket.name, id: socket.id});
  });

});
