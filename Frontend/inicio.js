// inicio.js

document.addEventListener("DOMContentLoaded", () => {
  const nextBtn = document.getElementById("nextBtn");

  // segurança extra (evita erro se o botão não existir)
  if (!nextBtn) {
    console.error("Botão nextBtn não encontrado no HTML");
    return;
  }

  nextBtn.addEventListener("click", () => {
    const numPartida = document.getElementById("matchNumber")?.value?.trim();
    const tipoPartida = document.getElementById("tipoPartida")?.value;
    const numEquipe = document.getElementById("teamNumber")?.value?.trim();
    const corAlianca = document.getElementById("corAlianca")?.value;
    const posicao = document.getElementById("posicao")?.value;
    const nomeScout = document.getElementById("nomeScout")?.value?.trim();

    // validação
    if (
      !numPartida ||
      !tipoPartida ||
      !numEquipe ||
      !corAlianca ||
      !posicao ||
      !nomeScout
    ) {
      alert("Preencha todos os campos antes de continuar.");
      return;
    }

    // cria o draft central no sessionStorage
    initDraft({
      numPartida: Number(numPartida),
      tipoPartida,
      numEquipe: Number(numEquipe),
      corAlianca,
      posicao,
      nomeScout,
      criadoEm: new Date().toISOString()
    });

    console.log("Draft inicial salvo com sucesso");

    // navega para a fase autônoma
    window.location.href = "autonomo.html";
  });
});
