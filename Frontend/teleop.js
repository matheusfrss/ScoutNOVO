// teleop.js
(function(){
  // elementos esperados no HTML (IDs)
  const qtyAgeTele = document.getElementById('qtyAgeTele'); // número idade média na teleop
  const qtyPreTele = document.getElementById('qtyPreTele'); // número pré-históricos na teleop
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');
  const toastEl = document.getElementById('toast');

  // util: toast simples (reusa estilo do seu projeto)
  function showToast(msg, ms = 1400){
    if(!toastEl){ console.log('TOAST:', msg); return; }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(()=> toastEl.classList.remove('show'), ms);
  }

  // tenta parseInt com fallback 0
  function toInt(v){
    const n = parseInt(String(v || '').replace(/\D/g,''), 10);
    return Number.isFinite(n) ? n : 0;
  }

  // carrega valores do draft (usa loadSection definida em draft-utils.js)
  function load(){
    try {
      const data = (typeof loadSection === 'function') ? loadSection('teleop') : null;
      if(!data) return;
      if(typeof data.qtyAge !== 'undefined' && qtyAgeTele) qtyAgeTele.value = data.qtyAge;
      if(typeof data.qtyPre !== 'undefined' && qtyPreTele) qtyPreTele.value = data.qtyPre;
    } catch(e){
      console.warn('Erro ao carregar draft teleop', e);
    }
  }

  // monta objeto e salva seção (usa saveSection de draft-utils.js)
  function saveDraft(syncToSession = true){
    try {
      const payload = {
        qtyAge: qtyAgeTele ? toInt(qtyAgeTele.value) : 0,
        qtyPre: qtyPreTele ? toInt(qtyPreTele.value) : 0,
        savedAt: new Date().toISOString()
      };
      if(typeof saveSection === 'function'){
        const draft = saveSection('teleop', payload);
        showToast('Teleop salvo');
        return draft;
      } else {
        // fallback: grava direto no sessionStorage (compatibilidade)
        const DRAFT_KEY = 'ff_rd_scout_draft';
        const raw = sessionStorage.getItem(DRAFT_KEY) || '{}';
        const draft = JSON.parse(raw);
        draft.teleop = Object.assign({}, draft.teleop || {}, payload);
        draft.savedAt = new Date().toISOString();
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        showToast('Teleop salvo (local)');
        return draft;
      }
    } catch(e){
      console.error('Erro ao salvar teleop', e);
      showToast('Erro ao salvar teleop');
      return null;
    }
  }

  // navega para href contido no data-href do botão (usado depois de salvar)
  function navigateFromButton(btn){
    if(!btn) return;
    const href = btn.getAttribute('data-href') || btn.dataset.href;
    if(!href) return;
    // garante gravação rápida antes de navegar
    saveDraft(true);
    // small delay to ensure sessionStorage write completes
    setTimeout(()=> { window.location.href = href; }, 120);
  }

  // valida (apenas checa números não-negativos)
  function validate(){
    if(qtyAgeTele && qtyAgeTele.value && toInt(qtyAgeTele.value) < 0){
      showToast('Quantidade (idade média) inválida');
      return false;
    }
    if(qtyPreTele && qtyPreTele.value && toInt(qtyPreTele.value) < 0){
      showToast('Quantidade (pré-históricos) inválida');
      return false;
    }
    return true;
  }

  // bind events
  if(nextBtn){
    nextBtn.addEventListener('click', (ev)=>{
      ev.preventDefault();
      if(!validate()) return;
      saveDraft(true);
      // small timeout to ensure sessionStorage write completes
      setTimeout(()=> {
        const href = nextBtn.getAttribute('data-href') || nextBtn.dataset.href;
        if(href) window.location.href = href;
      }, 120);
    });
  }

  if(backBtn){
    backBtn.addEventListener('click', (ev)=>{
      ev.preventDefault();
      if(!validate()) return;
      saveDraft(true);
      setTimeout(()=> {
        const href = backBtn.getAttribute('data-href') || backBtn.dataset.href;
        if(href) window.location.href = href;
      }, 120);
    });
  }

  // salva automaticamente ao alterar campos (opcional: evita perda)
  [qtyAgeTele, qtyPreTele].forEach(el=>{
    if(!el) return;
    el.addEventListener('input', ()=> {
      // throttle: salva a cada 800ms de inatividade
      clearTimeout(saveDraft._t);
      saveDraft._t = setTimeout(()=> saveDraft(true), 800);
    });
  });

  // salvar ao sair da página
  window.addEventListener('beforeunload', ()=> saveDraft(true));

  // init
  load();

})();
