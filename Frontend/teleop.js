// teleop.js

document.addEventListener("DOMContentLoaded", () => {
  // segurança: draft-utils precisa existir
  if (typeof readDraft !== "function" || typeof saveSection !== "function") {
    console.warn("[teleop] draft-utils não encontrado.");
    return;
  }

  const nextBtn = document.getElementById("nextBtn");
  const backBtn = document.getElementById("backBtn");

  const cicloPontuacao = document.getElementById("cicloPontuacao");
  const maisCiclo = document.getElementById("maisCiclo");

  // hidden inputs dos segmented
  const localLancamento = document.getElementById("localLancamento");
  const volumePorCiclo = document.getElementById("volumePorCiclo");
  const hubInativo = document.getElementById("hubInativo");

  // -------------------------
  // BOTÃO VOLTAR
  // -------------------------
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      const href = backBtn.dataset.href;
      if (href) window.location.href = href;
    });
  }

  // -------------------------
  // CICLO PONTUAÇÃO (+)
  // -------------------------
  if (cicloPontuacao && maisCiclo) {
    maisCiclo.addEventListener("click", () => {
      cicloPontuacao.value = Number(cicloPontuacao.value || 0) + 1;
    });
  }

  // -------------------------
  // SEGMENTED BUTTONS
  // -------------------------
  document.querySelectorAll(".segmented").forEach((group) => {
    const name = group.dataset.name;
    if (!name) return;

    const hidden = document.getElementById(name);
    if (!hidden) {
      console.warn(`[teleop] hidden input #${name} não encontrado.`);
      return;
    }

    group.querySelectorAll(".seg-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        // limpa ativos do grupo
        group.querySelectorAll(".seg-btn").forEach((b) =>
          b.classList.remove("active")
        );

        // marca o clicado
        btn.classList.add("active");

        // salva no hidden input
        hidden.value = btn.dataset.value || "";
      });
    });
  });

  // -------------------------
  // BOTÃO PRÓXIMO (SALVAR E IR)
  // -------------------------
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const draft = readDraft();
      if (!draft) {
        alert("Nenhum registro ativo. Volte para o início.");
        return;
      }

      // validações mínimas (pra não salvar vazio sem querer)
      if (!localLancamento?.value) {
        alert("Selecione o Local de lançamento.");
        return;
      }
      if (!volumePorCiclo?.value) {
        alert("Selecione o Volume por ciclo.");
        return;
      }
      if (!hubInativo?.value) {
        alert("Selecione HUB INATIVO.");
        return;
      }

      saveSection("teleop", {
        cicloPontuacao: Number(cicloPontuacao?.value || 0),
        localLancamento: localLancamento.value,
        volumePorCiclo: volumePorCiclo.value,
        hubInativo: hubInativo.value,
      });

      const href = nextBtn.dataset.href;
      if (href) window.location.href = href;
    });
  }
});
