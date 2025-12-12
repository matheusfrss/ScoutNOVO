(function(){
  // elementos
  const segBtns = Array.from(document.querySelectorAll('.seg-btn') || []);
  const posBtns = Array.from(document.querySelectorAll('.pos-btn') || []);
  const blue = document.getElementById('blueAlliance');
  const red = document.getElementById('redAlliance');
  const saveBtn = document.getElementById('saveBtn');
  const exportBtn = document.getElementById('exportBtn');
  const recordsBtn = document.getElementById('recordsBtn');
  const form = document.getElementById('scoutForm');
  const toastEl = document.getElementById('toast');

  // chave localStorage
  const STORE_KEY = 'ff_rd_scout_v2';

  // fallback showToast se não existir
  function showToast(msg, timeout = 1800){
    if(!toastEl){
      console.log('TOAST:', msg);
      return;
    }
    const item = document.createElement('div');
    item.className = 'item';
    item.textContent = msg;
    toastEl.appendChild(item);
    // force reflow for animation (if any)
    void item.offsetWidth;
    setTimeout(()=> {
      item.style.opacity = '0';
      setTimeout(()=> item.remove(), 300);
    }, timeout);
  }

  // helper visual: ativa botão em um grupo e remove dos outros
  function activateGroup(list, target){
    list.forEach(b => {
      const is = b === target;
      b.classList.toggle('active', is);
      b.classList.toggle('selected', is); // compatibilidade visual
    });
  }

  // ===== handlers UI =====
  segBtns.forEach(b => {
    b.addEventListener('click', () => activateGroup(segBtns, b));
  });

  posBtns.forEach(b => {
    b.addEventListener('click', () => activateGroup(posBtns, b));
  });

  function toggleAlliance(el){
    if(!el) return;
    const pressed = el.getAttribute('aria-pressed') === 'true';
    blue?.setAttribute('aria-pressed','false');
    red?.setAttribute('aria-pressed','false');
    if(!pressed) el.setAttribute('aria-pressed','true');
    // visual
    blue?.classList.toggle('selected', blue?.getAttribute('aria-pressed')==='true');
    red?.classList.toggle('selected', red?.getAttribute('aria-pressed')==='true');
  }
  blue?.addEventListener('click', ()=> toggleAlliance(blue));
  red?.addEventListener('click', ()=> toggleAlliance(red));

  // ===== montar dados do form =====
  function collectFormData(){
    if(!form) return null;
    const scouter = String(form.scouter?.value || '').trim();
    const matchNumberRaw = String(form.matchNumber?.value || '').trim();
    const teamNumberRaw = String(form.teamNumber?.value || '').trim();

    // tenta converter para número (remove não dígitos)
    const matchNumber = Number(parseInt(matchNumberRaw.replace(/\D/g,''), 10) || 0);
    const teamNumber = Number(parseInt(teamNumberRaw.replace(/\D/g,''), 10) || 0);

    const matchType = document.querySelector('.seg-btn.active')?.dataset.type
                   || document.querySelector('.seg-btn.selected')?.dataset.type
                   || null;

    const alliance = (blue?.getAttribute('aria-pressed')==='true') ? 'BLUE'
                  : (red?.getAttribute('aria-pressed')==='true' ? 'RED' : null);

    const startPos = document.querySelector('.pos-btn.active')?.dataset.pos
                  || document.querySelector('.pos-btn.selected')?.dataset.pos
                  || null;

    return {
      scouter,
      matchNumber,
      teamNumber,
      // payload names for backend:
      payload: {
        scouter,
        match_number: matchNumber,
        team_number: teamNumber,
        match_type: matchType,
        alliance: alliance,
        start_position: startPos,
        auto_score: 0,
        teleop_cycles: 0,
        endgame: "",
        notes: ""
      },
      meta: {
        savedAt: new Date().toISOString(),
        matchType,
        alliance,
        startPos
      }
    };
  }

  // atualiza rascunho na sessionStorage para as outras páginas
  function updateSessionDraftFromSave(saveObj) {
    try {
      const sessionDraftRaw = sessionStorage.getItem('ff_rd_scout_draft');
      const sessionDraft = sessionDraftRaw ? JSON.parse(sessionDraftRaw) : {};
      sessionDraft.scouter = saveObj.scouter || sessionDraft.scouter || '';
      sessionDraft.match_number = saveObj.match_number ?? sessionDraft.match_number ?? 0;
      sessionDraft.team_number = saveObj.team_number ?? sessionDraft.team_number ?? 0;
      sessionDraft.match_type = saveObj.match_type || sessionDraft.match_type || null;
      sessionDraft.alliance = saveObj.alliance || sessionDraft.alliance || null;
      sessionDraft.start_position = saveObj.start_position || sessionDraft.start_position || null;
      sessionDraft.savedAt = new Date().toISOString();
      sessionStorage.setItem('ff_rd_scout_draft', JSON.stringify(sessionDraft));
    } catch (e) {
      console.warn('Erro ao atualizar draft na sessão:', e);
    }
  }

  // ===== salvar local + (opcional) enviar ao backend =====
  async function saveRecord(){
    const data = collectFormData();
    if(!data) return;

    if(!data.payload.scouter || data.payload.match_number <= 0 || data.payload.team_number <= 0){
      showToast('Preencha: scouter, nº partida e nº do time', 2200);
      return;
    }

    // salvar local
    const existing = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    const saveObj = Object.assign({}, data.payload, { savedAt: data.meta.savedAt });
    existing.push(saveObj);
    localStorage.setItem(STORE_KEY, JSON.stringify(existing));

    // atualiza session draft para as outras páginas
    updateSessionDraftFromSave(saveObj);

    // UI feedback
    if(saveBtn){
      saveBtn.classList.add('saved');
      const prev = saveBtn.textContent;
      saveBtn.textContent = 'Salvo ✓';
      setTimeout(()=> { saveBtn.classList.remove('saved'); saveBtn.textContent = prev || 'Salvar'; }, 900);
    }
    showToast('Registro salvo', 1200);

    // reset de UI (mantém se preferir)
    form.reset?.();
    segBtns.forEach(b => b.classList.remove('active','selected'));
    posBtns.forEach(b => b.classList.remove('active','selected'));
    blue?.setAttribute('aria-pressed','false');
    red?.setAttribute('aria-pressed','false');
    blue?.classList.remove('selected');
    red?.classList.remove('selected');

    // tenta enviar ao backend (não bloqueante)
    try {
      const url = 'http://127.0.0.1:8000/api/respostas';
      const resp = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(data.payload)
      });
      const json = await resp.json().catch(()=>({}));
      if(!resp.ok){
        console.warn('Envio backend falhou:', resp.status, json);
        showToast('Salvo localmente — erro ao enviar ao servidor');
      } else {
        console.log('Enviado ao backend:', json);
        // opcional: atualizar registro local com id retornado
      }
    } catch(err){
      console.warn('Erro network ao enviar ao backend:', err);
      // notificamos, mas não impedimos
      showToast('Salvo localmente — sem conexão com servidor');
    }
  }

  // ligar evento salvar
  saveBtn?.addEventListener('click', saveRecord);

  // ===== export CSV =====
  exportBtn?.addEventListener('click', ()=> {
    const all = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    if(!all.length){ showToast('Nenhum registro para exportar'); return; }

    const headers = ['scouter','match_number','team_number','match_type','alliance','start_position','auto_score','teleop_cycles','endgame','notes','savedAt'];
    const rows = all.map(r => headers.map(h => {
      const v = r[h] ?? r[h.replace(/_/g,'')] ?? ''; // fallback se usar nomes diferentes
      return '"' + String(v).replace(/"/g, '""') + '"';
    }).join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ff_rd_scout_export.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Exportado CSV');
  });

  // ===== copiar registros (JSON) =====
  recordsBtn?.addEventListener('click', ()=> {
    const all = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    if(!all.length){ showToast('Sem registros'); return; }
    // tenta copiar para clipboard
    navigator.clipboard?.writeText(JSON.stringify(all, null, 2)).then(()=> {
      showToast(`Registros: ${all.length} (JSON copiado)`);
    }).catch(()=> {
      showToast(`Registros: ${all.length} (abra console)`);
      console.log(all);
    });
  });

  (function initMarks(){
    
    })();

})();

