const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
let jogadorAtual = "X";
let jogoAtivo = true;
let contraBot = true;
let placar = { X: 0, O: 0 };
let tabuleiro = ["", "", "", "", "", "", "", "", ""];
let nomeX = "Jogador X";
let nomeO = "Bot";
const clickSound = new Audio('https://www.soundjay.com/button/sounds/button-16.mp3');

const combinacoesVitoria = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

function startGame() {
  nomeX = document.getElementById("nomeX").value || "Jogador X";
  nomeO = document.getElementById("nomeO").value || "Bot";
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  atualizarStatus();
}

function mostrarInstrucoes() {
  alert("Alinhe três símbolos (❌ ou ⭕) para vencer. Contra o bot, você começa jogando.");
}

function mostrarSobre() {
  alert("Criado por Jonata com HTML, CSS e JavaScript.");
}

function voltarAoMenu() {
  document.getElementById("game-container").style.display = "none";
  document.getElementById("start-screen").style.display = "flex";
  reiniciarJogo(true);
}

function clicarNaCelula(e) {
  const index = e.target.dataset.index;
  if (tabuleiro[index] !== "" || !jogoAtivo) return;

  tabuleiro[index] = jogadorAtual;
  e.target.textContent = jogadorAtual === "X" ? "❌" : "⭕";
  clickSound.play();

  if (verificarVitoria()) {
    statusText.textContent = `${jogadorAtual === "X" ? nomeX : nomeO} venceu!`;
    placar[jogadorAtual]++;
    atualizarPlacar();
    jogoAtivo = false;
    return;
  }

  if (!tabuleiro.includes("")) {
    statusText.textContent = "Empate!";
    jogoAtivo = false;
    return;
  }

  jogadorAtual = jogadorAtual === "X" ? "O" : "X";
  atualizarStatus();

  if (contraBot && jogadorAtual === "O") {
    setTimeout(botJogar, 500);
  }
}

function botJogar() {
  if (!jogoAtivo) return;

  const indicesDisponiveis = tabuleiro.map((val, i) => val === "" ? i : null).filter(i => i !== null);
  const index = indicesDisponiveis[Math.floor(Math.random() * indicesDisponiveis.length)];

  tabuleiro[index] = "O";
  cells[index].textContent = "⭕";
  clickSound.play();

  if (verificarVitoria()) {
    statusText.textContent = `${nomeO} venceu!`;
    placar.O++;
    atualizarPlacar();
    jogoAtivo = false;
    return;
  }

  if (!tabuleiro.includes("")) {
    statusText.textContent = "Empate!";
    jogoAtivo = false;
    return;
  }

  jogadorAtual = "X";
  atualizarStatus();
}

function verificarVitoria() {
  return combinacoesVitoria.some(comb =>
    comb.every(i => tabuleiro[i] === jogadorAtual)
  );
}

function atualizarStatus() {
  statusText.textContent = `Vez de ${jogadorAtual === "X" ? nomeX : nomeO}`;
}

function atualizarPlacar() {
  document.getElementById("placarX").textContent = `❌ ${placar.X}`;
  document.getElementById("placarO").textContent = `⭕ ${placar.O}`;
}

function reiniciarJogo(semResetPlacar = false) {
  tabuleiro = ["", "", "", "", "", "", "", "", ""];
  jogadorAtual = "X";
  jogoAtivo = true;
  statusText.textContent = "";
  cells.forEach(cell => (cell.textContent = ""));
  if (!semResetPlacar) {
    placar = { X: 0, O: 0 };
    atualizarPlacar();
  }
  atualizarStatus();
}

cells.forEach(cell => {
  cell.addEventListener("click", clicarNaCelula);
});
const socket = io();  // Conecta ao servidor usando o Socket.IO

// Exemplo de emitir um evento quando o jogador faz uma jogada
function fazerJogada(jogada) {
  socket.emit('move', jogada);  // Envia a jogada para o servidor
}

// Ouvir as jogadas dos outros jogadores
socket.on('move', (data) => {
  // Lógica para atualizar o jogo com a jogada recebida
  console.log(data);
});



