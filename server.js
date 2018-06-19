// 18. Juni 2018, 13:37

// Dependencies
var express = require("express");
var http = require("http");
var path = require("path");
var socketIO = require("socket.io");
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var anzPlayers;
app.set("port", 5000);
app.use("/static", express.static(__dirname + "/static"));

// Send the index.html file to the clients
app.get("/", function(request, response) {
  response.sendFile(path.join(__dirname, "index.html"));
});

// Starts the server.
server.listen(5000, function() {
  console.log("Starting server on port 5000");
});

// Add the WebSocket handlers
io.on("connection", function(socket) {});

//add Players to the game
var players = {};
var check = false;

//---------------On Connection--------------------------
io.on("connection", function(socket) {
  //--------------On New Player---------------------------
  socket.on("new player", function(einName, setcolor) {
    var x = Math.round(Math.random() * 685);
    while (x < 15){
      x = Math.round(Math.random() * 685);
    }
    var y = Math.round(Math.random() * 585);
    while (y < 15){
      y = Math.round(Math.random() * 585);
    }
    players[socket.id] = {
      eingegName: einName,
      name: socket.id,
      x: x,
      y: y,
      faenger: false,
      color: setcolor
    };

    anzPlayers = Object.keys(players).length;
    console.log(
      "New Player joined the Game: " +
        players[socket.id].eingegName +
        ", " +
        players[socket.id].name +
        ", " +
        players[socket.id].x +
        ", " +
        players[socket.id].y
    );
    console.log(anzPlayers);
  });
  //--------------End On New Player---------------------------


  //checks if there is no catcher in the game yet
  for (var test in players) {
    //console.log(JSON.stringify(test));
    if (check == false) {
      //console.log("Check ist false");
      if (players[test].faenger == true) {
        check = true;
        //console.log("Check ist true");
      }

      //if there is no catcher and there are at least 3 players, choose a random one
      if (check == false && Object.keys(players).length >= 2) {
        setFaenger();
        check = true;
      }
    }

  }


  //sets a random faenger
  function setFaenger(){

  var anz = Object.keys(players).length;
  var rand = Math.round(Math.random() * 10);
  while (rand >= anz){
    rand = Math.round(Math.random() * 10);
  }
  var aktuell = Object.keys(players);
  players[aktuell[rand]].faenger = true;
  }







  //delete players from the game
  socket.on("disconnect", function() {
    delete players[socket.id];
    anzPlayers = Object.keys(players).length;

  });
  //--------------------On Movement----------------------
  socket.on("movement", function(data) {
    var player = players[socket.id] || {};

    if (data.left && player.x >= 15) {
      player.x -= 5;
    }
    if (data.up && player.y >= 15) {
      player.y -= 5;
    }
    if (data.right && player.x <= 685) {
      player.x += 5;
    }
    if (data.down && player.y <= 585  ) {
      player.y += 5;
    }


    for (var test in players) {

      if (player.name != test.name) {
        //calculates the distance between 2 player
        var dist = Math.sqrt(
          Math.pow(Math.abs(player.x - players[test].x), 2) +
            Math.pow(Math.abs(player.y - players[test].y), 2)
        );
        //console.log(dist);
        if (
          dist < 20 &&
          player.faenger == true &&
          players[test].faenger == false
        ) {
          players[test].faenger = true;
          io.sockets.emit("redoCanvas", players);
          io.sockets.emit("getPlayers", players);
          io.sockets.emit("getfaengerChecked", check);
        }
      }
    }
    var count = 0;
    for (var id in players) {
      if (players[id].faenger == true) {
        count++;
      }
    }
    var max = Object.keys(players).length;
    if (count + 1 == max && check == true && Object.keys(players).length > 2) {
      endgame();
  }

});


  //----------------End On Movement-----------------------
});

//------------------End On Connection-------------------------
setInterval(function() {
  io.sockets.emit("state", players);
  io.sockets.emit("name", players);
}, 1000 / 60);




function endgame() {
  var endlist = [];
  for(var id in players){
    if(players[id].faenger == false){
      endlist.push(players[id].eingegName);
    }
  }
  players = {};
  console.log(Object.keys(players).length);
  io.sockets.emit('redoCanvas');
  io.sockets.emit('endlist', endlist);
  io.sockets.emit('goBack');
  check = false;
}
