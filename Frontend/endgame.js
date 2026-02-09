// endgame.js (COMPATÍVEL COM SEU endgame.html)

const API_URL = "https://scoutnovo.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  if (
    typeof readDraft !== "function" ||
    typeof saveSection !== "function" ||
    typeof clearDraft !== "function"
  ) {
    console.warn("[endgame] draft-utils não encontrado.");
    return;
  }

  const finishBtn = document.getElementById("finishBtn");

  // inputs (agora podem ser hidden, mas o id é o mesmo)
  const volumeCiclo = document.getElementById("volumeCiclo");
  const nivelClimber = document.getElementById("nivelClimber");
  const observacoes = document.getElementById("observacoes");

  // toggles
  const climbYes = document.getElementById("climbYes");
  const climbNo = document.getElementById("climbNo");

  const yellowYes = document.getElementById("yellowYes");
  const yellowNo = document.getElementById("yellowNo");

  // valida DOM
  const required = [
    finishBtn,
    volumeCiclo,
    nivelClimber,
    observacoes,
    climbYes,
    climbNo,
    yellowYes,
    yellowNo,
  ];

  if (required.some((el) => !el)) {
    console.error("[endgame] Alguns elementos não foram encontrados no DOM.");
    return;
  }

  // estados
  let tentouEscalar = null; // boolean
  let cartaoAmarelo = null; // boolean

  // helper visual pra toggle sim/não
  function togglePair(yesBtn, noBtn, setter, value) {
    yesBtn.classList.remove("active");
    noBtn.classList.remove("active");

    if (value === true) yesBtn.classList.add("active");
    else noBtn.classList.add("active");

    setter(value);
  }

  // eventos toggle
  climbYes.addEventListener("click", () =>
    togglePair(climbYes, climbNo, (v) => (tentouEscalar = v), true)
  );

  climbNo.addEventListener("click", () =>
    togglePair(climbYes, climbNo, (v) => (tentouEscalar = v), false)
  );

  yellowYes.addEventListener("click", () =>
    togglePair(yellowYes, yellowNo, (v) => (cartaoAmarelo = v), true)
  );

  yellowNo.addEventListener("click", () =>
    togglePair(yellowYes, yellowNo, (v) => (cartaoAmarelo = v), false)
  );

  // =========================================
  // ✅ NOVO: botões que preenchem os inputs hidden
  // - Mantém o ID volumeCiclo e nivelClimber
  // - Seu banco não quebra
  // =========================================
  document.querySelectorAll(".toggle-btn[data-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const value = btn.getAttribute("data-value");

      const targetInput = document.getElementById(targetId);
      if (!targetInput) return;

      // remove active do grupo
      document
        .querySelectorAll(`.toggle-btn[data-target="${targetId}"]`)
        .forEach((b) => b.classList.remove("active"));

      // ativa o clicado
      btn.classList.add("active");

      // salva valor no input (id do banco)
      targetInput.value = value;

      // dispara evento (caso algum código escute mudança)
      targetInput.dispatchEvent(new Event("change"));
    });
  });

  // finalizar
  finishBtn.addEventListener("click", async () => {
    const draft = readDraft();
    if (!draft) {
      alert("Nenhum registro ativo. Volte ao início.");
      return;
    }

    // validações
    if (!volumeCiclo.value) {
      alert("Selecione o Volume por ciclo.");
      return;
    }

    if (tentouEscalar === null) {
      alert("Informe se o robô tentou escalar.");
      return;
    }

    // se tentou escalar, precisa escolher nível
    if (tentouEscalar === true && !nivelClimber.value) {
      alert("Selecione o nível atingido no Climber.");
      return;
    }

    if (cartaoAmarelo === null) {
      alert("Informe se recebeu cartão amarelo.");
      return;
    }

    // salva endgame
    saveSection("endgame", {
      volumeCiclo: volumeCiclo.value,
      tentouEscalar,
      nivelClimber: tentouEscalar ? nivelClimber.value : null,
      cartaoAmarelo,
      observacoes: observacoes.value.trim(),
    });

    const finalDraft = readDraft();
    console.log("📤 Enviando draft COMPLETO:", finalDraft);

    try {
      const response = await fetch(`${API_URL}/api/salvar_robo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalDraft),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      alert("✅ " + (result.mensagem || "Dados enviados com sucesso!"));

      clearDraft();
      window.location.href = "index.html";
    } catch (error) {
      console.error("💥 Erro ao enviar:", error);
      alert(
        "Erro ao enviar os dados.\n" +
          "Os dados NÃO foram perdidos.\n\n" +
          error.message
      );
    }
  });
});
