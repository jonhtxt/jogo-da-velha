const socket = io(),
      cells = document.querySelectorAll(".cell"),
      statusText = document.getElementById("status");

let jogadorAtual = "X",
    jogoAtivo = true,
    placar = { X: 0, O: 0 },
    tabuleiro = ["", "", "", "", "", "", "", "", ""],
    nomeX = "Jogador X",
    nomeO = "Jogador O";

const clickSound = new Audio("https://www.soundjay.com/button/sounds/button-16.mp3"),
      combinacoesVitoria = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];

function startGame() {
    nomeX = document.getElementById("nomeX").value || "Jogador X";
    nomeO = document.getElementById("nomeO").value || "Jogador O";
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    atualizarStatus();
}

function clicarNaCelula(e) {
    let index = e.target.dataset.index;
    if (tabuleiro[index] === "" && jogoAtivo) {
        tabuleiro[index] = jogadorAtual;
        e.target.textContent = (jogadorAtual === "X") ? "❌" : "⭕";
        clickSound.play();

        socket.emit("move", { index: index, jogador: jogadorAtual });

        if (verificarVitoria()) {
            statusText.textContent = `${(jogadorAtual === "X") ? nomeX : nomeO} venceu!`;
            placar[jogadorAtual]++;
            atualizarPlacar();
            jogoAtivo = false;
        } else if (tabuleiro.includes("")) {
            jogadorAtual = (jogadorAtual === "X") ? "O" : "X";
            atualizarStatus();
        } else {
            statusText.textContent = "Empate!";
            jogoAtivo = false;
        }
    }
}

function atualizarStatus() {
    statusText.textContent = `Vez de ${(jogadorAtual === "X") ? nomeX : nomeO}`;
}

function verificarVitoria() {
    return combinacoesVitoria.some(comb => comb.every(i => tabuleiro[i] === jogadorAtual));
}

function atualizarPlacar() {
    document.getElementById("placarX").textContent = `❌ ${placar.X}`;
    document.getElementById("placarO").textContent = `⭕ ${placar.O}`;
}

function reiniciarJogo() {
    tabuleiro = ["", "", "", "", "", "", "", "", ""];
    jogadorAtual = "X";
    jogoAtivo = true;
    cells.forEach(cell => cell.textContent = "");
    atualizarStatus();
    socket.emit("reset");
}

function voltarAoMenu() {
    document.getElementById("game-container").style.display = "none";
    document.getElementById("start-screen").style.display = "flex";
    reiniciarJogo();
}

socket.on("move", ({ index, jogador }) => {
    tabuleiro[index] = jogador;
    cells[index].textContent = (jogador === "X") ? "❌" : "⭕";
    clickSound.play();

    if (verificarVitoria()) {
        statusText.textContent = `${(jogador === "X") ? nomeX : nomeO} venceu!`;
        placar[jogador]++;
        atualizarPlacar();
        jogoAtivo = false;
    } else if (tabuleiro.includes("")) {
        jogadorAtual = (jogador === "X") ? "O" : "X";
        atualizarStatus();
    } else {
        statusText.textContent = "Empate!";
        jogoAtivo = false;
    }
});

socket.on("reset", reiniciarJogo);

cells.forEach(cell => {
    cell.addEventListener("click", clicarNaCelula);
});






