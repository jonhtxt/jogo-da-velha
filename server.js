const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let tabuleiro = ["", "", "", "", "", "", "", "", ""];
let jogadorAtual = "X";

io.on('connection', (socket) => {
  console.log('Novo jogador conectado');
  
  socket.on('move', (data) => {
    const { index, jogador } = data;
    
    if (tabuleiro[index] === "") {
      tabuleiro[index] = jogador;
      io.emit('move', { index, jogador });  // Envia a jogada para todos os jogadores conectados
    }
  });

  socket.on('disconnect', () => {
    console.log('Jogador desconectado');
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
