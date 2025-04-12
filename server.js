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

