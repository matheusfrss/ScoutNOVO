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

# ======================
# DEBUG DE CONFIG
# ======================
print("=" * 50)
print("CONFIGURAÇÃO SUPABASE")
print("=" * 50)
print(f"SUPABASE_URL: {'OK' if SUPABASE_URL else 'ERRO'}")
print(f"SUPABASE_KEY: {'OK' if SUPABASE_KEY else 'ERRO'}")
print("=" * 50)

# ======================
# ROTA PRINCIPAL
# ======================
@app.route("/api/salvar_robo", methods=["POST"])
def salvar_robo():
    try:
        print("🔵 /api/salvar_robo chamado")

        dados = request.json
        print("📥 JSON recebido:")
        print(json.dumps(dados, indent=2))

        if not dados:
            return jsonify({"erro": "JSON vazio"}), 400

        # ===== SEÇÕES =====
        basic = dados.get("basic", {})
        auto = dados.get("auto", {})
        teleop = dados.get("teleop", {})
        endgame = dados.get("endgame", {})

        # ===== VALIDAÇÃO =====
        if not basic.get("matchNumber") or not basic.get("teamNumber"):
            return jsonify({
                "erro": "num_partida ou num_equipe ausente"
            }), 400

        # ===== PAYLOAD SUPABASE =====
        payload = {
            # --- Básico ---
            "num_partida": basic.get("matchNumber"),
            "num_equipe": basic.get("teamNumber"),
            "nome_scout": basic.get("scouter"),
            "tipo_partida": basic.get("matchType"),
            "alianca": basic.get("alliance"),
            "posicao_inicial": basic.get("startingPosition"),

            # --- Autônomo ---
            "autonomo": json.dumps({
                "ultrapassou_linha": auto.get("crossedLine"),
                "artefatos_idade_media": auto.get("mediaArtifacts", 0),
                "artefatos_pre_historicos": auto.get("prehistoricArtifacts", 0)
            }),

            # --- Teleop ---
            "teleop": json.dumps({
                "artefatos_idade_media": teleop.get("mediaArtifacts", 0),
                "artefatos_pre_historicos": teleop.get("prehistoricArtifacts", 0)
            }),

            # --- Endgame ---
            "endgame": json.dumps({
                "estacionou_pozo": endgame.get("estacionouPoco"),
                "estacionou_sitio": endgame.get("estacionouSitio"),
                "robo_parou": endgame.get("roboParou"),
                "penalidades": endgame.get("penalidades", ""),
                "estrategia": endgame.get("estrategia", "")
            }),

            # --- Backup completo ---
            "dados_json": json.dumps(dados)
        }

        print("📤 Payload Supabase:")
        print(json.dumps(payload, indent=2))

        # ===== HEADERS =====
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

        print(f"📨 Supabase status: {response.status_code}")
        print(response.text)

        if response.status_code in (200, 201):
            res = response.json()
            return jsonify({
                "status": "ok",
                "id": res[0]["id"] if res else None
            })

        return jsonify({
            "erro": "Falha ao salvar no Supabase",
            "status_code": response.status_code,
            "resposta": response.text
        }), 500

    except Exception as e:
        print("💥 ERRO:")
        print(traceback.format_exc())
        return jsonify({
            "erro": str(e)
        }), 500


# ======================
# ROTAS DE TESTE
# ======================
@app.route("/teste")
def teste():
    return jsonify({
        "status": "ok",
        "mensagem": "API Flask funcionando"
    })

@app.route("/teste_supabase")
def teste_supabase():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }

    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}?limit=1",
        headers=headers
    )

    return jsonify({
        "status_code": r.status_code,
        "dados": r.json() if r.status_code == 200 else r.text
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=3080,
        debug=True
    )
