from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

# Carrega variáveis do .env
load_dotenv()

app = Flask(__name__)
CORS(app)  # Permite frontend acessar

# Configurações do Supabase (coloque no .env)
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://seu-projeto.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sua-anon-key")
TABLE_NAME = "scout_data"  # Nome da sua tabela

@app.route("/api/salvar_robo", methods=["POST"])
def salvar_robo():
    """Recebe dados do frontend e salva no Supabase"""
    try:
        # 1. Pega dados do frontend
        dados = request.json
        print("📥 Dados recebidos:", dados)
        
        if not dados:
            return jsonify({
                "status": "erro",
                "mensagem": "Nenhum dado recebido"
            }), 400
        
        # 2. Converte para estrutura do Supabase
        payload = {
            "team_number": dados.get("teamNumber"),
            "match_number": dados.get("matchNumber"),
            "alliance_color": dados.get("allianceColor", "red"),
            "scout_name": dados.get("scoutName", ""),
            "auto_points": dados.get("autoPoints", 0),
            "teleop_points": dados.get("teleopPoints", 0),
            "endgame_points": dados.get("endgamePoints", 0),
            "total_points": dados.get("totalPoints", 0),
            "comments": dados.get("comments", "")
        }
        
        # 3. Headers para Supabase
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"  # Só confirmação, não retorna dados
        }
        
        # 4. Envia para Supabase
        resposta = requests.post(
            f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}",
            json=payload,
            headers=headers
        )
        
        # 5. Verifica resposta
        if resposta.status_code in [200, 201]:
            print("✅ Salvo no Supabase! Status:", resposta.status_code)
            return jsonify({
                "status": "ok",
                "mensagem": "Dados salvos com sucesso!"
            })
        else:
            print("❌ Erro Supabase:", resposta.status_code, resposta.text)
            return jsonify({
                "status": "erro",
                "mensagem": f"Falha ao salvar: {resposta.text}"
            }), 500
            
    except Exception as erro:
        print(f"💥 Erro interno: {erro}")
        return jsonify({
            "status": "erro",
            "mensagem": f"Erro no servidor: {str(erro)}"
        }), 500

@app.route("/")
def home():
    return jsonify({
        "api": "ScoutBOX Backend",
        "versao": "1.0",
        "rota_principal": "POST /api/salvar_robo"
    })

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=3080)