const express = require("express");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const jogadores = [];
let jogadoresNaPartida = [];

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const caminhoArquivo = path.join(__dirname, "players.json");

// Rota para salvar novos jogadores
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

// Rota para verificar nomes antes de iniciar o jogo
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

// Rota para listar jogadores
app.get("/players", (req, res) => {
  fs.readFile(caminhoArquivo, "utf8", (err, data) => {
    if (err) return res.json([]);
    res.json(data ? JSON.parse(data) : []);
  });
});

// Socket.IO - multiplayer
io.on("connection", (socket) => {
  console.log("Novo jogador conectado:", socket.id);

  if (jogadoresNaPartida.length >= 2) {
    socket.emit("sala-cheia");
    return;
  }

  const simbolo = jogadoresNaPartida.length === 0 ? "X" : "O";
  jogadoresNaPartida.push({ id: socket.id, simbolo });
  socket.emit("atribuir-simbolo", simbolo);
  socket.broadcast.emit("status", `Jogador ${simbolo} entrou.`);

  socket.on("move", ({ index, jogador }) => {
    socket.broadcast.emit("move", { index, jogador });
  });

  socket.on("reset", () => {
    io.emit("reset");
  });

  socket.on("disconnect", () => {
    const i = jogadoresNaPartida.findIndex(j => j.id === socket.id);
    if (i !== -1) jogadoresNaPartida.splice(i, 1);
    console.log("Jogador desconectado:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});



