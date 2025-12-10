// Frontend/endgame.js
(function(){
  const DRAFT_KEY = 'ff_rd_scout_draft';     // session draft (auto/teleop/endgame)
  const LOCAL_STORE_KEY = 'ff_rd_scout_v2';  // histórico local (array) onde index/script.js salva
  const API_URL = 'http://127.0.0.1:8000/api/respostas';

  // DOM
  const pitYes = document.getElementById('pitYes');
  const pitNo  = document.getElementById('pitNo');
  const siteYes = document.getElementById('siteYes');
  const siteNo  = document.getElementById('siteNo');
  const stoppedYes = document.getElementById('stoppedYes');
  const stoppedNo  = document.getElementById('stoppedNo');
  const penaltiesEl = document.getElementById('penalties');
  const strategyEl = document.getElementById('strategy');
  const finishBtn = document.getElementById('finishBtn');
  const backBtn = document.getElementById('backBtn');
  const toastEl = document.getElementById('toast');

  function toast(msg, ms = 1500){
    if(!toastEl){ console.log('TOAST:', msg); return; }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(()=> toastEl.classList.remove('show'), ms);
  }

  function setTogglePair(yesEl, noEl, val){
    if(!yesEl || !noEl) return;
    if(val === true){
      yesEl.classList.add('selected'); yesEl.setAttribute('aria-pressed','true');
      noEl.classList.remove('selected'); noEl.setAttribute('aria-pressed','false');
    } else if(val === false){
      noEl.classList.add('selected'); noEl.setAttribute('aria-pressed','true');
      yesEl.classList.remove('selected'); yesEl.setAttribute('aria-pressed','false');
    } else {
      yesEl.classList.remove('selected'); yesEl.setAttribute('aria-pressed','false');
      noEl.classList.remove('selected');  noEl.setAttribute('aria-pressed','false');
    }
  }

  // Read draft: prefer sessionStorage (temporary draft between pages)
  function readDraft(){
    try {
      const rawSession = sessionStorage.getItem(DRAFT_KEY);
      if(rawSession) return JSON.parse(rawSession);
      // fallback: maybe saved to localStorage by some flow (rare) — try reading it
      const rawLocalDraft = localStorage.getItem(DRAFT_KEY);
      if(rawLocalDraft) return JSON.parse(rawLocalDraft);
      return {};
    } catch(e){
      console.warn('readDraft error', e);
      return {};
    }
  }

  // Save draft: default saves to sessionStorage (short lived)
  function saveDraft(saveToSession = true){
    try {
      const existingRaw = sessionStorage.getItem(DRAFT_KEY) || localStorage.getItem(DRAFT_KEY);
      const draft = existingRaw ? JSON.parse(existingRaw) : {};
      draft.endgame = {
        pit: pitYes?.getAttribute('aria-pressed') === 'true' ? true : (pitNo?.getAttribute('aria-pressed') === 'true' ? false : null),
        site: siteYes?.getAttribute('aria-pressed') === 'true' ? true : (siteNo?.getAttribute('aria-pressed') === 'true' ? false : null),
        stopped: stoppedYes?.getAttribute('aria-pressed') === 'true' ? true : (stoppedNo?.getAttribute('aria-pressed') === 'true' ? false : null),
        penalties: (penaltiesEl?.value || '').trim(),
        strategy: (strategyEl?.value || '').trim(),
        savedAt: new Date().toISOString()
      };
      const target = saveToSession ? sessionStorage : localStorage;
      target.setItem(DRAFT_KEY, JSON.stringify(draft));
      toast('Endgame salvo');
      return draft;
    } catch(e){
      console.error('saveDraft error', e);
      toast('Erro ao salvar rascunho');
      return null;
    }
  }

  // Resolve main identifiers (scouter / match / team) from draft or last local history
  function resolveMainIdentifiers(draft){
    try {
      if(draft && draft.scouter && (draft.match_number || draft.matchNumber) && (draft.team_number || draft.teamNumber)){
        return {
          scouter: draft.scouter,
          match_number: Number(draft.match_number || draft.matchNumber || 0),
          team_number: Number(draft.team_number || draft.teamNumber || 0),
          match_type: draft.match_type || draft.matchType || null,
          alliance: draft.alliance || null,
          start_position: draft.start_position || draft.startPos || null
        };
      }

      const rawHist = localStorage.getItem(LOCAL_STORE_KEY);
      if(rawHist){
        const arr = JSON.parse(rawHist);
        if(Array.isArray(arr) && arr.length){
          const last = arr[arr.length - 1];
          return {
            scouter: last.scouter || last.scouterName || '',
            match_number: Number(last.matchNumber || last.match_number || 0),
            team_number: Number(last.teamNumber || last.team_number || 0),
            match_type: last.matchType || last.match_type || null,
            alliance: last.alliance ? String(last.alliance).toUpperCase() : (last.allianceName || null),
            start_position: last.startPos || last.start_position || null
          };
        }
      }
    } catch(e){
      console.warn('resolveMainIdentifiers error', e);
    }
    return { scouter:'', match_number:0, team_number:0, match_type:null, alliance:null, start_position:null };
  }

  // Build final payload to send to backend
  function buildFinalPayload(draft){
    const auto = (draft && draft.auto) ? draft.auto : {};
    const teleop = (draft && draft.teleop) ? draft.teleop : {};

    const end = {
      pit: pitYes?.getAttribute('aria-pressed') === 'true' ? true : (pitNo?.getAttribute('aria-pressed') === 'true' ? false : null),
      site: siteYes?.getAttribute('aria-pressed') === 'true' ? true : (siteNo?.getAttribute('aria-pressed') === 'true' ? false : null),
      stopped: stoppedYes?.getAttribute('aria-pressed') === 'true' ? true : (stoppedNo?.getAttribute('aria-pressed') === 'true' ? false : null),
      penalties: (penaltiesEl?.value || '').trim(),
      strategy: (strategyEl?.value || '').trim()
    };

    const ids = resolveMainIdentifiers(draft);

    // try to compute numeric fields
    const autoScore = Number(auto.qtyAge || auto.qty_age || auto.qtyAgeAuto || 0) + Number(auto.qtyPre || auto.qty_pre || 0);
    const teleopCycles = Number(teleop.qtyAgeTele || teleop.qty_age_tele || 0) + Number(teleop.qtyPreTele || teleop.qty_pre_tele || 0);

    return {
      scouter: ids.scouter || '',
      match_number: Number(ids.match_number || 0),
      team_number: Number(ids.team_number || 0),
      match_type: ids.match_type || null,
      alliance: ids.alliance || null,
      start_position: ids.start_position || null,
      auto_score: autoScore,
      teleop_cycles: teleopCycles,
      endgame: JSON.stringify({ auto, teleop, end }), // structured string
      notes: ''
    };
  }

  async function sendToBackend(payload){
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(()=>({}));
      if(!res.ok){
        console.warn('Backend returned error', res.status, json);
        toast('Erro servidor: ' + res.status);
        return { ok:false, status: res.status, body: json };
      }
      return { ok:true, status: res.status, body: json };
    } catch(e){
      console.error('Network error', e);
      toast('Falha de rede ao enviar');
      return { ok:false, error: e };
    }
  }

  // Finish handler
  async function finishHandler(){
    // save current endgame to session draft
    const draft = saveDraft(true) || readDraft();

    const payload = buildFinalPayload(draft);
    console.log('[FINAL PAYLOAD]', payload);

    // validation
    if(!payload.scouter || payload.match_number <= 0 || payload.team_number <= 0){
      toast('Faltam campos principais (scouter / partida / team). Volte ao início e preencha.');
      return;
    }

    // UX
    finishBtn.disabled = true;
    const oldTxt = finishBtn.textContent;
    finishBtn.textContent = 'Enviando...';

    const resp = await sendToBackend(payload);

    finishBtn.disabled = false;
    finishBtn.textContent = oldTxt || 'Finalizar';

    if(resp.ok){
      // push to local history
      try {
        const history = JSON.parse(localStorage.getItem(LOCAL_STORE_KEY) || '[]');
        history.push(Object.assign({}, payload, { created_at: new Date().toISOString() }));
        localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(history));
        // clear draft
        sessionStorage.removeItem(DRAFT_KEY);
      } catch(e){
        console.warn('update local history error', e);
      }
      toast('Enviado com sucesso!');
      setTimeout(()=> window.location.href = 'index.html', 700);
    } else {
      toast('Não foi possível enviar. Rascunho mantido para tentar depois.');
    }
  }

  // wire UI interactions
  pitYes?.addEventListener('click', ()=> setTogglePair(pitYes, pitNo, true));
  pitNo?.addEventListener('click', ()=> setTogglePair(pitYes, pitNo, false));
  siteYes?.addEventListener('click', ()=> setTogglePair(siteYes, siteNo, true));
  siteNo?.addEventListener('click', ()=> setTogglePair(siteYes, siteNo, false));
  stoppedYes?.addEventListener('click', ()=> setTogglePair(stoppedYes, stoppedNo, true));
  stoppedNo?.addEventListener('click', ()=> setTogglePair(stoppedYes, stoppedNo, false));

  backBtn?.addEventListener('click', ()=> {
    saveDraft(true);
    // navigation handled by the HTML onclick if present; keep this as backup
    setTimeout(()=> { /* no-op */ }, 50);
  });

  finishBtn?.addEventListener('click', finishHandler);

  // on load: prefill UI from draft if any
  (function init(){
    const draft = readDraft();
    if(draft && draft.endgame){
      try {
        const e = draft.endgame;
        if(typeof e.pit === 'boolean') setTogglePair(pitYes, pitNo, e.pit);
        if(typeof e.site === 'boolean') setTogglePair(siteYes, siteNo, e.site);
        if(typeof e.stopped === 'boolean') setTogglePair(stoppedYes, stoppedNo, e.stopped);
        if(typeof e.penalties !== 'undefined') penaltiesEl.value = e.penalties;
        if(typeof e.strategy !== 'undefined') strategyEl.value = e.strategy;
      } catch(e){
        console.warn('prefill endgame failed', e);
      }
    }
  })();

})();
