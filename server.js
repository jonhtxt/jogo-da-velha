const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;


// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

let players = {};
let board = Array(9).fill("");

io.on('connection', (socket) => {
  console.log('Novo jogador conectado:', socket.id);

  // Atribui X ou O
  if (!players.X) {
    players.X = socket.id;
    socket.emit('playerType', 'X');
  } else if (!players.O) {
    players.O = socket.id;
    socket.emit('playerType', 'O');
  } else {
    socket.emit('playerType', 'spectator');
  }

  socket.on('play', (data) => {
    board[data.index] = data.player;
    io.emit('updateBoard', { index: data.index, player: data.player });
  });

  socket.on('reset', () => {
    board = Array(9).fill("");
    io.emit('resetBoard');
  });

  socket.on('disconnect', () => {
    console.log('Jogador saiu:', socket.id);
    if (players.X === socket.id) delete players.X;
    if (players.O === socket.id) delete players.O;
  });
});

http.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
