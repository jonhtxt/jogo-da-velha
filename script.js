const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
let jogadorAtual = "X";
let jogoAtivo = true;
let contraBot = true;
let tabuleiro = ["", "", "", "", "", "", "", "", ""];
const clickSound = new Audio('https://www.soundjay.com/button/sounds/button-16.mp3');

const combinacoesVitoria = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

function startGame() {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-container").style.display = "block";
}

function mostrarInstrucoes() {
  alert("Alinhe três símbolos para vencer. Contra o bot, você joga com X.");
}

function mostrarSobre() {
  alert("Criado por Jonata com HTML, CSS e JavaScript.");
}

function clicarNaCelula(e) {
  const index = e.target.dataset.index;
  if (tabuleiro[index] !== "" || !jogoAtivo) return;

  tabuleiro[index] = jogadorAtual;
  e.target.textContent = jogadorAtual;
  clickSound.play();

  if (verificarVitoria()) {
    statusText.textContent = `Jogador ${jogadorAtual} venceu!`;
    jogoAtivo = false;
    return;
  }

  if (!tabuleiro.includes("")) {
    statusText.textContent = "Empate!";
    jogoAtivo = false;
    return;
  }

  jogadorAtual = jogadorAtual === "X" ? "O" : "X";
  statusText.textContent = `Vez do jogador ${jogadorAtual}`;

  if (contraBot && jogadorAtual === "O") {
    setTimeout(botJogar, 500);
  }
}

function botJogar() {
  if (!jogoAtivo) return;

  let indicesDisponiveis = tabuleiro
    .map((val, i) => val === "" ? i : null)
    .filter(i => i !== null);

  let index = indicesDisponiveis[Math.floor(Math.random() * indicesDisponiveis.length)];

  tabuleiro[index] = "O";
  cells[index].textContent = "O";
  clickSound.play();

  if (verificarVitoria()) {
    statusText.textContent = `Jogador O venceu!`;
    jogoAtivo = false;
  } else if (!tabuleiro.includes("")) {
    statusText.textContent = "Empate!";
    jogoAtivo = false;
  } else {
    jogadorAtual = "X";
    statusText.textContent = `Vez do jogador ${jogadorAtual}`;
  }
}

function verificarVitoria() {
  return combinacoesVitoria.some(combinacao =>
    combinacao.every(i => tabuleiro[i] === jogadorAtual)
  );
}

function reiniciarJogo() {
  tabuleiro = ["", "", "", "", "", "", "", "", ""];
  jogadorAtual = "X";
  jogoAtivo = true;
  statusText.textContent = "";
  cells.forEach(cell => (cell.textContent = ""));
}

// Adiciona os eventos
cells.forEach(cell => {
  cell.addEventListener("click", clicarNaCelula);
});



