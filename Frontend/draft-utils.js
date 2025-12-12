// draft-utils.js
const DRAFT_KEY = 'ff_rd_scout_draft';

function readDraft() {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY) || '{}');
  } catch (e) {
    console.warn('Erro lendo draft', e);
    return {};
  }
}

function writeDraft(draft) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (e) {
    console.warn('Erro escrevendo draft', e);
  }
}

function saveSection(name, obj) {
  const draft = readDraft();
  draft[name] = Object.assign({}, draft[name] || {}, obj);
  draft.savedAt = new Date().toISOString();
  writeDraft(draft);
  return draft;
}

function loadSection(name) {
  const draft = readDraft();
  return draft[name] || null;
}

function clearDraft() {
  sessionStorage.removeItem(DRAFT_KEY);
}
