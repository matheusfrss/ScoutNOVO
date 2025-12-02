
(function(){
  const segBtns = document.querySelectorAll('.seg-btn');
  const posBtns = document.querySelectorAll('.pos-btn');
  const blue = document.getElementById('blueAlliance');
  const red = document.getElementById('redAlliance');
  const saveBtn = document.getElementById('saveBtn');
  const exportBtn = document.getElementById('exportBtn');
  const recordsBtn = document.getElementById('recordsBtn');
  const form = document.getElementById('scoutForm');
  const toastEl = document.getElementById('toast');

  function activateGroup(list, target){
    list.forEach(b => b.classList.toggle('active', b === target));
  }

  segBtns.forEach(b => b.addEventListener('click', ()=> activateGroup(segBtns, b)));
  posBtns.forEach(b => b.addEventListener('click', ()=> activateGroup(posBtns, b)));

  function toggleAlliance(el){
    const pressed = el.getAttribute('aria-pressed') === 'true';
    blue.setAttribute('aria-pressed','false');
    red.setAttribute('aria-pressed','false');
    if(!pressed) el.setAttribute('aria-pressed','true');
  }
  blue.addEventListener('click', ()=> toggleAlliance(blue));
  red.addEventListener('click', ()=> toggleAlliance(red));

  function toast(msg, timeout = 1600){
    const item = document.createElement('div');
    item.className = 'item';
    item.textContent = msg;
    toastEl.appendChild(item);
    setTimeout(()=> {
      item.style.opacity = '0';
      setTimeout(()=> item.remove(), 300);
    }, timeout);
  }

  const STORE_KEY = 'ff_rd_scout_v2';

  saveBtn.addEventListener('click', ()=>{
    const data = {
      scouter: form.scouter.value.trim(),
      matchNumber: form.matchNumber.value.trim(),
      teamNumber: form.teamNumber.value.trim(),
      matchType: document.querySelector('.seg-btn.active')?.dataset.type || null,
      alliance: blue.getAttribute('aria-pressed')==='true' ? 'blue' : (red.getAttribute('aria-pressed')==='true' ? 'red' : null),
      startPos: document.querySelector('.pos-btn.active')?.dataset.pos || null,
      savedAt: new Date().toISOString()
    };

    if(!data.scouter || !data.matchNumber || !data.teamNumber){
      toast('Preencha: scouter, nº partida e nº do time', 2200);
      return;
    }

    const prev = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    prev.push(data);
    localStorage.setItem(STORE_KEY, JSON.stringify(prev));

    saveBtn.classList.add('saved');
    saveBtn.textContent = 'Salvo ✓';
    setTimeout(()=> { saveBtn.classList.remove('saved'); saveBtn.textContent = 'Salvar'; }, 1000);

    toast('Registro salvo', 1400);

    // reset form & UI toggles
    form.reset();
    segBtns.forEach(b => b.classList.remove('active'));
    posBtns.forEach(b => b.classList.remove('active'));
    blue.setAttribute('aria-pressed','false');
    red.setAttribute('aria-pressed','false');
  });

  // Export CSV (simples)
  exportBtn?.addEventListener('click', ()=>{
    const all = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    if(!all.length){ toast('Nenhum registro para exportar'); return; }

    const headers = ['scouter','matchNumber','teamNumber','matchType','alliance','startPos','savedAt'];
    const rows = all.map(r => headers.map(h => {
      const v = r[h] ?? '';
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
    toast('Exportado CSV');
  });


  recordsBtn?.addEventListener('click', ()=>{
    const all = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    if(!all.length){ toast('Sem registros'); return; }
    navigator.clipboard?.writeText(JSON.stringify(all, null, 2)).then(()=> {
      toast(`Registros: ${all.length} (JSON copiado)`);
    }).catch(()=> {
      toast(`Registros: ${all.length} (abra console)`);
      console.log(all);
    });
  });

})();

