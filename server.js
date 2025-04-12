const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("Um jogador se conectou!");

  socket.on("move", (data) => {
    socket.broadcast.emit("move", data);
  });

  socket.on("reset", () => {
    socket.broadcast.emit("reset");
  });

  socket.on("disconnect", () => {
    console.log("Um jogador se desconectou.");
  });
});

http.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
const fs = require("fs");
const path = require("path");

const playersFile = path.join(__dirname, "players.json");

// Rota para salvar novo jogador
app.post("/add-player", express.json(), (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).send("Nome inválido");

  fs.readFile(playersFile, "utf8", (err, data) => {
    let players = [];
    if (!err && data) {
      try {
        players = JSON.parse(data);
      } catch {}
    }
    if (!players.includes(name)) {
      players.push(name);
      fs.writeFile(playersFile, JSON.stringify(players), () => {});
    }
    res.status(200).send("OK");
  });
});

// Rota para pegar todos os jogadores
app.get("/players", (req, res) => {
  fs.readFile(playersFile, "utf8", (err, data) => {
    if (err || !data) return res.json([]);
    try {
      res.json(JSON.parse(data));
    } catch {
      res.json([]);
    }
  });
});

