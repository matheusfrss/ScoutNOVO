// draft-utils.js
const DRAFT_KEY = "scoutAtual";

/**
 * Cria um novo scout (usado na página inicial)
 */
function initDraft(info) {
  const draft = {
    info: info || {},
    autonomo: {},
    teleop: {},
    endgame: {}
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  return draft;
}

/**
 * Lê o scout atual
 */
function readDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Salva uma seção específica (autonomo, teleop, endgame)
 */
function saveSection(section, data) {
  const draft = readDraft();
  if (!draft) return null;

  draft[section] = data;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  return draft;
}

/**
 * Finaliza o scout (usado no endgame)
 */
function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}
