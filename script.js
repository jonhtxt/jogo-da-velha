const clickSound = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_b2bd4f274d.mp3');

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const placarX = document.getElementById("placar-x");
const placarO = document.getElementById("placar-o");

let jogadorAtual = "X";
let jogoAtivo = true;
let tabuleiro = ["", "", "", "", "", "", "", "", ""];
let vitoriasX = 0;
let vitoriasO = 0;

const combinacoesVitoria = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

cells.forEach(cell => {
  cell.addEventListener("click", clicarNaCelula);
});

function clicarNaCelula(e) {
  const index = e.target.dataset.index;
  if (tabuleiro[index] !== "" || !jogoAtivo || jogadorAtual !== "X") return;

  fazerJogada(index);
  if (jogoAtivo) setTimeout(botJogar, 500); // Bot joga depois de 0.5s
}

function fazerJogada(index) {
  tabuleiro[index] = jogadorAtual;
  cells[index].textContent = jogadorAtual;
  clickSound.play();

  if (verificarVitoria()) {
    statusText.textContent = `Jogador ${jogadorAtual} venceu!`;
    jogoAtivo = false;
    atualizarPlacar();
  } else if (!tabuleiro.includes("")) {
    statusText.textContent = "Empate!";
    jogoAtivo = false;
  } else {
    jogadorAtual = jogadorAtual === "X" ? "O" : "X";
    statusText.textContent = `Vez do jogador ${jogadorAtual}`;
  }
}

function botJogar() {
  if (!jogoAtivo) return;

  let jogadasDisponiveis = tabuleiro
    .map((valor, i) => valor === "" ? i : null)
    .filter(i => i !== null);

  if (jogadasDisponiveis.length === 0) return;

  let escolha = jogadasDisponiveis[Math.floor(Math.random() * jogadasDisponiveis.length)];
  fazerJogada(escolha);
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
  statusText.textContent = "Vez do jogador X";
  cells.forEach(cell => (cell.textContent = ""));
}

function atualizarPlacar() {
  if (jogadorAtual === "X") {
    vitoriasX++;
    placarX.textContent = vitoriasX;
  } else {
    vitoriasO++;
    placarO.textContent = vitoriasO;
  }
}

const themeToggleButton = document.getElementById('theme-toggle');
themeToggleButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});
function startGame() {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-container").style.display = "block";
}

function mostrarInstrucoes() {
  alert("O jogador que alinhar 3 símbolos iguais primeiro vence.");
}

function mostrarSobre() {
  alert("Feito por Jonata. Um projeto com HTML, CSS e JavaScript.");
}



