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

  window.addEventListener('beforeunload', ()=> saveDraft(true));
  loadDraft();

})();
