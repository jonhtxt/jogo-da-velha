const socket = io();
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");

let jogadorAtual = "";
let jogoAtivo = false;
let tabuleiro = ["", "", "", "", "", "", "", "", ""];
let nomeX = "Jogador X";
let nomeO = "Jogador O";

const clickSound = new Audio("https://www.soundjay.com/button/sounds/button-16.mp3");

function startGame() {
  nomeX = document.getElementById("nomeX").value.trim();
  nomeO = document.getElementById("nomeO").value.trim();

  if (!nomeX || !nomeO) {
    alert("Ambos os jogadores precisam inserir seus nomes.");
    return;
  }

  if (nomeX === nomeO) {
    alert("Os nomes dos jogadores devem ser diferentes.");
    return;
  }

  socket.emit('verificar-nomes', { nomeX, nomeO });
}

socket.on("atribuir-simbolo", (simbolo) => {
  jogadorAtual = simbolo;
  statusText.textContent = `Vez de ${simbolo === "X" ? nomeX : nomeO}`;
  jogoAtivo = true;
});

socket.on('iniciar-partida', ({ tabuleiro, jogadorInicial }) => {
  tabuleiro = tabuleiro;  // Atualiza o estado inicial do tabuleiro
  statusText.textContent = `Vez de ${jogadorInicial === "X" ? nomeX : nomeO}`;
  atualizaTabuleiro();
});

socket.on('atualizar-jogo', ({ index, jogador }) => {
  tabuleiro[index] = jogador;
  cells[index].textContent = jogador === "X" ? "❌" : "⭕";
  clickSound.play();
  verificarVitoria(jogador);
});

socket.on('fim-partida', (mensagem) => {
  statusText.textContent = mensagem;
  jogoAtivo = false;
});

socket.on('reset-jogo', () => {
  tabuleiro = ["", "", "", "", "", "", "", "", ""];
  atualizaTabuleiro();
  jogoAtivo = true;
});

cells.forEach(cell => {
  cell.addEventListener("click", (e) => {
    if (!jogoAtivo) return;

    const index = e.target.dataset.index;

    if (tabuleiro[index] !== "") return; // Previne marcação de uma célula já preenchida

    tabuleiro[index] = jogadorAtual;
    e.target.textContent = jogadorAtual === "X" ? "❌" : "⭕";
    socket.emit("move", { index, jogador: jogadorAtual });
  });
});

function atualizaTabuleiro() {
  cells.forEach((cell, index) => {
    cell.textContent = tabuleiro[index] === "X" ? "❌" : tabuleiro[index] === "O" ? "⭕" : "";
  });
}

function verificarVitoria(jogador) {
  const combinacoesVitoria = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const vitoria = combinacoesVitoria.find(comb => comb.every(i => tabuleiro[i] === jogador));

  if (vitoria) {
    vitoria.forEach(i => cells[i].classList.add("vitoria"));
    statusText.textContent = `${jogador === "X" ? nomeX : nomeO} venceu!`;
    jogoAtivo = false;
  }
}





