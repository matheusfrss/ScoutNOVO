(function(){

  const qtyAge = document.getElementById("qtyAgeTele");
  const qtyPre = document.getElementById("qtyPreTele");

  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");

  const KEY = "ff_teleop_data_v1";

  // salva automaticamente ao digitar
  function save(){
    const entry = {
      idadeMedia: Number(qtyAge.value || 0),
      preHistoricos: Number(qtyPre.value || 0),
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(KEY, JSON.stringify(entry));
  }

  qtyAge.addEventListener("input", save);
  qtyPre.addEventListener("input", save);

  // carregar se existir
  const saved = JSON.parse(localStorage.getItem(KEY) || "null");
  if(saved){
    qtyAge.value = saved.idadeMedia ?? "";
    qtyPre.value = saved.preHistoricos ?? "";
  }

  // navegação
  backBtn.onclick = ()=> location.href = "autonomous.html";
  nextBtn.onclick = ()=> location.href = "endgame.html"; // próxima página

})();
