var socket = io();
socket.on('message', function(data) {
  console.log(data);
});

var movement = {
  up: false,
  down: false,
  left: false,
  right: false
}

document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = true;
      break;
    case 87: // W
      movement.up = true;
      break;
    case 68: // D
      movement.right = true;
      break;
    case 83: // S
      movement.down = true;
      break;
  }
});

document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = false;
      break;
    case 87: // W
      movement.up = false;
      break;
    case 68: // D
      movement.right = false;
      break;
    case 83: // S
      movement.down = false;
      break;
  }
});

socket.emit('new player', document.getElementById('color').value);

setInterval(function() {
  socket.emit('movement', movement);
  socket.emit('checkFaenger');
}, 1000 / 60);

function redoCanvas(){
  var canvas = document.getElementById('canvas');
  canvas.width = 650;
  canvas.height = 650;
  var context = canvas.getContext('2d');
  socket.on('state', function(players) {
    context.clearRect(0, 0, 650, 650);
    for (var id in players) {
      var player = players[id];
      if(player.faenger){
        context.fillStyle = "black";
      }else{
        context.fillStyle = player.color;
      }
      context.beginPath();
      context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
      context.fill();
    }
  });
}

redoCanvas();

socket.on('redoCanvas', function(players){
  redoCanvas();
});

socket.on('endgame', function(){
  window.alert('Game has endet');
});