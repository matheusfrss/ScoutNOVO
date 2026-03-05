// endgame.js
// Compatível com draft-utils.js

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

  // =========================
  // ELEMENTOS
  // =========================

  const finishBtn = document.getElementById("finishBtn");

  const volumeCiclo = document.getElementById("volumeCiclo");
  const nivelClimber = document.getElementById("nivelClimber");
  const observacoes = document.getElementById("observacoes");

  const climbYes = document.getElementById("climbYes");
  const climbNo = document.getElementById("climbNo");

  const yellowYes = document.getElementById("yellowYes");
  const yellowNo = document.getElementById("yellowNo");

  const fuelAzul = document.getElementById("fuelAzul");
  const fuelVermelho = document.getElementById("fuelVermelho");

  const maisFuelAzul = document.getElementById("maisFuelAzul");
  const menosFuelAzul = document.getElementById("menosFuelAzul");

  const maisFuelVermelho = document.getElementById("maisFuelVermelho");
  const menosFuelVermelho = document.getElementById("menosFuelVermelho");

  const modal = document.getElementById("modal");
  const fuelTitle = document.getElementById("fuelTitle");
  const closeModal = document.getElementById("closeModal");

  // =========================
  // VALIDAÇÃO DOM
  // =========================

  const required = [
    finishBtn,
    nivelClimber,
    observacoes,
    climbYes,
    climbNo,
    yellowYes,
    yellowNo
  ];

  if (required.some(el => !el)) {
    console.error("[endgame] Elementos não encontrados no DOM.");
    return;
  }

  // =========================
  // ESTADOS
  // =========================

  let tentouEscalar = null;
  let cartaoAmarelo = null;

  // =========================
  // FUNÇÃO TOGGLE
  // =========================

  function togglePair(yesBtn, noBtn, setter, value) {

    yesBtn.classList.remove("active");
    noBtn.classList.remove("active");

    if (value === true) yesBtn.classList.add("active");
    else noBtn.classList.add("active");

    setter(value);
  }

  // =========================
  // EVENTOS TOGGLE
  // =========================

  climbYes.addEventListener("click", () =>
    togglePair(climbYes, climbNo, v => tentouEscalar = v, true)
  );

  climbNo.addEventListener("click", () =>
    togglePair(climbYes, climbNo, v => tentouEscalar = v, false)
  );

  yellowYes.addEventListener("click", () =>
    togglePair(yellowYes, yellowNo, v => cartaoAmarelo = v, true)
  );

  yellowNo.addEventListener("click", () =>
    togglePair(yellowYes, yellowNo, v => cartaoAmarelo = v, false)
  );

  // =========================
  // BOTÕES TOGGLE DE INPUT
  // =========================

  document.querySelectorAll(".toggle-btn[data-target]").forEach(btn => {

    btn.addEventListener("click", () => {

      const targetId = btn.getAttribute("data-target");
      const value = btn.getAttribute("data-value");

      const targetInput = document.getElementById(targetId);

      if (!targetInput) return;

      document
        .querySelectorAll(`.toggle-btn[data-target="${targetId}"]`)
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      targetInput.value = value;

      targetInput.dispatchEvent(new Event("change"));
    });

  });

  // =========================
  // CONTROLE DE FUEL
  // =========================

  if (maisFuelAzul)
    maisFuelAzul.onclick = () => {
      fuelAzul.value = Number(fuelAzul.value || 0) + 1;
    };

  if (menosFuelAzul)
    menosFuelAzul.onclick = () => {
      fuelAzul.value = Math.max(0, Number(fuelAzul.value || 0) - 1);
    };

  if (maisFuelVermelho)
    maisFuelVermelho.onclick = () => {
      fuelVermelho.value = Number(fuelVermelho.value || 0) + 1;
    };

  if (menosFuelVermelho)
    menosFuelVermelho.onclick = () => {
      fuelVermelho.value = Math.max(0, Number(fuelVermelho.value || 0) - 1);
    };

  // =========================
  // MODAL FUEL
  // =========================

  if (fuelAzul) {
    fuelAzul.addEventListener("click", () => {
      fuelTitle.innerText = "Fuel Azul";
      modal.style.display = "flex";
    });
  }

  if (fuelVermelho) {
    fuelVermelho.addEventListener("click", () => {
      fuelTitle.innerText = "Fuel Vermelho";
      modal.style.display = "flex";
    });
  }

  if (closeModal) {
    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  // =========================
  // FINALIZAR SCOUT
  // =========================

  finishBtn.addEventListener("click", async () => {

    const draft = readDraft();

    if (!draft) {
      alert("Nenhum registro ativo.");
      return;
    }

    if (tentouEscalar === null) {
      alert("Informe se tentou escalar.");
      return;
    }

    if (tentouEscalar === true && !nivelClimber.value) {
      alert("Selecione o nível do climber.");
      return;
    }

    if (cartaoAmarelo === null) {
      alert("Informe se recebeu cartão amarelo.");
      return;
    }

    // =========================
    // SALVAR ENDGAME NO DRAFT
    // =========================

    saveSection("endgame", {

      volumeCiclo: volumeCiclo ? volumeCiclo.value : null,

      tentouEscalar: tentouEscalar,

      nivelClimber: tentouEscalar
        ? nivelClimber.value
        : null,

      cartaoAmarelo: cartaoAmarelo,

      fuelAzul: fuelAzul
        ? Number(fuelAzul.value || 0)
        : 0,

      fuelVermelho: fuelVermelho
        ? Number(fuelVermelho.value || 0)
        : 0,

      observacoes: observacoes.value.trim()

    });

    const finalDraft = readDraft();

    console.log("📤 Enviando draft completo:", finalDraft);

    // =========================
    // ENVIO PARA API
    // =========================

    try {

      const response = await fetch(`${API_URL}/api/salvar_robo`, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(finalDraft)

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

      console.error("Erro ao enviar:", error);

      alert(
        "Erro ao enviar dados.\n\n" +
        "Os dados NÃO foram perdidos.\n\n" +
        error.message
      );

    }

  });

});