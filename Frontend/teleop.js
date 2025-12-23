// teleop.js

document.addEventListener("DOMContentLoaded", () => {
  // segurança: draft-utils precisa existir
  if (typeof readDraft !== "function" || typeof saveSection !== "function") {
    console.warn("[teleop] draft-utils não encontrado.");
    return;
  }

  const nextBtn = document.getElementById("nextBtn");
  const backBtn = document.getElementById("backBtn");

  const qtyAgeTele = document.getElementById("qtyAgeTele");
  const qtyPreTele = document.getElementById("qtyPreTele");

  // botão voltar
  backBtn?.addEventListener("click", () => {
    const href = backBtn.dataset.href;
    if (href) window.location.href = href;
  });

  // botão próximo
  nextBtn?.addEventListener("click", () => {
    const draft = readDraft();

    if (!draft) {
      alert("Nenhum registro ativo. Volte para o início.");
      return;
    }

    saveSection("teleop", {
      artefatosMedios: Number(qtyAgeTele?.value || 0),
      artefatosPreHistoricos: Number(qtyPreTele?.value || 0)
    });

    const href = nextBtn.dataset.href;
    if (href) window.location.href = href;
  });
});
