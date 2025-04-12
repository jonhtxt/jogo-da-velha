const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);  // Configura o Socket.IO com o servidor HTTP

// Serve arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Serve a página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Lógica do jogo (servidor de WebSockets)
let jogo = {
  tabuleiro: ["", "", "", "", "", "", "", "", ""],
  jogadorAtual: "X",
  jogadores: [],
};

io.on('connection', (socket) => {
  console.log('Novo jogador conectado');

  // Adiciona o jogador à lista de jogadores
  if (jogo.jogadores.length < 2) {
    jogo.jogadores.push(socket);
  }

  // Quando um jogador faz uma jogada
  socket.on('move', (data) => {
    // Atualiza o tabuleiro e envia para todos os jogadores
    jogo.tabuleiro[data.index] = data.jogada;
    io.emit('move', jogo.tabuleiro);

    // Verifica a vitória ou empate
    const vencedor = verificarVitoria();
    if (vencedor) {
      io.emit('vitoria', vencedor);
    } else if (!jogo.tabuleiro.includes("")) {
      io.emit('empate');
    } else {
      jogo.jogadorAtual = jogo.jogadorAtual === "X" ? "O" : "X";  // Troca o jogador
      io.emit('turno', jogo.jogadorAtual);
    }
  });

  // Quando um jogador desconecta
  socket.on('disconnect', () => {
    console.log('Jogador desconectado');
    jogo.jogadores = jogo.jogadores.filter(player => player !== socket);
  });

  // Envia o status do jogo ao conectar
  socket.emit('status', {
    tabuleiro: jogo.tabuleiro,
    jogadorAtual: jogo.jogadorAtual,
  });
});

// Função para verificar se alguém ganhou
function verificarVitoria() {
  const combinacoesVitoria = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
    [0, 4, 8], [2, 4, 6], // Diagonais
  ];

  for (let i = 0; i < combinacoesVitoria.length; i++) {
    const [a, b, c] = combinacoesVitoria[i];
    if (jogo.tabuleiro[a] && jogo.tabuleiro[a] === jogo.tabuleiro[b] && jogo.tabuleiro[a] === jogo.tabuleiro[c]) {
      return jogo.tabuleiro[a];  // Retorna o vencedor (X ou O)
    }
  }
  return null;  // Retorna null se não houver vencedor
}

// Inicia o servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
