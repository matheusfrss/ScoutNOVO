// autonomous.js
(function(){
  const crossYes = document.getElementById('crossYes');
  const crossNo = document.getElementById('crossNo');
  const qtyAge = document.getElementById('qtyAge');
  const qtyPre = document.getElementById('qtyPre');
  const toastEl = document.getElementById('toast');

  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');

  const DRAFT_KEY = 'ff_rd_scout_draft'; // session/local draft to combine across pages

  // simple toast (uses same style as main)
  function showToast(msg, ms = 1400){
    if (!toastEl) { console.log('TOAST:', msg); return; }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(()=> toastEl.classList.remove('show'), ms);
  }

  // visual helper
  function setCrossed(val){
    if(val){
      crossYes.classList.add('selected');
      crossNo.classList.remove('selected');
      crossYes.setAttribute('aria-pressed','true');
      crossNo.setAttribute('aria-pressed','false');
    } else if(val === false){
      crossNo.classList.add('selected');
      crossYes.classList.remove('selected');
      crossNo.setAttribute('aria-pressed','true');
      crossYes.setAttribute('aria-pressed','false');
    } else {
      // unset
      crossYes.classList.remove('selected');
      crossNo.classList.remove('selected');
      crossYes.setAttribute('aria-pressed','false');
      crossNo.setAttribute('aria-pressed','false');
    }
  }

  // load draft (if exists) and prefill
  function loadDraft(){
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY) || localStorage.getItem(DRAFT_KEY);
      if(!raw) return;
      const draft = JSON.parse(raw);
      if(typeof draft.auto !== 'undefined'){
        const a = draft.auto;
        if(typeof a.crossed === 'boolean') setCrossed(a.crossed);
        if(typeof a.qtyAge !== 'undefined') qtyAge.value = a.qtyAge;
        if(typeof a.qtyPre !== 'undefined') qtyPre.value = a.qtyPre;
      }
    } catch(e){
      console.warn('Erro lendo draft:', e);
    }
  }

  // collect values and store draft
  function saveDraft(saveToSession = true){
    try {
      const rawLocal = sessionStorage.getItem(DRAFT_KEY) || localStorage.getItem(DRAFT_KEY);
      let draft = rawLocal ? JSON.parse(rawLocal) : {};
      draft.auto = {
        crossed: crossYes.getAttribute('aria-pressed') === 'true' ? true :
                 (crossNo.getAttribute('aria-pressed') === 'true' ? false : null),
        qtyAge: qtyAge.value ? parseInt(qtyAge.value, 10) : 0,
        qtyPre: qtyPre.value ? parseInt(qtyPre.value, 10) : 0,
        savedAt: new Date().toISOString()
      };
      const targetStorage = saveToSession ? sessionStorage : localStorage;
      targetStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      showToast('Autônoma salva');
      return draft;
    } catch(e){
      console.error('Erro salvando draft:', e);
      showToast('Erro ao salvar rascunho');
      return null;
    }
  }

  // event bindings
  crossYes?.addEventListener('click', ()=> setCrossed(true));
  crossNo?.addEventListener('click', ()=> setCrossed(false));

  // intercept next: save draft then allow navigation
  if(nextBtn){
    nextBtn.addEventListener('click', (ev)=>{
      // save to session so next pages can read
      saveDraft(true);
      // navigation is via inline onclick in HTML; we keep it (no preventDefault)
      // small delay to ensure sessionStorage write completes before navigation
      // but keep it tiny so UX is instant
      // (if the HTML already navigates immediately, this still runs before navigation)
    });
  }

  // intercept back: save as well (optional)
  if(backBtn){
    backBtn.addEventListener('click', ()=> saveDraft(true));
  }

  // also save when user leaves the page (safety)
  window.addEventListener('beforeunload', ()=> saveDraft(true));

  // prefill UI from draft on load
  loadDraft();

})();
