const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Criação do servidor Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);  // Inicializa o Socket.IO

// Middleware para servir os arquivos estáticos (Frontend)
app.use(express.static('public'));

// Conexão dos clientes via Socket.IO
io.on('connection', (socket) => {
  console.log('Novo cliente conectado');

  // Enviar e receber eventos, ex: um evento para o jogo da velha
  socket.on('move', (data) => {
    socket.broadcast.emit('move', data);  // Envia para todos os outros jogadores
  });

  // Desconexão
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Configuração para rodar o servidor na porta desejada
server.listen(process.env.PORT || 3000, () => {
  console.log('Servidor rodando');
});
