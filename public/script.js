const socket = io(),
    cells = document.querySelectorAll(".cell"),
    statusText = document.getElementById("status");

let jogadorAtual = "X",
    jogoAtivo = true,
    placar = { X: 0, O: 0 },
    tabuleiro = ["", "", "", "", "", "", "", "", ""],
    nomeX = "Jogador X",
    nomeO = "Jogador O";

const clickSound = new Audio("audio/button-16.mp3"),  // Áudio local
      combinacoesVitoria = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];

let usuariosJogadores = [];  // Lista de jogadores já cadastrados

async function carregarHistorico() {
  const res = await fetch("/players");
  const nomes = await res.json();
  const lista = document.getElementById("lista-jogadores");
  lista.innerHTML = nomes.map(n => `<li>${n}</li>`).join("");
}

window.addEventListener("load", carregarHistorico);

async function salvarJogador(nome) {
  await fetch("/add-player", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: nome })
  });
}

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

  fetch("/verificar-nomes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nomeX, nomeO })
  })
  .then(res => res.json())
  .then(resultado => {
    if (!resultado.ok) {
      alert(resultado.mensagem);
      return;
    }

    usuariosJogadores.push(nomeX, nomeO);
    salvarJogador(nomeX);
    salvarJogador(nomeO);

    document.getElementById("start-screen").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    atualizarStatus();
  })
  .catch(error => {
    console.error("Erro ao verificar nomes:", error);
    alert("Houve um erro ao tentar iniciar o jogo. Tente novamente.");
  });
}

function clicarNaCelula(e) {
  const index = e.target.dataset.index;
  
  // Impede que o jogador clique na célula se já estiver ocupada ou se o jogo não estiver ativo
  if (tabuleiro[index] !== "" || !jogoAtivo || e.target.textContent !== "") return;

  // Verifica se é a vez do jogador atual antes de fazer o movimento
  if (jogadorAtual === "X" && e.target.textContent !== "❌" && e.target.textContent !== "⭕") {
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
      empateSound.play?.();
    } else {
      jogadorAtual = jogadorAtual === "X" ? "O" : "X";
      atualizarStatus();
    }
  }
}


function destacarVitoria() {
  const combinacao = combinacoesVitoria.find(comb =>
    comb.every(i => tabuleiro[i] === jogadorAtual)
  );
  if (combinacao) {
    combinacao.forEach(i => cells[i].classList.add("vitoria"));
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
  const cell = cells[index];
  cell.textContent = jogador === "X" ? "❌" : "⭕";
  cell.classList.add("marcado");
  clickSound.play();

  if (verificarVitoria()) {
    statusText.textContent = `${jogador === "X" ? nomeX : nomeO} venceu!`;
    placar[jogador]++;
    atualizarPlacar();
    jogoAtivo = false;

    // Destacar células vencedoras
    const combinacao = combinacoesVitoria.find(comb => comb.every(i => tabuleiro[i] === jogador));
    if (combinacao) {
      combinacao.forEach(i => cells[i].classList.add("vitoria"));
    }
  } else if (!tabuleiro.includes("")) {
    statusText.textContent = "Empate!";
    jogoAtivo = false;
  } else {
    jogadorAtual = jogador === "X" ? "O" : "X";
    atualizarStatus();
  }
});

socket.on("reset", reiniciarJogo);

cells.forEach(cell => {
    cell.addEventListener("click", clicarNaCelula);
});
const emojis = {
  X: "😡", // Emoção de jogador X
  O: "😊", // Emoção de jogador O
};
// Substituindo ❌ e ⭕ por emojis
e.target.textContent = jogadorAtual === "X" ? emojis.X : emojis.O;
function atualizarStatus() {
  statusText.textContent = `Vez de ${(jogadorAtual === "X") ? nomeX : nomeO} ${(jogadorAtual === "X") ? emojis.X : emojis.O}`;
}
if (verificarVitoria()) {
  statusText.textContent = `${jogadorAtual === "X" ? nomeX : nomeO} venceu! 🎉 ${jogadorAtual === "X" ? emojis.X : emojis.O}`;
}
else if (!tabuleiro.includes("")) {
  statusText.textContent = "Empate! 🤝";
}







