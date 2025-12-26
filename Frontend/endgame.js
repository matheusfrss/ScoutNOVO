// endgame.js

document.addEventListener("DOMContentLoaded", () => {
  // Segurança: draft-utils precisa existir
  if (typeof readDraft !== "function" || typeof saveSection !== "function") {
    console.warn("[endgame] draft-utils não encontrado.");
    return;
  }

  const finishBtn = document.getElementById("finishBtn");

  // Botões
  const pitYes = document.getElementById("pitYes");
  const pitNo = document.getElementById("pitNo");

  const siteYes = document.getElementById("siteYes");
  const siteNo = document.getElementById("siteNo");

  const stoppedYes = document.getElementById("stoppedYes");
  const stoppedNo = document.getElementById("stoppedNo");

  const penalties = document.getElementById("penalties");
  const strategy = document.getElementById("strategy");

  let pit = null;
  let site = null;
  let stopped = null;

  // ===== helper visual =====
  function togglePair(yesBtn, noBtn, setter, value) {
    yesBtn.classList.remove("active");
    noBtn.classList.remove("active");

    if (value === true) {
      yesBtn.classList.add("active");
    } else {
      noBtn.classList.add("active");
    }

    setter(value);
  }

  // ===== eventos =====
  pitYes.addEventListener("click", () =>
    togglePair(pitYes, pitNo, v => (pit = v), true)
  );
  pitNo.addEventListener("click", () =>
    togglePair(pitYes, pitNo, v => (pit = v), false)
  );

  siteYes.addEventListener("click", () =>
    togglePair(siteYes, siteNo, v => (site = v), true)
  );
  siteNo.addEventListener("click", () =>
    togglePair(siteYes, siteNo, v => (site = v), false)
  );

  stoppedYes.addEventListener("click", () =>
    togglePair(stoppedYes, stoppedNo, v => (stopped = v), true)
  );
  stoppedNo.addEventListener("click", () =>
    togglePair(stoppedYes, stoppedNo, v => (stopped = v), false)
  );

  // ===== FINALIZAR =====
  finishBtn.addEventListener("click", async () => {
    const draft = readDraft();

    if (!draft) {
      alert("Nenhum registro ativo. Volte ao início.");
      return;
    }

    if (pit === null || site === null || stopped === null) {
      alert("Preencha todas as opções do Endgame.");
      return;
    }

    if (!strategy.value) {
      alert("Selecione a estratégia do robô.");
      return;
    }

    // Salva Endgame no draft
    saveSection("endgame", {
      estacionouPoco: pit,
      estacionouSitio: site,
      roboParou: stopped,
      penalidades: penalties.value.trim(),
      estrategia: strategy.value
    });

    const finalDraft = readDraft();

    // 🔍 DEBUG IMPORTANTE
    console.log("=== SCOUT COMPLETO (DRAFT) ===");
    console.log(finalDraft);
    
    // Mostra estrutura detalhada
    console.log("📋 ESTRUTURA DETALHADA:");
    console.log("basic:", finalDraft.basic);
    console.log("auto:", finalDraft.auto);
    console.log("teleop:", finalDraft.teleop);
    console.log("endgame:", finalDraft.endgame);
    
    // ===== TRANSFORMA OS DADOS PARA O FORMATO DO BACKEND =====
    const dadosParaBackend = {
      // Página 1 - Basic (nomes corrigidos para o backend)
      num_partida: finalDraft.basic?.matchNumber || 0,
      num_equipe: finalDraft.basic?.teamNumber || 0,
      nome_scout: finalDraft.basic?.scoutName || "",
      tipo_partida: finalDraft.basic?.matchType || "qualificatoria",
      alianca: finalDraft.basic?.alliance || "vermelho",
      posicao_inicial: finalDraft.basic?.startingPosition || "1",
      
      // Página 2 - Auto (convertendo para JSON string)
      autonomo: JSON.stringify({
        ultrapassou_linha: finalDraft.auto?.crossedLine || false,
        artefatos_idade_media: finalDraft.auto?.artefatosMedios || 0,
        artefatos_pre_historicos: finalDraft.auto?.artefatosPrehistoricos || 0
      }),
      
      // Página 3 - Teleop (convertendo para JSON string)
      teleop: JSON.stringify({
        artefatos_idade_media: finalDraft.teleop?.artefatosMedios || 0,
        artefatos_pre_historicos: finalDraft.teleop?.artefatosPrehistoricos || 0
      }),
      
      // Página 4 - Endgame (convertendo para JSON string)
      endgame: JSON.stringify({
        estacionou_pozo: finalDraft.endgame?.estacionouPoco || false,
        estacionou_sitio: finalDraft.endgame?.estacionouSitio || false,
        robo_parou: finalDraft.endgame?.roboParou || false,
        penalidades: finalDraft.endgame?.penalidades || "",
        estrategia: finalDraft.endgame?.estrategia || ""
      })
    };
    
    console.log("=== DADOS TRANSFORMADOS PARA BACKEND ===");
    console.log(dadosParaBackend);
    console.log("========================================");

    // ===== ENVIO PARA BACKEND =====
    try {
      console.log("📤 Enviando para: http://localhost:3080/api/salvar_robo");
      
      const response = await fetch("http://localhost:3080/api/salvar_robo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dadosParaBackend) // ✅ ENVIA DADOS TRANSFORMADOS
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Resposta de erro:", errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("✅ Enviado com sucesso:", result);

      if (result.status === 'ok') {
        alert("✅ " + result.mensagem);
        clearDraft();
        window.location.href = "index.html";
      } else {
        alert("❌ " + (result.mensagem || "Erro ao salvar"));
      }

    } catch (error) {
      console.error("💥 Erro ao enviar:", error);
      alert(
        "Erro ao enviar os dados para o servidor.\n" +
        "Os dados NÃO foram perdidos (draft mantido).\n\n" +
        error.message
      );
    }
  });
});