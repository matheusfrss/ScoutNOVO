from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
import json
import traceback

load_dotenv()

app = Flask(__name__)

# ======================

# CORS DEFINITIVO

# ======================

CORS(app, resources={r"/*": {"origins": "*"}})

@app.after_request
def add_headers(response):
response.headers["Access-Control-Allow-Origin"] = "*"
response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
return response

# ======================

# HANDLER GLOBAL OPTIONS

# ======================

@app.route('/api/[path:path](path:path)', methods=['OPTIONS'])
def options_handler(path):
return jsonify({"status": "ok"}), 200

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
TABLE_NAME = "robos"
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

# ======================

# DEBUG CONFIG

# ======================

print("=" * 50)
print("CONFIGURAÇÃO SUPABASE")
print("=" * 50)
print(f"SUPABASE_URL: {'OK' if SUPABASE_URL else 'ERRO'}")
print(f"SUPABASE_KEY: {'OK' if SUPABASE_KEY else 'ERRO'}")
print(f"ADMIN_PASSWORD: {'OK' if ADMIN_PASSWORD else 'ERRO'}")
print("=" * 50)

# ======================

# SALVAR ROBO

# ======================

@app.route("/api/salvar_robo", methods=["POST"])
def salvar_robo():

```
try:

    print("🔵 /api/salvar_robo chamado")

    dados = request.get_json(silent=True)

    print("📥 JSON recebido:")
    print(json.dumps(dados, indent=2, ensure_ascii=False))

    if not dados:
        return jsonify({
            "status": "erro",
            "mensagem": "JSON vazio"
        }), 400


    basic = dados.get("basic", {})
    auto = dados.get("auto", {})
    teleop = dados.get("teleop", {})
    endgame = dados.get("endgame", {})


    if not basic.get("matchNumber") or not basic.get("teamNumber"):
        return jsonify({
            "status": "erro",
            "mensagem": "matchNumber ou teamNumber ausente"
        }), 400


    if not SUPABASE_URL or not SUPABASE_KEY:
        return jsonify({
            "status": "erro",
            "mensagem": "Supabase não configurado"
        }), 500


    payload = {

        "num_partida": basic.get("matchNumber"),
        "num_equipe": basic.get("teamNumber"),
        "nome_scout": basic.get("scouter", ""),
        "tipo_partida": basic.get("matchType", ""),
        "alianca": basic.get("alliance", ""),
        "posicao_inicial": basic.get("startingPosition"),

        "autonomo": auto,
        "teleop": teleop,
        "endgame": endgame,

        "dados_json": dados
    }


    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }


    url = f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}"


    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=10
    )


    print("📨 Supabase status:", response.status_code)
    print(response.text)


    if response.status_code in (200, 201):

        return jsonify({
            "status": "ok",
            "mensagem": "Scouting salvo com sucesso!"
        })


    return jsonify({
        "status": "erro",
        "mensagem": "Falha ao salvar no Supabase",
        "detalhes": response.text
    }), 500


except Exception:

    print("💥 ERRO:")
    print(traceback.format_exc())

    return jsonify({
        "status": "erro",
        "mensagem": "Erro interno no servidor"
    }), 500
```

# ======================

# RESET COMPETIÇÃO

# ======================

@app.route("/api/reset_competicao", methods=["POST"])
def reset_competicao():

```
try:

    data = request.get_json(silent=True) or {}
    senha = data.get("senha")

    if not ADMIN_PASSWORD:
        return jsonify({
            "status": "erro",
            "mensagem": "ADMIN_PASSWORD não configurado"
        }), 500


    if senha != ADMIN_PASSWORD:
        return jsonify({
            "status": "erro",
            "mensagem": "Senha incorreta"
        }), 403


    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }


    url = f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}?num_partida=gt.0"


    response = requests.delete(url, headers=headers, timeout=10)


    print("🧹 Reset status:", response.status_code)


    if response.status_code in (200, 204):

        return jsonify({
            "status": "ok",
            "mensagem": "Competição resetada"
        })


    return jsonify({
        "status": "erro",
        "mensagem": "Falha ao resetar",
        "detalhes": response.text
    }), 500


except Exception:

    print(traceback.format_exc())

    return jsonify({
        "status": "erro",
        "mensagem": "Erro interno"
    }), 500
```

# ======================

# TESTE API

# ======================

@app.route("/teste")
def teste():

```
return jsonify({
    "status": "ok",
    "mensagem": "API Flask funcionando VERSAO NOVA 2026"
})
```

# ======================

# HOME

# ======================

@app.route("/")
def home():

```
return jsonify({
    "status": "ok",
    "mensagem": "ScoutNOVO API online 🚀"
})
```

# ======================

# RUN LOCAL

# ======================

if **name** == "**main**":

```
app.run(
    host="0.0.0.0",
    port=3080,
    debug=True
)
```
