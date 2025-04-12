const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
let jogadorAtual = "X";
let jogoAtivo = true;
let tabuleiro = ["", "", "", "", "", "", "", "", ""];

const combinacoesVitoria = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

// Som
const clickSound = new Audio('https://www.soundjay.com/button/sounds/button-16.mp3');

cells.forEach(cell => {
  cell.addEventListener("click", clicarNaCelula);
});

function clicarNaCelula(e) {
  const index = e.target.dataset.index;
  if (tabuleiro[index] !== "" || !jogoAtivo) return;

  tabuleiro[index] = jogadorAtual;
  e.target.textContent = jogadorAtual;
  clickSound.play();

  if (verificarVitoria()) {
    statusText.textContent = `Jogador ${jogadorAtual} venceu!`;
    jogoAtivo = false;
  } else if (!tabuleiro.includes("")) {
    statusText.textContent = "Empate!";
    jogoAtivo = false;
  } else {
    jogadorAtual = jogadorAtual === "X" ? "O" : "X";
    statusText.textContent = `Vez do jogador ${jogadorAtual}`;
  }
}

function verificarVitoria() {
  return combinacoesVitoria.some(combinacao => {
    return combinacao.every(i => tabuleiro[i] === jogadorAtual);
  });
}

function reiniciarJogo() {
  tabuleiro = ["", "", "", "", "", "", "", "", ""];
  jogadorAtual = "X";
  jogoAtivo = true;
  statusText.textContent = "";
  cells.forEach(cell => (cell.textContent = ""));
}

// ===== TELA INICIAL =====
function startGame() {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-container").style.display = "block";
}

function mostrarInstrucoes() {
  alert("O jogador que alinhar 3 símbolos iguais primeiro vence.");
}

function mostrarSobre() {
  alert("Feito por Jonata. Um projeto em HTML, CSS e JavaScript.");
}



