// autonomous.js

document.addEventListener("DOMContentLoaded", () => {
  if (!window.readDraft || !window.saveSection) {
    console.warn("[autonomous] draft-utils não encontrados.");
    return;
  }

  const btnYes = document.getElementById("crossYes");
  const btnNo = document.getElementById("crossNo");
  const qtyAge = document.getElementById("qtyAge");
  const qtyPre = document.getElementById("qtyPre");
  const nextBtn = document.getElementById("nextBtn");

  let crossedLine = null;

  // SIM / NÃO
  btnYes.addEventListener("click", () => {
    crossedLine = true;
    btnYes.classList.add("active");
    btnNo.classList.remove("active");
  });

  btnNo.addEventListener("click", () => {
    crossedLine = false;
    btnNo.classList.add("active");
    btnYes.classList.remove("active");
  });

  nextBtn.addEventListener("click", () => {
    const draft = readDraft();

    if (!draft) {
      alert("Nenhum registro ativo. Volte para a primeira página.");
      return;
    }

    if (crossedLine === null) {
      alert("Informe se o robô ultrapassou a linha.");
      return;
    }

    // ✅ SALVA NA SEÇÃO CORRETA
    saveSection("auto", {
      crossedLine: crossedLine,
      artefatosIdadeMedia: Number(qtyAge.value || 0),
      artefatosPreHistoricos: Number(qtyPre.value || 0)
    });

    console.log("✅ AUTO SALVO:", readDraft().auto);

    // segue o fluxo
    window.location.href = "teleop.html";
  });
});
