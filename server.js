const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const caminhoArquivo = path.join(__dirname, "players.json");
let jogadoresNaPartida = [];

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Adiciona jogador novo
app.post("/add-player", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ erro: "Nome é obrigatório." });

  fs.readFile(caminhoArquivo, "utf8", (err, data) => {
    const jogadoresSalvos = data ? JSON.parse(data) : [];

    if (!jogadoresSalvos.includes(name)) {
      jogadoresSalvos.push(name);
      fs.writeFile(caminhoArquivo, JSON.stringify(jogadoresSalvos), err => {
        if (err) console.error("Erro ao salvar jogador:", err);
      });
    }
    res.sendStatus(200);
  });
});

// Verifica nomes antes de iniciar
app.post("/verificar-nomes", (req, res) => {
  const { nomeX, nomeO } = req.body;
  fs.readFile(caminhoArquivo, "utf8", (err, data) => {
    const jogadoresSalvos = data ? JSON.parse(data) : [];

    if (jogadoresSalvos.includes(nomeX) || jogadoresSalvos.includes(nomeO)) {
      return res.json({ ok: false, mensagem: "Um dos nomes já foi usado." });
    }
    res.json({ ok: true });
  });
});

// Lista jogadores
app.get("/players", (req, res) => {
  fs.readFile(caminhoArquivo, "utf8", (err, data) => {
    if (err) return res.json([]);
    res.json(data ? JSON.parse(data) : []);
  });
});

// SOCKET.IO para multiplayer
io.on("connection", (socket) => {
  console.log("Novo jogador conectado:", socket.id);

  if (jogadoresNaPartida.length >= 2) {
    socket.emit("sala-cheia");
    return;
  }

  const simbolo = jogadoresNaPartida.length === 0 ? "X" : "O";
  jogadoresNaPartida.push({ id: socket.id, simbolo });

  socket.emit("atribuir-simbolo", simbolo);
  socket.broadcast.emit("jogador-entrou", simbolo);

  socket.on("jogada", (index) => {
    const jogador = jogadoresNaPartida.find(j => j.id === socket.id);
    if (jogador) {
      socket.broadcast.emit("receber-jogada", { index, simbolo: jogador.simbolo });
    }
  });

  socket.on("resetar-jogo", () => {
    io.emit("jogo-resetado");
  });

  socket.on("disconnect", () => {
    console.log("Jogador saiu:", socket.id);
    jogadoresNaPartida = jogadoresNaPartida.filter(j => j.id !== socket.id);
    socket.broadcast.emit("jogador-desconectado");
  });
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});



