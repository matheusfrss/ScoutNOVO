(function(){

  const qtyAge = document.getElementById("qtyAgeTele");
  const qtyPre = document.getElementById("qtyPreTele");

  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");

  const KEY = "ff_teleop_data_v1";


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

