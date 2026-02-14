from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
import json
import traceback

load_dotenv()

app = Flask(__name__)
CORS(app)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
TABLE_NAME = "robos"
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

# ======================
# DEBUG DE CONFIG
# ======================
print("=" * 50)
print("CONFIGURAÇÃO SUPABASE")
print("=" * 50)
print(f"SUPABASE_URL: {'OK' if SUPABASE_URL else 'ERRO'}")
print(f"SUPABASE_KEY: {'OK' if SUPABASE_KEY else 'ERRO'}")
print(f"ADMIN_PASSWORD: {'OK' if ADMIN_PASSWORD else 'ERRO'}")
print("=" * 50)

# ======================
# ROTA PRINCIPAL
# ======================
@app.route("/api/salvar_robo", methods=["POST"])
def salvar_robo():
    try:
        print("🔵 /api/salvar_robo chamado")

        dados = request.get_json(silent=True)

        print("📥 JSON recebido:")
        print(json.dumps(dados, indent=2, ensure_ascii=False))

        if not dados:
            return jsonify({"status": "erro", "mensagem": "JSON vazio"}), 400

        # ===== SEÇÕES =====
        basic = dados.get("basic", {})
        auto = dados.get("auto", {})
        teleop = dados.get("teleop", {})
        endgame = dados.get("endgame", {})

        # ===== VALIDAÇÃO =====
        if not basic.get("matchNumber") or not basic.get("teamNumber"):
            return jsonify({
                "status": "erro",
                "mensagem": "matchNumber ou teamNumber ausente"
            }), 400

        if not SUPABASE_URL or not SUPABASE_KEY:
            return jsonify({
                "status": "erro",
                "mensagem": "Supabase não configurado (env faltando)"
            }), 500

        # ✅ PAYLOAD: salva exatamente como veio do Front
        payload = {
            # --- Básico ---
            "num_partida": basic.get("matchNumber"),
            "num_equipe": basic.get("teamNumber"),
            "nome_scout": basic.get("scouter", ""),
            "tipo_partida": basic.get("matchType", ""),
            "alianca": basic.get("alliance", ""),
            "posicao_inicial": basic.get("startingPosition", ""),

            # --- JSONB RAW (sem renomear chaves) ---
            "autonomo": auto,
            "teleop": teleop,
            "endgame": endgame,

            # --- Backup completo ---
            "dados_json": dados
        }

        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

        url = f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}"

        response = requests.post(url, headers=headers, json=payload, timeout=10)

        print(f"📨 Supabase status: {response.status_code}")
        print(response.text)

        return jsonify({
    "status": "ok",
    "mensagem": "Scouting salvo com sucesso!"
    })
    
        return jsonify({
            "status": "erro",
            "mensagem": "Falha ao salvar no Supabase",
            "resposta": response.text
        }), 500

    except Exception:
        print("💥 ERRO:")
        print(traceback.format_exc())
        return jsonify({
            "status": "erro",
            "mensagem": "Erro interno"
        }), 500


# ======================
# RESET DA COMPETIÇÃO (ADMIN)
# ======================
@app.route("/api/reset_competicao", methods=["POST"])
def reset_competicao():
    try:
        data = request.get_json(silent=True) or {}
        senha = data.get("senha")

        if not ADMIN_PASSWORD:
            return jsonify({
                "status": "erro",
                "mensagem": "ADMIN_PASSWORD não configurado no servidor"
            }), 500

        if senha != ADMIN_PASSWORD:
            return jsonify({
                "status": "erro",
                "mensagem": "Senha de administrador incorreta"
            }), 403

        if not SUPABASE_URL or not SUPABASE_KEY:
            return jsonify({
                "status": "erro",
                "mensagem": "Supabase não configurado (env faltando)"
            }), 500

        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}"
        }

        url = f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}?num_partida=gt.0"

        response = requests.delete(url, headers=headers, timeout=10)

        print(f"🧹 Reset Supabase status: {response.status_code}")
        print(response.text)

        if response.status_code in (200, 204):
            return jsonify({
                "status": "ok",
                "mensagem": "Competição resetada com sucesso"
            })

        return jsonify({
            "status": "erro",
            "mensagem": "Falha ao resetar competição",
            "detalhes": response.text
        }), 500

    except Exception:
        print(traceback.format_exc())
        return jsonify({
            "status": "erro",
            "mensagem": "Erro interno"
        }), 500


@app.route("/teste")
def teste():
    return jsonify({
        "status": "ok",
        "mensagem": "API Flask funcionando VERSAO NOVA 2026"
    })



@app.route("/")
def home():
    return jsonify({
        "status": "ok",
        "mensagem": "ScoutNOVO API online 🚀"
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=3080,
        debug=True
    )
