/* script_endgame.js
   - Toggle SIM/NÃO groups for three questions
   - Textarea for penalties
   - Select for strategy (defesa/ataque)
   - Auto-save to localStorage on change
   - Navigation back / finish
*/

(function(){
  const pitYes = document.getElementById('pitYes');
  const pitNo  = document.getElementById('pitNo');

  const siteYes = document.getElementById('siteYes');
  const siteNo  = document.getElementById('siteNo');

  const stoppedYes = document.getElementById('stoppedYes');
  const stoppedNo  = document.getElementById('stoppedNo');

  const penalties = document.getElementById('penalties');
  const strategy = document.getElementById('strategy');

  const backBtn = document.getElementById('backBtn');
  const finishBtn = document.getElementById('finishBtn');

  const toastEl = document.getElementById('toast');
  const STORE_KEY = 'ff_endgame_v1';

  // helper toast
  function toast(msg, t=1200){
    const it = document.createElement('div');
    it.className = 'item';
    it.textContent = msg;
    toastEl.appendChild(it);
    setTimeout(()=> { it.style.opacity = 0; setTimeout(()=> it.remove(), 300); }, t);
  }

  // generic toggle group helper
  function makeToggle(a, b){
    a.addEventListener('click', ()=> {
      a.classList.add('active'); b.classList.remove('active');
      save();
    });
    b.addEventListener('click', ()=> {
      b.classList.add('active'); a.classList.remove('active');
      save();
    });
  }

  makeToggle(pitYes, pitNo);
  makeToggle(siteYes, siteNo);
  makeToggle(stoppedYes, stoppedNo);

  // save function (auto-save current values)
  function save(){
    const entry = {
      pitFully: pitYes.classList.contains('active') ? 'sim' : (pitNo.classList.contains('active') ? 'nao' : null),
      sitePartial: siteYes.classList.contains('active') ? 'sim' : (siteNo.classList.contains('active') ? 'nao' : null),
      stopped: stoppedYes.classList.contains('active') ? 'sim' : (stoppedNo.classList.contains('active') ? 'nao' : null),
      penalties: penalties.value.trim() || '',
      strategy: strategy.value || '',
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORE_KEY, JSON.stringify(entry));
    // small feedback
    // toast('Endgame salvo'); // opcional - pode comentar para não poluir
  }

  // save on input changes
  penalties.addEventListener('input', save);
  strategy.addEventListener('change', save);

  // navigation
  backBtn.addEventListener('click', ()=> {
    window.location.href = 'teleop.html';
  });

  finishBtn.addEventListener('click', ()=> {
    // simplesmente volta à index (ou onde preferir). Aqui vamos para index.html
    toast('Formulário finalizado');
    setTimeout(()=> window.location.href = 'index.html', 700);
  });

  // preload saved values (if any)
  (function load(){
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if(!saved) return;
    if(saved.pitFully === 'sim') pitYes.classList.add('active');
    if(saved.pitFully === 'nao') pitNo.classList.add('active');

    if(saved.sitePartial === 'sim') siteYes.classList.add('active');
    if(saved.sitePartial === 'nao') siteNo.classList.add('active');

    if(saved.stopped === 'sim') stoppedYes.classList.add('active');
    if(saved.stopped === 'nao') stoppedNo.classList.add('active');

    penalties.value = saved.penalties || '';
    strategy.value = saved.strategy || '';
  })();

})();
