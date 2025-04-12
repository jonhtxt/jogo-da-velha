const socket = io(),
      cells = document.querySelectorAll(".cell"),
      statusText = document.getElementById("status");

let jogadorAtual = "X",
    jogoAtivo = true,
    placar = { X: 0, O: 0 },
    tabuleiro = ["", "", "", "", "", "", "", "", ""],
    nomeX = "Jogador X",
    nomeO = "Jogador O",
    meuSimbolo = null;

const clickSound = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_9624b3e210.mp3"),
      vitoriaSound = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_c473660305.mp3"),
      empateSound = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_7cc80f33d3.mp3");

const combinacoesVitoria = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

async function startGame() {
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

  try {
    const resposta = await fetch("/verificar-nomes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomeX, nomeO })
    });

    const resultado = await resposta.json();

    if (!resultado.ok) {
      alert(resultado.mensagem);
      return;
    }

    // Atribui o símbolo a quem iniciou
    meuSimbolo = "X";

    document.getElementById("start-screen").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    atualizarStatus();
    carregarHistorico();

  } catch (error) {
    alert("Erro ao verificar nomes.");
    console.error(error);
  }
}

function clicarNaCelula(e) {
  const index = e.target.dataset.index;

  // Impede se:
  // - a célula já está marcada
  // - o jogo acabou
  // - não é a vez deste jogador
  if (tabuleiro[index] !== "" || !jogoAtivo || jogadorAtual !== meuSimbolo) return;

  tabuleiro[index] = jogadorAtual;
  e.target.textContent = jogadorAtual === "X" ? "❌" : "⭕";
  e.target.classList.add("played");
  clickSound.play();

  socket.emit("move", { index, jogador: jogadorAtual });
}


function destacarVitoria() {
  const combinacao = combinacoesVitoria.find(comb =>
    comb.every(i => tabuleiro[i] === jogadorAtual)
  );
  if (combinacao) {
    combinacao.forEach(i => cells[i].classList.add("vitoria"));
    vitoriaSound.play();
  }
}

function atualizarStatus() {
  statusText.textContent = `🎯 Vez de ${(jogadorAtual === "X") ? nomeX : nomeO}`;
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
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("vitoria", "played", "marcado");
  });
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
    destacarVitoria();
  } else if (!tabuleiro.includes("")) {
    statusText.textContent = "Empate!";
    empateSound.play();
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

async function carregarHistorico() {
  try {
    const res = await fetch("/players");
    const nomes = await res.json();
    const lista = document.getElementById("lista-jogadores");
    if (lista) {
      lista.innerHTML = nomes.map(n => `<li>🎮 ${n}</li>`).join("");
    }
  } catch (err) {
    console.error("Erro ao carregar histórico:", err);
  }
}
socket.on("atribuir-simbolo", simbolo => {
  meuSimbolo = simbolo;
  console.log("Você é o jogador:", simbolo);
});






