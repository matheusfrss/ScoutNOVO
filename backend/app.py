# app.py
import os
import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# supabase client
from supabase import create_client, Client

load_dotenv()

# logging
logging.basicConfig(level=logging.DEBUG)
log = logging.getLogger("scouting-api")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE:
    log.error("Variáveis SUPABASE_URL ou SUPABASE_SERVICE_ROLE não definidas no .env")
    # não raise para facilitar debug

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

# CORS (dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

    record = payload.dict(exclude_none=True)

    # se não veio created_at, adiciona timestamp UTC (mas permitimos remover se tabela não tiver coluna)
    record.setdefault("created_at", datetime.utcnow().isoformat())

    if not supabase:
        log.error("Supabase não inicializado. Recebido: %s", record)
        raise HTTPException(status_code=500, detail="Supabase não configurado no servidor")

    def try_insert(obj):
        """Tenta inserir e retorna (success_bool, response_or_exception)"""
        try:
            res = supabase.table("FederalForceDB").insert(obj).execute()
            return True, res
        except Exception as exc:
            return False, exc

    ok, resp = try_insert(record)

    # se falhou, tentamos detectar erro óbvio de "coluna inexistente" e re-tentar sem a chave problematica
    if not ok:
        err_str = str(resp)
        log.warning("Insert falhou (primeira tentativa): %s", err_str)

        # heurística: mensagem do postgres/supabase costuma conter "Could not find the 'COLUMN' column"
        if "Could not find the" in err_str or "could not find the" in err_str or "column" in err_str:
            # remova created_at se existir e tentar de novo
            if "created_at" in record:
                record.pop("created_at", None)
                log.info("Removendo 'created_at' do payload e tentando inserir novamente")
                ok2, resp2 = try_insert(record)
                if ok2:
                    res = resp2
                else:
                    log.exception("Segunda tentativa de insert falhou: %s", resp2)
                    raise HTTPException(status_code=500, detail="Erro interno ao gravar dados")
            else:
                log.exception("Insert falhou e não havia 'created_at' para remover: %s", resp)
                raise HTTPException(status_code=500, detail="Erro interno ao gravar dados")
        else:
            log.exception("Erro ao inserir no Supabase: %s", resp)
            raise HTTPException(status_code=500, detail="Erro interno ao gravar dados")
    else:
        res = resp

    # checar retorno do client e possíveis erros no objeto (varia por versão)
    if getattr(res, "error", None):
        log.error("Supabase returned error: %s", res.error)
        raise HTTPException(status_code=500, detail="Erro interno ao gravar dados")

    data = getattr(res, "data", None) or res
    return {"data": data}

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
