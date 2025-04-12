const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
let jogadorAtual = "X";  // Jogador X começa
let jogoAtivo = true;
let tabuleiro = ["", "", "", "", "", "", "", "", ""];
let nomeX = "Jogador X";
let nomeO = "Jogador O";
const clickSound = new Audio('https://www.soundjay.com/button/sounds/button-16.mp3');

const combinacoesVitoria = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

// Conectar ao servidor via Socket.io
const socket = io(); 

function startGame() {
  nomeX = document.getElementById("nomeX").value || "Jogador X";
  nomeO = document.getElementById("nomeO").value || "Jogador O";
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  atualizarStatus();
  
  // Iniciar a partida enviando o nome dos jogadores para o servidor
  socket.emit('iniciar_partida', { nomeX, nomeO });
}

function mostrarInstrucoes() {
  alert("Alinhe três símbolos (❌ ou ⭕) para vencer.");
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

  // Envia o movimento para o servidor
  socket.emit('movimento', { index, jogador: jogadorAtual });

  if (verificarVitoria()) {
    statusText.textContent = `${jogadorAtual === "X" ? nomeX : nomeO} venceu!`;
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
  atualizarStatus();
}

// Ouvir as jogadas enviadas pelos outros jogadores
socket.on('movimento', (data) => {
  const { index, jogador } = data;
  tabuleiro[index] = jogador;
  cells[index].textContent = jogador === "X" ? "❌" : "⭕";
  jogadorAtual = jogador === "X" ? "O" : "X"; // Alterna entre os jogadores
  atualizarStatus();

  if (verificarVitoria()) {
    statusText.textContent = `${jogador === "X" ? nomeX : nomeO} venceu!`;
    jogoAtivo = false;
    return;
  }

  if (!tabuleiro.includes("")) {
    statusText.textContent = "Empate!";
    jogoAtivo = false;
    return;
  }
});

cells.forEach(cell => {
  cell.addEventListener("click", clicarNaCelula);
});
socket.on('connect', () => {
  console.log('Conectado ao servidor!');
});

socket.on('disconnect', () => {
  console.log('Desconectado do servidor!');
});




