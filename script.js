const clickSound = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_b2bd4f274d.mp3');

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

cells.forEach(cell => {
  cell.addEventListener("click", clicarNaCelula);
});

function clicarNaCelula(e) {
  const index = e.target.dataset.index;
  if (tabuleiro[index] !== "" || !jogoAtivo) return;

  clickSound.play();

  tabuleiro[index] = jogadorAtual;
  e.target.textContent = jogadorAtual;

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
  statusText.textContent = "Vez do jogador X";
  cells.forEach(cell => (cell.textContent = ""));
}

// Botão de alternar tema
const themeToggleButton = document.getElementById('theme-toggle');
themeToggleButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});
