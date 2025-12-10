# app.py
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE:
    raise RuntimeError("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE no .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

app = FastAPI(title="Scouting API")

# Ajuste as origins se seu frontend rodar em outra porta/domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"],
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

@app.post("/api/respostas", status_code=201)
async def create_resposta(payload: ScoutingPayload):
    if not payload.scouter or payload.match_number <= 0 or payload.team_number <= 0:
        raise HTTPException(status_code=400, detail="Campos obrigatórios inválidos")

    record = payload.dict()
    from datetime import datetime
    if not record.get("created_at"):
        record["created_at"] = datetime.utcnow().isoformat()

    res = supabase.table("FederalForceDB").insert(record).execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=str(res.error))
    return {"data": getattr(res, "data", None)}

@app.get("/api/respostas")
async def list_respostas(limit: int = 100):
    res = supabase.table("FederalForceDB").select("*").limit(limit).execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=str(res.error))
    return {"data": getattr(res, "data", None)}

# DEBUG temp
print("DEBUG: fim de app.py — variáveis em globals():", [k for k in globals().keys() if not k.startswith('__')])
