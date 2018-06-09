// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var anzPlayers;
app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));


// Send the index.html file to the clients
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

// Add the WebSocket handlers
io.on('connection', function(socket) {
});

//add Players to the game
var players = {};
io.on('connection', function(socket) {
  socket.on('new player', function() {
    players[socket.id] = {
      name: socket.id,
      x: 300,
      y: 300,
      gefangen: false
    }; 
    anzPlayers = Object.keys(players).length;
    console.log('New Player joined the Game: ' + players[socket.id].name + ', ' + players[socket.id].x + ', ' + players[socket.id].y);
    console.log(anzPlayers);
  });

  //delete players from the game
  socket.on('disconnect', function(){
    delete players[socket.id]; 
    anzPlayers = Object.keys(players).length;
});
  
socket.on('movement', function(data) {

  var player = players[socket.id] || {};


  if (data.left && player.x >= 15) {
    player.x -= 5;
  }
  if (data.up && player.y >= 15) {
    player.y -= 5;
  }
  if (data.right && player.x <= 635) {
    player.x += 5;
  }
  if (data.down && player.y <= 885) {
    player.y += 5;
  }

  for(var test in players){
    //console.log(test, players[test].x);
    if (player.name != test){
      /*if((player.x == players[test].x+20 || player.x == players[test].x-20) && (player.y == players[test].y+20 || player.y == players[test].y-20)){
        console.log("test")
      }*/
      
      //console.log(player.x, players[test].x-15);
      if(player.x == players[test].x && player.y == players[test].y){
        //console.log(player.name, 'wurde gefangen');
        players[test].gefangen = true;
        io.sockets.emit('redoCanvas', players);
      }
    } 
  }

});


});

setInterval(function() {
  io.sockets.emit('state', players);
}, 0.0005 / 60);


