// autonomous.js (substituir todo o arquivo)
(function(){
  'use strict';

  // elementos
  const crossYes = document.getElementById('crossYes');
  const crossNo = document.getElementById('crossNo');
  const qtyAge = document.getElementById('qtyAge');
  const qtyPre = document.getElementById('qtyPre');
  const toastEl = document.getElementById('toast');

  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');

  // funções de draft (fornecidas por draft-utils.js)
  // readDraft, writeDraft, saveSection, loadSection, clearDraft
  if(typeof saveSection !== 'function' || typeof loadSection !== 'function'){
    console.warn('[autonomous] draft-utils não encontrados. Garanta <script src="./draft-utils.js"></script> antes deste script.');
  }

  // toast simples (reaproveita seu elemento #toast)
  function showToast(msg, ms = 1300){
    if(!toastEl){
      console.log('TOAST:', msg);
      return;
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(()=> toastEl.classList.remove('show'), ms);
  }

  // helper visual para marcar SIM/NÃO
  function setCrossed(val){
    if(val === true){
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
      crossYes.classList.remove('selected');
      crossNo.classList.remove('selected');
      crossYes.setAttribute('aria-pressed','false');
      crossNo.setAttribute('aria-pressed','false');
    }
  }

  // preenche UI a partir do draft salvo (chave: 'auto')
  function loadFromDraft(){
    if(typeof loadSection !== 'function') return;
    try {
      const a = loadSection('auto');
      if(!a) return;
      if(typeof a.crossed === 'boolean') setCrossed(a.crossed);
      if(typeof a.qtyAge !== 'undefined' && qtyAge) qtyAge.value = a.qtyAge ?? '';
      if(typeof a.qtyPre !== 'undefined' && qtyPre) qtyPre.value = a.qtyPre ?? '';
      console.debug('[autonomous] carregado draft auto:', a);
    } catch(e){
      console.warn('[autonomous] erro loadFromDraft', e);
    }
  }

  // coleta valores e salva com saveSection('auto', obj)
  function saveDraft(){
    if(typeof saveSection !== 'function'){
      console.warn('[autonomous] saveSection indisponível');
      return null;
    }
    try {
      const obj = {
        crossed: crossYes?.getAttribute('aria-pressed') === 'true' ? true :
                 (crossNo?.getAttribute('aria-pressed') === 'true' ? false : null),
        qtyAge: qtyAge && qtyAge.value ? parseInt(qtyAge.value, 10) : 0,
        qtyPre: qtyPre && qtyPre.value ? parseInt(qtyPre.value, 10) : 0,
        savedAt: new Date().toISOString()
      };
      const draft = saveSection('auto', obj);
      console.debug('[autonomous] salvo draft auto:', obj);
      showToast('Autônoma salva', 900);
      return draft;
    } catch (e) {
      console.error('[autonomous] erro salvando draft', e);
      showToast('Erro ao salvar rascunho', 1000);
      return null;
    }
  }

  // eventos
  crossYes?.addEventListener('click', ()=> {
    setCrossed(true);
  });
  crossNo?.addEventListener('click', ()=> {
    setCrossed(false);
  });

  // quando clicar Próximo: salva e navega
  if(nextBtn){
    nextBtn.addEventListener('click', (ev) => {
      // salva no sessionStorage
      saveDraft();
      // garante gravação rapida (sessionStorage é síncrono, mas mantemos um pequeno delay pra UX)
      setTimeout(()=> {
        // se no HTML já houver onclick="window.location.href='teleop.html'", não precisamos setar
        // mas para garantir, apenas navega se o botão não tiver um atributo data-no-nav
        if(nextBtn.getAttribute('data-no-nav')) return;
        // tenta pegar href do onclick ou usar fallback
        // preferimos usar window.location (simples)
        window.location.href = nextBtn.getAttribute('data-href') || 'teleop.html';
      }, 120);
    });
  }

  // quando clicar Anterior: salva e vai para index
  if(backBtn){
    backBtn.addEventListener('click', (ev) => {
      saveDraft();
      setTimeout(()=> {
        window.location.href = backBtn.getAttribute('data-href') || 'index.html';
      }, 80);
    });
  }

  // save on unload (safety)
  window.addEventListener('beforeunload', ()=> {
    try { saveDraft(); } catch(e){ /* ignore */ }
  });

  // inicialização
  document.addEventListener('DOMContentLoaded', ()=> {
    loadFromDraft();
    // garante que, se a sua UI usa botões com onclick inline, não cause conflito:
    // se os botões já têm onclick que navegaria, a nossa lógica roda primeiro.
  });

})();