(function(){
  // elementos
  const segBtns = Array.from(document.querySelectorAll('.seg-btn'));
  const posBtns = Array.from(document.querySelectorAll('.pos-btn'));
  const blue = document.getElementById('blueAlliance');
  const red = document.getElementById('redAlliance');
  const saveBtn = document.getElementById('saveBtn');
  const form = document.getElementById('scoutForm');
  const toastEl = document.getElementById('toast');

  function showToast(msg, timeout = 1400){
    if(!toastEl){ console.log('TOAST:', msg); return; }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(()=> toastEl.classList.remove('show'), timeout);
  }

  function activateGroup(list, target){
    list.forEach(b => b.classList.toggle('active', b === target));
  }

  // handlers UI
  segBtns.forEach(b => b.addEventListener('click', ()=> activateGroup(segBtns, b)));
  posBtns.forEach(b => b.addEventListener('click', ()=> activateGroup(posBtns, b)));

  function toggleAlliance(el){
    if(!el) return;
    const pressed = el.getAttribute('aria-pressed') === 'true';
    blue?.setAttribute('aria-pressed','false');
    red?.setAttribute('aria-pressed','false');
    if(!pressed) el.setAttribute('aria-pressed','true');
    blue?.classList.toggle('selected', blue?.getAttribute('aria-pressed')==='true');
    red?.classList.toggle('selected', red?.getAttribute('aria-pressed')==='true');
  }
  blue?.addEventListener('click', ()=> toggleAlliance(blue));
  red?.addEventListener('click', ()=> toggleAlliance(red));

  // carregar rascunho se existir
  (function initFromDraft(){
    const draft = loadSection ? readDraft() : null;
    if(!draft || !draft.info) return;
    const info = draft.info;
    if(form.scouter) form.scouter.value = info.scouter || '';
    if(form.matchNumber) form.matchNumber.value = info.match_number || '';
    if(form.teamNumber) form.teamNumber.value = info.team_number || '';

    // match type - procura botao com data-type
    if(info.match_type){
      const btn = document.querySelector(`.seg-btn[data-type="${info.match_type}"]`);
      if(btn) activateGroup(segBtns, btn);
    }
    if(info.start_position){
      const pbtn = document.querySelector(`.pos-btn[data-pos="${info.start_position}"]`);
      if(pbtn) activateGroup(posBtns, pbtn);
    }
    if(info.alliance){
      if(info.alliance.toUpperCase() === 'BLUE') toggleAlliance(blue);
      if(info.alliance.toUpperCase() === 'RED') toggleAlliance(red);
    }
  })();

  // salvar seção info (sessionStorage)
  function saveInfoLocal(){
    const scouter = form.scouter?.value?.trim() || '';
    const matchNumber = parseInt((form.matchNumber?.value||'').replace(/\D/g,''),10) || 0;
    const teamNumber = parseInt((form.teamNumber?.value||'').replace(/\D/g,''),10) || 0;
    const matchType = document.querySelector('.seg-btn.active')?.dataset.type || document.querySelector('.seg-btn.selected')?.dataset.type || null;
    const alliance = (blue?.getAttribute('aria-pressed')==='true') ? 'BLUE' : ((red?.getAttribute('aria-pressed')==='true') ? 'RED' : null);
    const startPos = document.querySelector('.pos-btn.active')?.dataset.pos || document.querySelector('.pos-btn.selected')?.dataset.pos || null;

    if(!scouter || matchNumber <= 0 || teamNumber <= 0){
      showToast('Preencha: scouter, nº partida e nº do time', 1800);
      return;
    }

    saveSection('info', {
      scouter,
      match_number: matchNumber,
      team_number: teamNumber,
      match_type: matchType,
      alliance: alliance,
      start_position: startPos
    });
    showToast('Informações salvas localmente');
  }

  saveBtn?.addEventListener('click', ()=> {
    saveInfoLocal();
  });

  // salvar antes de navegar
  const nextBtn = document.getElementById('nextBtn');
  nextBtn?.addEventListener('click', ()=> {
    saveInfoLocal();
    // navigation handled by HTML onclick, so no preventDefault here
  });

})();

