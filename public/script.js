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

// Função que inicia o jogo
async function startGame() {
  // Obtenha os valores dos nomes dos jogadores
  nomeX = document.getElementById("nomeX").value.trim();
  nomeO = document.getElementById("nomeO").value.trim();

  // Verifique se os nomes são preenchidos
  if (!nomeX || !nomeO) {
    alert("Ambos os jogadores precisam inserir seus nomes.");
    return;
  }

  // Verifique se os nomes são diferentes
  if (nomeX === nomeO) {
    alert("Os nomes dos jogadores devem ser diferentes.");
    return;
  }

  // Verifique se os nomes são únicos
  const resposta = await fetch("/verificar-nomes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nomeX, nomeO })
  });

  const resultado = await resposta.json();

  // Se a resposta for negativa, mostre a mensagem
  if (!resultado.ok) {
    alert(resultado.mensagem);
    return;
  }

  // Se tudo estiver certo, inicie o jogo
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  atualizarStatus();
  salvarJogador(nomeX); // Salve o jogador X
  salvarJogador(nomeO); // Salve o jogador O
}

// Função que lida com os cliques nas células
function clicarNaCelula(e) {
  const index = e.target.dataset.index;
  if (tabuleiro[index] !== "" || !jogoAtivo) return;

  tabuleiro[index] = jogadorAtual;
  e.target.textContent = jogadorAtual === "X" ? "❌" : "⭕";
  e.target.classList.add("played");
  clickSound.play();

  socket.emit("move", { index, jogador: jogadorAtual });

  if (verificarVitoria()) {
    statusText.textContent = `${jogadorAtual === "X" ? nomeX : nomeO} venceu!`;
    placar[jogadorAtual]++;
    atualizarPlacar();
    jogoAtivo = false;

    destacarVitoria();
  } else if (!tabuleiro.includes("")) {
    statusText.textContent = "Empate!";
    jogoAtivo = false;
    empateSound.play?.(); // Adicione se quiser som de empate
  } else {
    jogadorAtual = jogadorAtual === "X" ? "O" : "X";
    atualizarStatus();
  }
}

// Destacar as células que formaram a vitória
function destacarVitoria() {
  const combinacao = combinacoesVitoria.find(comb =>
    comb.every(i => tabuleiro[i] === jogadorAtual)
  );
  if (combinacao) {
    combinacao.forEach(i => {
      cells[i].classList.add("vitoria");
    });
    vitoriaSound.play?.(); // Se quiser som de vitória
  }
}

// Atualizar o status do jogo (quem está jogando)
function atualizarStatus() {
    statusText.textContent = `Vez de ${(jogadorAtual === "X") ? nomeX : nomeO}`;
}

// Função para verificar se houve vitória
function verificarVitoria() {
    return combinacoesVitoria.some(comb => comb.every(i => tabuleiro[i] === jogadorAtual));
}

// Atualizar o placar
function atualizarPlacar() {
    document.getElementById("placarX").textContent = `❌ ${placar.X}`;
    document.getElementById("placarO").textContent = `⭕ ${placar.O}`;
}

// Função para reiniciar o jogo
function reiniciarJogo() {
    tabuleiro = ["", "", "", "", "", "", "", "", ""];
    jogadorAtual = "X";
    jogoAtivo = true;
    cells.forEach(cell => cell.textContent = "");
    atualizarStatus();
    socket.emit("reset");
}

// Voltar ao menu
function voltarAoMenu() {
    document.getElementById("game-container").style.display = "none";
    document.getElementById("start-screen").style.display = "flex";
    reiniciarJogo();
}

// Atualizar o jogo a partir de um movimento recebido do servidor
socket.on("move", ({ index, jogador }) => {
  tabuleiro[index] = jogador;
  const cell = cells[index];
  cell.textContent = jogador === "X" ? "❌" : "⭕";
  cell.classList.add("marcado");
  clickSound.play();

  if (verificarVitoria()) {
    statusText.textContent = `${jogador === "X" ? nomeX : nomeO} venceu!`;
    placar[jogador]++;
    atualizarPlacar();
    jogoAtivo = false;
    vitoriaSound.play();

    // Destacar células vencedoras
    const combinacao = combinacoesVitoria.find(comb => comb.every(i => tabuleiro[i] === jogador));
    if (combinacao) {
      combinacao.forEach(i => cells[i].classList.add("vitoria"));
    }
  } else if (!tabuleiro.includes("")) {
    statusText.textContent = "Empate!";
    empateSound.play();
    jogoAtivo = false;
  } else {
    jogadorAtual = jogador === "X" ? "O" : "X";
    atualizarStatus();
  }
});

// Resetar o jogo
socket.on("reset", reiniciarJogo);

// Carregar o histórico de jogadores
async function carregarHistorico() {
  const res = await fetch("/players");
  const nomes = await res.json();
  const lista = document.getElementById("lista-jogadores");
  lista.innerHTML = nomes.map(n => `<li>${n}</li>`).join("");
}

window.addEventListener("load", carregarHistorico);







