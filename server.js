const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let usuariosJogadores = [];

// Carrega os jogadores salvos (se existirem)
fs.readFile('players.json', (err, data) => {
  if (!err) {
    usuariosJogadores = JSON.parse(data);
  }
});

app.get('/players', (req, res) => {
  res.json(usuariosJogadores);
});

app.post('/add-player', (req, res) => {
  const { name } = req.body;
  if (!usuariosJogadores.includes(name)) {
    usuariosJogadores.push(name);
    fs.writeFile('players.json', JSON.stringify(usuariosJogadores), err => {
      if (err) {
        return res.status(500).send('Erro ao salvar jogador');
      }
      res.status(200).send('Jogador salvo');
    });
  } else {
    res.status(400).send('Nome já existe');
  }
});

app.post('/verificar-nomes', (req, res) => {
  const { nomeX, nomeO } = req.body;
  if (usuariosJogadores.includes(nomeX) || usuariosJogadores.includes(nomeO)) {
    return res.status(400).json({ ok: false, mensagem: "Um dos nomes já foi utilizado." });
  }
  res.json({ ok: true });
});

io.on('connection', socket => {
  socket.on('move', ({ index, jogador }) => {
    io.emit('move', { index, jogador });
  });

  socket.on('reset', () => {
    io.emit('reset');
  });
});

http.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});



