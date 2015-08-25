function chatfocus() {
  $('#chat').scrollTop($('#chat').prop('scrollHeight'));
}

$(document).ready(function() {
  var socket = io.connect();
  var id;
  var name;
  if(name === undefined || name === null || name === "") name = prompt("Your name: ");
  name = (name === undefined || name === null || name === "") ? "anonymous" : name;

  socket.on('establish', function(data){
    id = data.id;
    $('#chat').empty();
    $('#user_list').empty();
    socket.emit('update_users');
    socket.emit('update_history');
    socket.emit('add_user', {
      name: name
    });
  });

  socket.on('update_history', function(data){
    var color = (id === data.id) ? "color:green;" : "";
    $('#chat').append("<p style='" + color + "'>[" + data.name + "] : " + data.comment + "</p>");
  });

  socket.on('update_users', function(data){
    var color = (id === data.id) ? "color:green;" : "";
    $('#user_list').append("<li id='"+data.id+"' style='" + color + "'> [" + data.name + "] </li>");
  });

  socket.on('user_enter', function(data) {
    var color = (id === data.id) ? "color:green;" : "";
    $('#chat').append("<p style='color:red;'>[System] : [" + data.name + "] enter the chat room.</p>");
    chatfocus();
    $('#user_list').append("<li id='"+data.id+"' style='"+color+"'>[" + data.name + "]</li>");
  });

  socket.on('user_leave', function(data) {
    $('#chat').append("<p style='color:red;'>[System] : [" + data.name + "] leave the chat room.</p>");
    chatfocus();
    $('#' + data.id).remove();
  });

  socket.on('user_say', function(data) {
    var color = (id === data.id) ? "color:green;" : "";
    $('#chat').append("<p style='" + color + "'>[" + data.name + "] : " + data.comment + "</p>");
    chatfocus();
  });

  $('#btn_user').click(function(){
    $('#user_list').empty();
    socket.emit('update_users');
  });

  $('form').submit(function() {
    // No message
    if($('#input_chat').val() === undefined || $('#input_chat').val() === ""){
      $('#input_chat').blur();
      return false;
    }
    // Send message
    socket.emit('user_say', {
      name: name,
      id: id,
      comment: $('#input_chat').val()
    })
    $('#input_chat').val("");
    $('#input_chat').focus();
    return false;
  });

  $(document).keypress(function(e) {
    if (e.which == 13 && !$('#input_chat').is(":focus")) {
      $('#input_chat').focus();
    }
  });

  $('#input_chat').focus();
})
