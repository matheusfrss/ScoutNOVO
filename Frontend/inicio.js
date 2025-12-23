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
    blue.setAttribute("aria-pressed", "false");
    red.setAttribute("aria-pressed", "false");
    blue.classList.remove("selected");
    red.classList.remove("selected");

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
    const matchNumber = document.getElementById("matchNumber")?.value;
    const teamNumber = document.getElementById("teamNumber")?.value;

    const matchType = document.querySelector(".seg-btn.active")?.dataset.type;
    const startPos = document.querySelector(".pos-btn.active")?.dataset.pos;
    const alliance =
      blue.getAttribute("aria-pressed") === "true"
        ? "blue"
        : red.getAttribute("aria-pressed") === "true"
        ? "red"
        : null;

    if (!scouter || !matchNumber || !teamNumber || !matchType || !startPos || !alliance) {
      alert("Preencha TODAS as informações antes de continuar.");
      return;
    }

    // salva no draft central
    initDraft({
      scouter,
      matchNumber: Number(matchNumber),
      teamNumber: Number(teamNumber),
      matchType,
      alliance,
      startPos,
      criadoEm: new Date().toISOString()
    });

    window.location.href = "autonomous.html";
  });
});
