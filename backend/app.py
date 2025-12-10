# app.py
import os
import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# supabase client
from supabase import create_client, Client  # já estava assim no seu projeto

load_dotenv()

# logging
logging.basicConfig(level=logging.DEBUG)
log = logging.getLogger("scouting-api")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE:
    log.error("Variáveis SUPABASE_URL ou SUPABASE_SERVICE_ROLE não definidas no .env")
    # não raise para facilitar debug — mas você pode forçar com raise RuntimeError(...)
    # raise RuntimeError("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE no .env")

# cria cliente supabase (pode falhar se chave inválida)
supabase: Client | None = None
try:
    if SUPABASE_URL and SUPABASE_SERVICE_ROLE:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
        log.debug("Supabase client criado")
    else:
        log.debug("Supabase não inicializado por falta de variáveis")
except Exception as e:
    log.exception("Erro criando cliente Supabase: %s", e)
    supabase = None

app = FastAPI(title="Scouting API")

# === CORS ===
# Para desenvolvimento, liberamos tudo. Em produção, ajuste para permitir somente origens seguras.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     # <- troque para lista de domínios em produção
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScoutingPayload(BaseModel):
    scouter: str
    match_number: int
    team_number: int
    match_type: str | None = None
    alliance: str | None = None
    start_position: str | None = None
    auto_score: int | None = 0
    teleop_cycles: int | None = 0
    endgame: str | None = ""
    notes: str | None = ""
    created_at: str | None = None

@app.get("/")
async def root():
    return {"status": "ok", "message": "Scouting API running", "docs": "/docs"}

@app.post("/api/respostas", status_code=201)
async def create_resposta(payload: ScoutingPayload):
    # validação mínima
    if not payload.scouter or payload.match_number <= 0 or payload.team_number <= 0:
        raise HTTPException(status_code=400, detail="Campos obrigatórios inválidos")

    record = payload.dict()
    if not record.get("created_at"):
        record["created_at"] = datetime.utcnow().isoformat()

    # se supabase não inicializado, salva local (debug) e retorna
    if not supabase:
        log.error("Supabase não inicializado. Recebido: %s", record)
        raise HTTPException(status_code=500, detail="Supabase não configurado no servidor")

    try:
        res = supabase.table("FederalForceDB").insert(record).execute()
        # dependendo da versão do client, o retorno pode variar; tentamos capturar erro
        if getattr(res, "error", None):
            log.error("Supabase error: %s", res.error)
            raise HTTPException(status_code=500, detail=str(res.error))
        data = getattr(res, "data", None) or res
        return {"data": data}
    except Exception as e:
        log.exception("Erro ao inserir no Supabase: %s", e)
        raise HTTPException(status_code=500, detail="Erro interno ao gravar dados")

@app.get("/api/respostas")
async def list_respostas(limit: int = 100):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase não configurado no servidor")
    try:
        res = supabase.table("FederalForceDB").select("*").limit(limit).execute()
        if getattr(res, "error", None):
            log.error("Supabase error: %s", res.error)
            raise HTTPException(status_code=500, detail=str(res.error))
        data = getattr(res, "data", None) or res
        return {"data": data}
    except Exception as e:
        log.exception("Erro ao listar respostas: %s", e)
        raise HTTPException(status_code=500, detail="Erro interno ao buscar dados")
