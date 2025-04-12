const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let jogadores = {};  // Armazena os nomes dos jogadores

// Serve os arquivos estáticos do frontend
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Novo jogador conectado: ' + socket.id);

  socket.on('iniciar_partida', (data) => {
    jogadores[socket.id] = data;
    if (Object.keys(jogadores).length === 2) {
      io.emit('vez_do_jogador', { jogador: 'X' });  // Envia a vez para o primeiro jogador
    }
  });

  socket.on('movimento', (data) => {
    io.emit('movimento', data); // Envia o movimento para todos os jogadores
    io.emit('vez_do_jogador', { jogador: data.jogador === 'X' ? 'O' : 'X' }); // Alterna a vez
  });

  socket.on('disconnect', () => {
    console.log('Jogador desconectado: ' + socket.id);
    delete jogadores[socket.id];
  });
});

server.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
