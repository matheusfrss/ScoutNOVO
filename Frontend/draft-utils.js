// draft-utils.js
const DRAFT_KEY = "scoutAtual";

function initDraft(basic) {
  const draft = {
    basic: basic || {},
    auto: {},
    teleop: {},
    endgame: {}
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  return draft;
}

function readDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveSection(section, data) {
  const draft = readDraft();
  if (!draft) return null;

  draft[section] = data;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  return draft;
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}
