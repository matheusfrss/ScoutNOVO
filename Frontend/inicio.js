// inicio.js - VERSÃO CORRIGIDA
document.addEventListener("DOMContentLoaded", () => {
  const nextBtn = document.getElementById("nextBtn");

  const segBtns = document.querySelectorAll(".seg-btn");
  const posBtns = document.querySelectorAll(".pos-btn");
  const blue = document.getElementById("blueAlliance");
  const red = document.getElementById("redAlliance");

  // ===== helpers visuais =====
  function activateGroup(list, target) {
    list.forEach(btn => btn.classList.toggle("active", btn === target));
  }

  function toggleAlliance(btn) {
    [blue, red].forEach(b => {
      b.setAttribute("aria-pressed", "false");
      b.classList.remove("selected");
    });

    btn.setAttribute("aria-pressed", "true");
    btn.classList.add("selected");
  }

  // ===== eventos =====
  segBtns.forEach(btn =>
    btn.addEventListener("click", () => activateGroup(segBtns, btn))
  );

  posBtns.forEach(btn =>
    btn.addEventListener("click", () => activateGroup(posBtns, btn))
  );

  blue.addEventListener("click", () => toggleAlliance(blue));
  red.addEventListener("click", () => toggleAlliance(red));

  // ===== botão próximo =====
  nextBtn.addEventListener("click", () => {
    const scouter = document.getElementById("scouter")?.value.trim();
    const matchNumber = Number(document.getElementById("matchNumber")?.value);
    const teamNumber = Number(document.getElementById("teamNumber")?.value);

    const matchType = document.querySelector(".seg-btn.active")?.dataset.type;
    const startingPosition =
      document.querySelector(".pos-btn.active")?.dataset.pos;

    const alliance =
      blue.getAttribute("aria-pressed") === "true"
        ? "blue"
        : red.getAttribute("aria-pressed") === "true"
        ? "red"
        : null;

    if (
      !scouter ||
      !matchNumber ||
      !teamNumber ||
      !matchType ||
      !startingPosition ||
      !alliance
    ) {
      alert("Preencha TODAS as informações antes de continuar.");
      return;
    }

    // ✅ CORREÇÃO: Passa apenas o objeto 'basic' para initDraft()
    initDraft({
      matchNumber: matchNumber,
      teamNumber: teamNumber,
      scouter: scouter,
      matchType: matchType,
      alliance: alliance,
      startingPosition: startingPosition
    });

    // DEBUG: Verifique se o draft foi salvo corretamente
    const draft = readDraft();
    console.log("✅ Draft criado:", draft);
    console.log("📋 Basic salvo:", draft?.basic);
    console.log("🔍 matchNumber existe?", draft?.basic?.matchNumber);
    console.log("🔍 teamNumber existe?", draft?.basic?.teamNumber);

    window.location.href = "autonomous.html";
  });
});


// ===== LOGIN / RESET =====
const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");
const adminPasswordInput = document.getElementById("adminPasswordInput");
const adminConfirmBtn = document.getElementById("adminConfirmBtn");
const adminCancelBtn = document.getElementById("adminCancelBtn");

loginBtn.addEventListener("click", () => {
  loginModal.style.display = "flex";
  adminPasswordInput.value = "";
  adminPasswordInput.focus();
});

adminCancelBtn.addEventListener("click", () => {
  loginModal.style.display = "none";
});

adminConfirmBtn.addEventListener("click", async () => {
  const senha = adminPasswordInput.value;

  if (!senha) {
    alert("Digite a senha");
    return;
  }

  const confirmar = confirm(
    "⚠️ ISSO VAI APAGAR TODOS OS DADOS.\n\nDeseja continuar?"
  );

  if (!confirmar) return;

  try {
    const response = await fetch(
      "http://localhost:3080/api/reset_competicao",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ senha })
      }
    );

    const result = await response.json();

    if (result.status === "ok") {
      alert("✅ Banco de dados resetado com sucesso!");
      loginModal.style.display = "none";
    } else {
      alert("❌ " + result.mensagem);
    }

  } catch (err) {
    alert("Erro ao resetar banco de dados");
  }
});
