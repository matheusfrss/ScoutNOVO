// teleop.js
(function(){
  const qtyAge = document.getElementById('qtyAgeTele');
  const qtyPre = document.getElementById('qtyPreTele');
  const toastEl = document.getElementById('toast');

  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');

  const DRAFT_KEY = 'ff_rd_scout_draft'; // mesma chave usada pelo autonomous.js

  // simple toast (reaproveita estilo)
  function showToast(msg, ms = 1400){
    if(!toastEl){ console.log('TOAST:', msg); return; }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(()=> toastEl.classList.remove('show'), ms);
  }

  // carrega rascunho (sessionStorage primeiro, depois localStorage)
  function loadDraft(){
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY) || localStorage.getItem(DRAFT_KEY);
      if(!raw) return;
      const draft = JSON.parse(raw);
      if(draft && draft.teleop){
        const t = draft.teleop;
        if(typeof t.qtyAgeTele !== 'undefined') qtyAge.value = t.qtyAgeTele;
        if(typeof t.qtyPreTele !== 'undefined') qtyPre.value = t.qtyPreTele;
      }
    } catch(e){
      console.warn('Erro lendo draft teleop:', e);
    }
  }

  // salva rascunho (no sessionStorage por padrão)
  function saveDraft(saveToSession = true){
    try {
      const rawLocal = sessionStorage.getItem(DRAFT_KEY) || localStorage.getItem(DRAFT_KEY);
      const draft = rawLocal ? JSON.parse(rawLocal) : {};
      draft.teleop = {
        qtyAgeTele: qtyAge.value ? parseInt(qtyAge.value, 10) : 0,
        qtyPreTele: qtyPre.value ? parseInt(qtyPre.value, 10) : 0,
        savedAt: new Date().toISOString()
      };
      const target = saveToSession ? sessionStorage : localStorage;
      target.setItem(DRAFT_KEY, JSON.stringify(draft));
      showToast('Teleoperada salva');
      return draft;
    } catch(e){
      console.error('Erro salvando draft teleop:', e);
      showToast('Erro ao salvar rascunho');
      return null;
    }
  }

  // eventos: salvar antes de navegar
  if(nextBtn){
    nextBtn.addEventListener('click', ()=>{
      saveDraft(true);
      // navegação é feita pelo onclick do botão em HTML
    });
  }
  if(backBtn){
    backBtn.addEventListener('click', ()=> saveDraft(true));
  }

  // salva no unload por segurança
  window.addEventListener('beforeunload', ()=> saveDraft(true));

  // preenche ao carregar
  loadDraft();

  // se quiser enviar direto ao backend daqui, descomente e adapte:
  /*
  async function sendToBackend(){
    const payload = {
      // você decide o que enviar agora: normalmente juntamos draft.auto+teleop+endgame no final
      qty_age_tele: parseInt(qtyAge.value || 0, 10),
      qty_pre_tele: parseInt(qtyPre.value || 0, 10)
    };
    try {
      const res = await fetch('http://127.0.0.1:8000/api/respostas', {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
      });
      const json = await res.json().catch(()=>({}));
      if(!res.ok) console.warn('Erro ao enviar teleop:', res.status, json);
      else console.log('Teleop enviado:', json);
    } catch(e){ console.warn('Network error teleop send:', e); }
  }
  */

})();
