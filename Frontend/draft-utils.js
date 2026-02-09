// draft-utils.js - VERSÃO MELHORADA
const DRAFT_KEY = "scoutAtual";

function initDraft(data) {
  // Se data for undefined ou null, cria draft vazio
  if (!data) {
    data = {};
  }
  
  // Verifica se data já é um draft completo
  const isCompleteDraft = data.basic !== undefined && 
                          data.auto !== undefined && 
                          data.teleop !== undefined && 
                          data.endgame !== undefined;
  
  let draft;
  
  if (isCompleteDraft) {
    // Se já tem estrutura completa, usa como está
    draft = {
      basic: data.basic || {},
      auto: data.auto || {},
      teleop: data.teleop || {},
      endgame: data.endgame || {}
    };
  } else {
    // Se não, assume que é apenas o basic
    draft = {
      basic: data || {},
      auto: {},
      teleop: {},
      endgame: {}
    };
  }
  
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  console.log("💾 Draft inicializado:", draft);
  return draft;
}

function readDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) {
    console.log("📭 Nenhum draft encontrado no localStorage");
    return null;
  }
  
  try {
    const draft = JSON.parse(raw);
    
    // Garante que todas as seções existem
    const safeDraft = {
      basic: draft.basic || {},
      auto: draft.auto || {},
      teleop: draft.teleop || {},
      endgame: draft.endgame || {}
    };
    
    console.log("📖 Draft lido:", safeDraft);
    return safeDraft;
  } catch (error) {
    console.error("❌ Erro ao ler draft:", error);
    return null;
  }
}

function saveSection(section, data) {
  const validSections = ["basic", "auto", "teleop", "endgame"];
  
  if (!validSections.includes(section)) {
    console.error(`❌ Seção inválida: ${section}`);
    return null;
  }
  
  const draft = readDraft();
  if (!draft) {
    console.error("❌ Nenhum draft encontrado para atualizar");
    return null;
  }
  
  draft[section] = { ...draft[section], ...data };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  
  console.log(`✅ Seção '${section}' atualizada:`, draft[section]);
  console.log("📋 Draft completo após atualização:", draft);
  
  return draft;
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
  console.log("🗑️ Draft removido do localStorage");
}

function getDraftBasic() {
  const draft = readDraft();
  return draft?.basic || null;
}

function logDraft() {
  const draft = readDraft();
  if (draft) {
    console.log("📊 DEBUG - Draft atual:");
    console.log("- Basic:", draft.basic);
    console.log("- Auto:", draft.auto);
    console.log("- Teleop:", draft.teleop);
    console.log("- Endgame:", draft.endgame);
  } else {
    console.log("📊 DEBUG - Nenhum draft encontrado");
  }
}
