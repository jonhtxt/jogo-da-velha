const socket = io();

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
let jogadorAtual = "X";
let jogoAtivo = true;
let placar = { X: 0, O: 0 };
let tabuleiro = ["", "", "", "", "", "", "", "", ""];
let nomeX = "Jogador X";
let nomeO = "Jogador O";
const clickSound = new Audio('https://www.soundjay.com/button/sounds/button-16.mp3');

const combinacoesVitoria = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

function startGame() {
  nomeX = document.getElementById("nomeX").value || "Jogador X";
  nomeO = document.getElementById("nomeO").value || "Jogador O";
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  atualizarStatus();
}

function clicarNaCelula(e) {
  const index = e.target.dataset.index;
  if (tabuleiro[index] !== "" || !jogoAtivo) return;

  tabuleiro[index] = jogadorAtual;
  e.target.textContent = jogadorAtual === "X" ? "❌" : "⭕";
  clickSound.play();

  socket.emit("move", { index, jogador: jogadorAtual });

  if (verificarVitoria()) {
    statusText.textContent = `${jogadorAtual === "X" ? nomeX : nomeO} venceu!`;
    placar[jogadorAtual]++;
    atualizarPlacar();
    jogoAtivo = false;
  } else if (!tabuleiro.includes("")) {
    statusText.textContent = "Empate!";
    jogoAtivo = false;
  } else {
    jogadorAtual = jogadorAtual === "X" ? "O" : "X";
    atualizarStatus();
  }
}

socket.on("move", ({ index, jogador }) => {
  tabuleiro[index] = jogador;
  cells[index].textContent = jogador === "X" ? "❌" : "⭕";
  clickSound.play();

  if (verificarVitoria()) {
    statusText.textContent = `${jogador === "X" ? nomeX : nomeO} venceu!`;
    placar[jogador]++;
    atualizarPlacar();
    jogoAtivo = false;
  } else if (!tabuleiro.includes("")) {
    statusText.textContent = "Empate!";
    jogoAtivo = false;
  } else {
    jogadorAtual = jogador === "X" ? "O" : "X";
    atualizarStatus();
  }
});

function atualizarStatus() {
  statusText.textContent = `Vez de ${jogadorAtual === "X" ? nomeX : nomeO}`;
}

function verificarVitoria() {
  return combinacoesVitoria.some(comb =>
    comb.every(i => tabuleiro[i] === jogadorAtual)
  );
}

function atualizarPlacar() {
  document.getElementById("placarX").textContent = `❌ ${placar.X}`;
  document.getElementById("placarO").textContent = `⭕ ${placar.O}`;
}

function reiniciarJogo() {
  tabuleiro = ["", "", "", "", "", "", "", "", ""];
  jogadorAtual = "X";
  jogoAtivo = true;
  cells.forEach(cell => (cell.textContent = ""));
  atualizarStatus();
  socket.emit("reset");
}

socket.on("reset", reiniciarJogo);

function voltarAoMenu() {
  document.getElementById("game-container").style.display = "none";
  document.getElementById("start-screen").style.display = "flex";
  reiniciarJogo();
}

cells.forEach(cell => {
  cell.addEventListener("click", clicarNaCelula);
});





