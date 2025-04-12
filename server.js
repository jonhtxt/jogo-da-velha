const express = require("express");
const fs = require("fs");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Caminho para o arquivo JSON onde os nomes dos jogadores são armazenados
const playersFilePath = path.join(__dirname, "players.json");

// Inicia o array de jogadores, lendo o arquivo JSON
let jogadores = [];

// Tenta ler o arquivo JSON, se estiver vazio ou não existir, inicializa com um array vazio
try {
    const data = fs.readFileSync(playersFilePath, 'utf8');
    jogadores = data ? JSON.parse(data) : []; // Se o arquivo estiver vazio, inicializa com um array vazio
} catch (err) {
    console.error('Erro ao ler o arquivo:', err);
}

// Configuração para servir arquivos estáticos
app.use(express.static('public'));
app.use(express.json());

// Rota para obter o histórico de jogadores
app.get("/players", (req, res) => {
    res.json(jogadores); // Retorna a lista de jogadores salvos
});

// Rota para adicionar um novo jogador
app.post("/add-player", (req, res) => {
    const { name } = req.body;

    // Verifica se o nome já está no histórico
    if (jogadores.includes(name)) {
        return res.status(400).json({ mensagem: "Esse nome já foi utilizado!" });
    }

    jogadores.push(name);

    // Salva o histórico atualizado de jogadores no arquivo
    fs.writeFile(playersFilePath, JSON.stringify(jogadores, null, 2), (err) => {
        if (err) {
            console.error("Erro ao salvar jogador:", err);
            return res.status(500).json({ mensagem: "Erro ao salvar jogador." });
        }

        res.status(200).json({ mensagem: "Jogador salvo com sucesso!" });
    });
});

// Rota para verificar se os nomes inseridos são válidos e únicos
app.post("/verificar-nomes", (req, res) => {
    const { nomeX, nomeO } = req.body;

    // Verifica se os nomes são válidos
    if (!nomeX || !nomeO) {
        return res.status(400).json({ ok: false, mensagem: "Ambos os jogadores precisam inserir seus nomes." });
    }

    // Verifica se os nomes são iguais
    if (nomeX === nomeO) {
        return res.status(400).json({ ok: false, mensagem: "Os nomes dos jogadores não podem ser iguais." });
    }

    // Verifica se os nomes já foram usados
    if (jogadores.includes(nomeX) || jogadores.includes(nomeO)) {
        return res.status(400).json({ ok: false, mensagem: "Um dos nomes já foi utilizado. Escolha outro." });
    }

    res.json({ ok: true });
});

// Inicializa o servidor e escuta as conexões via WebSocket
io.on("connection", (socket) => {
    console.log("Um novo jogador conectou");

    socket.on("move", (data) => {
        socket.broadcast.emit("move", data); // Emite o movimento para todos os outros jogadores
    });

    socket.on("reset", () => {
        socket.broadcast.emit("reset"); // Emite o evento para reiniciar o jogo
    });

    socket.on("disconnect", () => {
        console.log("Um jogador desconectou");
    });
});

// Inicia o servidor na porta 3000
server.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});



