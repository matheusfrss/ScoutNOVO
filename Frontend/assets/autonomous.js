/* script_autonomous.js — sem resumo/export, só salva e navega */

(function(){
  const saveBtn = document.getElementById("saveAuto");
  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");

  const yesBtn = document.getElementById("crossYes");
  const noBtn = document.getElementById("crossNo");

  const qtyAge = document.getElementById("qtyAge");
  const qtyPre = document.getElementById("qtyPre");

  const toastEl = document.getElementById("toast");
  const STORE_KEY = "ff_auto_data_v1";

  function toast(msg){
    const t = document.createElement("div");
    t.className = "item";
    t.textContent = msg;
    toastEl.appendChild(t);
    setTimeout(()=>{ t.style.opacity = 0; setTimeout(()=> t.remove(), 300); }, 1400);
  }

  function setToggle(btn){
    [yesBtn, noBtn].forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  }

  yesBtn.addEventListener("click", ()=> setToggle(yesBtn));
  noBtn.addEventListener("click", ()=> setToggle(noBtn));

  saveBtn.addEventListener("click", ()=> {
    const crossed = yesBtn.classList.contains("active") ? "sim" :
                    noBtn.classList.contains("active") ? "nao" : null;

    if(!crossed){
      toast("Selecione SIM ou NÃO");
      return;
    }

    const entry = {
      crossed,
      idadeMedia: Number(qtyAge.value || 0),
      preHistoricos: Number(qtyPre.value || 0),
      savedAt: new Date().toISOString()
    };

    // salvo simples — substitui o anterior (se quiser lista, eu mudo)
    localStorage.setItem(STORE_KEY, JSON.stringify(entry));

    toast("Dados salvos");
  });

  // navegação
  backBtn.addEventListener("click", ()=> {
    window.location.href = "index.html";
  });

  nextBtn.addEventListener("click", ()=> {
    window.location.href = "teleop.html";
  });

  // pré-carrega valores salvos (se houver) — opcional, sem mostrar resumo
  const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
  if(saved){
    if(saved.crossed === "sim") setToggle(yesBtn);
    if(saved.crossed === "nao") setToggle(noBtn);
    qtyAge.value = saved.idadeMedia ?? "";
    qtyPre.value = saved.preHistoricos ?? "";
  }

})();
