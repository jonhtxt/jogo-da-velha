const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

let jogadores = [];
let partidaAtiva = false;
let tabuleiro = ["", "", "", "", "", "", "", "", ""];
let placar = { X: 0, O: 0 };

// Carregar jogadores já cadastrados (se houver)
app.get('/players', (req, res) => {
  fs.readFile('players.json', 'utf8', (err, data) => {
    if (err) return res.status(500).send("Erro ao carregar os jogadores.");
    res.json(JSON.parse(data));
  });
});

// Salvar novos jogadores
app.post('/add-player', (req, res) => {
  const { name } = req.body;
  fs.readFile('players.json', 'utf8', (err, data) => {
    if (err) return res.status(500).send("Erro ao salvar o jogador.");
    
    const players = JSON.parse(data);
    if (players.includes(name)) {
      return res.json({ ok: false, message: "Nome já em uso." });
    }

    players.push(name);
    fs.writeFile('players.json', JSON.stringify(players), 'utf8', () => {
      res.json({ ok: true });
    });
  });
});

// Rota para verificar se os nomes são válidos
app.post('/verificar-nomes', (req, res) => {
  const { nomeX, nomeO } = req.body;
  fs.readFile('players.json', 'utf8', (err, data) => {
    if (err) return res.status(500).send("Erro ao verificar os nomes.");

    const players = JSON.parse(data);
    if (players.includes(nomeX) || players.includes(nomeO)) {
      return res.json({ ok: false, message: "Um dos nomes já foi utilizado." });
    }
    res.json({ ok: true });
  });
});

io.on('connection', (socket) => {
  console.log('Novo jogador conectado:', socket.id);

  // Atribuir o jogador X ou O
  if (jogadores.length < 2) {
    const jogador = jogadores.length === 0 ? 'X' : 'O';
    jogadores.push({ id: socket.id, simbolo: jogador });
    socket.emit('atribuir-simbolo', jogador);

    // Enviar o estado atual do tabuleiro
    socket.emit('atualizar-tabuleiro', tabuleiro);

    // Iniciar a partida quando ambos os jogadores estiverem conectados
    if (jogadores.length === 2) {
      partidaAtiva = true;
      io.emit('iniciar-partida', { tabuleiro, jogadorInicial: 'X' }); // Envia o estado inicial do jogo
    }
  }

  // Movimentos dos jogadores
  socket.on('move', ({ index, jogador }) => {
    if (tabuleiro[index] === "" && partidaAtiva) {
      tabuleiro[index] = jogador;
      io.emit('atualizar-jogo', { index, jogador });
      
      // Verificar vitória
      if (verificarVitoria(jogador)) {
        io.emit('fim-partida', `${jogador} venceu!`);
        placar[jogador]++;
        resetarJogo();
      } else if (!tabuleiro.includes("")) {
        io.emit('fim-partida', 'Empate!');
        resetarJogo();
      }
    }
  });

  // Resetar o jogo
  socket.on('reset', resetarJogo);

  // Remover jogador desconectado
  socket.on('disconnect', () => {
    jogadores = jogadores.filter(jogador => jogador.id !== socket.id);
    partidaAtiva = false;
    tabuleiro = ["", "", "", "", "", "", "", "", ""];
    console.log(`Jogador desconectado: ${socket.id}`);
  });
});

function verificarVitoria(jogador) {
  const combinacoesVitoria = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  return combinacoesVitoria.some(comb => comb.every(i => tabuleiro[i] === jogador));
}

function resetarJogo() {
  tabuleiro = ["", "", "", "", "", "", "", "", ""];
  io.emit('reset-jogo', tabuleiro);
}

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


