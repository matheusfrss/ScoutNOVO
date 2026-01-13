// autonomous.js

document.addEventListener("DOMContentLoaded", () => {
  if (!window.readDraft || !window.saveSection) {
    console.warn("[autonomous] draft-utils não encontrados.");
    return;
  }

  // Linha de largada
  const startLineYes = document.getElementById("startLineYes");
  const startLineNo = document.getElementById("startLineNo");

  // Combustível na zona central
  const fuelYes = document.getElementById("fuelYes");
  const fuelNo = document.getElementById("fuelNo");

  // HUB
  const hub0 = document.getElementById("hub0");
  const hub1_8 = document.getElementById("hub1_8");
  const hub9_16 = document.getElementById("hub9_16");
  const hub17 = document.getElementById("hub17");

  // Escalada
  const climbLevel1 = document.getElementById("climbLevel1");
  const climbNo = document.getElementById("climbNo");

  // Robô desativado
  const disabledYes = document.getElementById("disabledYes");
  const disabledNo = document.getElementById("disabledNo");

  // Próximo
  const nextBtn = document.getElementById("nextBtn");

  // Segurança
  const required = [
    startLineYes, startLineNo,
    fuelYes, fuelNo,
    hub0, hub1_8, hub9_16, hub17,
    climbLevel1, climbNo,
    disabledYes, disabledNo,
    nextBtn
  ];

  if (required.some((el) => !el)) {
    console.error("[autonomous] Alguns elementos não foram encontrados no DOM.");
    return;
  }

  // ---- ESTADOS ----
  let leftStartLine = null;     // boolean
  let gotFuel = null;           // boolean
  let hubScore = null;          // number/string
  let climbResult = null;       // string
  let wasDisabled = null;       // boolean

  // Helper: ativar/desativar botões do mesmo grupo
  const setActive = (groupButtons, activeButton) => {
    groupButtons.forEach((btn) => btn.classList.remove("active"));
    activeButton.classList.add("active");
  };

  // ---- LISTENERS ----

  // Linha de largada
  startLineYes.addEventListener("click", () => {
    leftStartLine = true;
    setActive([startLineYes, startLineNo], startLineYes);
  });

  startLineNo.addEventListener("click", () => {
    leftStartLine = false;
    setActive([startLineYes, startLineNo], startLineNo);
  });

  // Combustível
  fuelYes.addEventListener("click", () => {
    gotFuel = true;
    setActive([fuelYes, fuelNo], fuelYes);
  });

  fuelNo.addEventListener("click", () => {
    gotFuel = false;
    setActive([fuelYes, fuelNo], fuelNo);
  });

  // HUB
  hub0.addEventListener("click", () => {
    hubScore = "0";
    setActive([hub0, hub1_8, hub9_16, hub17], hub0);
  });

  hub1_8.addEventListener("click", () => {
    hubScore = "1-8";
    setActive([hub0, hub1_8, hub9_16, hub17], hub1_8);
  });

  hub9_16.addEventListener("click", () => {
    hubScore = "9-16";
    setActive([hub0, hub1_8, hub9_16, hub17], hub9_16);
  });

  hub17.addEventListener("click", () => {
    hubScore = "17+";
    setActive([hub0, hub1_8, hub9_16, hub17], hub17);
  });

  // Escalada
  climbLevel1.addEventListener("click", () => {
    climbResult = "LEVEL_1";
    setActive([climbLevel1, climbNo], climbLevel1);
  });

  climbNo.addEventListener("click", () => {
    climbResult = "NOT_COMPLETED";
    setActive([climbLevel1, climbNo], climbNo);
  });

  // Desativado
  disabledYes.addEventListener("click", () => {
    wasDisabled = true;
    setActive([disabledYes, disabledNo], disabledYes);
  });

  disabledNo.addEventListener("click", () => {
    wasDisabled = false;
    setActive([disabledYes, disabledNo], disabledNo);
  });

  // Próximo (salvar e ir)
  nextBtn.addEventListener("click", (e) => {
    e.preventDefault(); // impede qualquer navegação automática

    const draft = readDraft();
    if (!draft) {
      alert("Nenhum registro ativo. Volte para a primeira página.");
      return;
    }

    // validações
    if (leftStartLine === null) {
      alert("Informe se saiu da linha de largada.");
      return;
    }

    if (gotFuel === null) {
      alert("Informe se buscou combustível na zona central.");
      return;
    }

    if (hubScore === null) {
      alert("Informe a pontuação no HUB.");
      return;
    }

    if (climbResult === null) {
      alert("Informe se concluiu a escalada.");
      return;
    }

    if (wasDisabled === null) {
      alert("Informe se o robô foi desativado.");
      return;
    }

    // ✅ SALVAR NA SEÇÃO AUTO (SEM MEXER NO DRAFT)
    saveSection("auto", {
      leftStartLine,
      gotFuel,
      hubScore,
      climbResult,
      wasDisabled
    });

    console.log("✅ AUTO SALVO:", readDraft().auto);

    // segue o fluxo
    window.location.href = "teleop.html";
  });
});
