// inicio.js
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

    // ✅ AQUI É O CORRETO
    initDraft({
      matchNumber,
      teamNumber,
      nomeScoute,
      matchType,
      alliance,
      startingPosition,
      criadoEm: new Date().toISOString()
    });

    console.log("Draft criado:", readDraft());

    window.location.href = "autonomous.html";
  });
});
