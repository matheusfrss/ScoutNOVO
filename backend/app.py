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
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")  # 🔐 senha admin

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
# FUNÇÃO AUXILIAR SEGURA
# ======================
def pick(*values, default=0):
    """
    Retorna o primeiro valor que NÃO seja None.
    Aceita 0 como valor válido.
    """
    for v in values:
        if v is not None:
            return v
    return default

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
            "nome_scout": basic.get("scouter", ""),
            "tipo_partida": basic.get("matchType", "qualificatoria"),
            "alianca": basic.get("alliance", "vermelho"),
            "posicao_inicial": basic.get("startingPosition", "1"),

            # --- Autônomo ---
            "autonomo": json.dumps({
                "ultrapassou_linha": auto.get("crossedLine", False),
                "artefatos_idade_media": pick(
                    auto.get("artefatosIdadeMedia"),
                    auto.get("artefatosMedios"),
                    auto.get("mediaArtifacts"),
                    default=0
                ),
                "artefatos_pre_historicos": pick(
                    auto.get("artefatosPreHistoricos"),
                    auto.get("prehistoricArtifacts"),
                    default=0
                )
            }),

            # --- Teleop ---
            "teleop": json.dumps({
                "artefatos_idade_media": pick(
                    teleop.get("artefatosMedios"),
                    teleop.get("mediaArtifacts"),
                    default=0
                ),
                "artefatos_pre_historicos": pick(
                    teleop.get("artefatosPreHistoricos"),
                    teleop.get("prehistoricArtifacts"),
                    default=0
                )
            }),

            # --- Endgame ---
            "endgame": json.dumps({
                "estacionou_pozo": endgame.get("estacionouPoco", False),
                "estacionou_sitio": endgame.get("estacionouSitio", False),
                "robo_parou": endgame.get("roboParou", False),
                "penalidades": endgame.get("penalidades", ""),
                "estrategia": endgame.get("estrategia", "")
            }),

            # --- Backup completo ---
            "dados_json": json.dumps(dados)
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

        print(f"📨 Supabase status: {response.status_code}")
        print(response.text)

        if response.status_code in (200, 201):
            res = response.json()
            return jsonify({
                "status": "ok",
                "mensagem": "Scouting salvo com sucesso!",
                "id": res[0]["id"] if res else None
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
        data = request.json or {}
        senha = data.get("senha")

        if senha != ADMIN_PASSWORD:
            return jsonify({
                "status": "erro",
                "mensagem": "Senha de administrador incorreta"
            }), 403

        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}"
        }

        url = f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}?id=neq.0"

        response = requests.delete(url, headers=headers)

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

# ======================
# TESTE
# ======================
@app.route("/teste")
def teste():
    return jsonify({
        "status": "ok",
        "mensagem": "API Flask funcionando"
    })

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=3080,
        debug=True
    )
