from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
import json
import traceback  # Adicione esta linha

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configurações
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
TABLE_NAME = "robos"

# VERIFICAÇÃO DAS VARIÁVEIS DE AMBIENTE
print("=" * 50)
print("VERIFICAÇÃO DE CONFIGURAÇÃO SUPABASE")
print("=" * 50)
print(f"SUPABASE_URL presente: {'✅ SIM' if SUPABASE_URL else '❌ NÃO'}")
print(f"SUPABASE_KEY presente: {'✅ SIM' if SUPABASE_KEY else '❌ NÃO'}")
if SUPABASE_URL:
    print(f"URL: {SUPABASE_URL[:30]}...")  # Mostra só parte por segurança
if SUPABASE_KEY:
    print(f"Key: {SUPABASE_KEY[:20]}...")  # Mostra só parte
print("=" * 50)

@app.route("/api/salvar_robo", methods=["POST"])
def salvar_robo():
    """Recebe dados completos das 4 páginas"""
    try:
        print("🔵 ROTA /api/salvar_robo ACESSADA")
        dados = request.json
        print(f"📥 Dados recebidos: {json.dumps(dados, indent=2)}")
        
        # Validação básica
        if not dados:
            print("❌ Dados vazios recebidos")
            return jsonify({
                "status": "erro",
                "mensagem": "Nenhum dado recebido"
            }), 400
        
        campos_obrigatorios = ["num_partida", "num_equipe"]
        for campo in campos_obrigatorios:
            if campo not in dados:
                print(f"❌ Campo obrigatório faltando: {campo}")
                return jsonify({
                    "status": "erro",
                    "mensagem": f"Campo obrigatório faltando: {campo}"
                }), 400
        
        # Preparar payload para Supabase
        payload = {
            # 1ª Página
            "num_partida": dados.get("num_partida"),
            "tipo_partida": dados.get("tipo_partida", "qualificatoria"),
            "num_equipe": dados.get("num_equipe"),
            "alianca": dados.get("alianca", "vermelho"),
            "posicao_inicial": dados.get("posicao_inicial", "1"),
            "nome_scout": dados.get("nome_scout", ""),
            
            # JSON fields
            "autonomo": json.dumps({
                "ultrapassou_linha": dados.get("ultrapassou_linha", False),
                "artefatos_idade_media": dados.get("artefatos_idade_media_auto", 0),
                "artefatos_pre_historicos": dados.get("artefatos_pre_historicos_auto", 0)
            }),
            
            "teleop": json.dumps({
                "artefatos_idade_media": dados.get("artefatos_idade_media_teleop", 0),
                "artefatos_pre_historicos": dados.get("artefatos_pre_historicos_teleop", 0)
            }),
            
            "endgame": json.dumps({
                "estacionou_pozo": dados.get("estacionou_pozo", False),
                "estacionou_sitio": dados.get("estacionou_sitio", False),
                "robo_parou": dados.get("robo_parou", False),
                "penalidades": dados.get("penalidades", ""),
                "estrategia": dados.get("estrategia", ""),
                "observacoes": dados.get("observacoes", "")
            })
        }
        
        print(f"📤 Payload para Supabase: {json.dumps(payload, indent=2)}")
        
        # VERIFICA SE AS VARIÁVEIS EXISTEM
        if not SUPABASE_URL or not SUPABASE_KEY:
            print("❌ Variáveis de ambiente não configuradas!")
            return jsonify({
                "status": "erro",
                "mensagem": "Configuração do banco de dados incompleta"
            }), 500
        
        # Headers para Supabase
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        # URL completa
        url_completa = f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}"
        print(f"🌐 Enviando para: {url_completa}")
        
        # Enviar para Supabase
        print("🔄 Fazendo requisição para Supabase...")
        resposta = requests.post(
            url_completa,
            json=payload,
            headers=headers,
            timeout=10
        )
        
        print(f"📨 Resposta do Supabase - Status: {resposta.status_code}")
        print(f"📨 Resposta do Supabase - Texto: {resposta.text[:200]}...")
        
        if resposta.status_code in [200, 201]:
            dados_resposta = resposta.json()
            print(f"✅ Salvo no Supabase! ID: {dados_resposta[0]['id'] if dados_resposta else 'N/A'}")
            
            return jsonify({
                "status": "ok",
                "mensagem": "Scouting completo salvo com sucesso!",
                "id": dados_resposta[0]['id'] if dados_resposta else None
            })
        else:
            print(f"❌ Erro Supabase: {resposta.status_code} - {resposta.text}")
            return jsonify({
                "status": "erro",
                "mensagem": f"Erro ao salvar no banco: {resposta.text}",
                "status_code": resposta.status_code
            }), 500
            
    except requests.exceptions.RequestException as e:
        print(f"🌐 Erro de conexão: {str(e)}")
        return jsonify({
            "status": "erro",
            "mensagem": f"Erro de conexão com o banco: {str(e)}"
        }), 500
    except Exception as erro:
        print(f"💥 ERRO INESPERADO: {str(erro)}")
        print(traceback.format_exc())  # Mostra traceback completo
        return jsonify({
            "status": "erro",
            "mensagem": f"Erro interno: {str(erro)}",
            "traceback": traceback.format_exc()
        }), 500

@app.route("/teste", methods=["GET"])
def teste():
    """Rota de teste simples"""
    return jsonify({
        "status": "ok",
        "mensagem": "API funcionando",
        "supabase_url": SUPABASE_URL[:20] + "..." if SUPABASE_URL else "não configurado",
        "tabela": TABLE_NAME
    })

@app.route("/teste_supabase", methods=["GET"])
def teste_supabase():
    """Testa conexão com Supabase"""
    try:
        if not SUPABASE_URL or not SUPABASE_KEY:
            return jsonify({
                "status": "erro",
                "mensagem": "Variáveis não configuradas"
            }), 500
        
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}"
        }
        
        resposta = requests.get(
            f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}?limit=1",
            headers=headers,
            timeout=5
        )
        
        return jsonify({
            "status": "ok" if resposta.status_code == 200 else "erro",
            "supabase_status": resposta.status_code,
            "mensagem": "Conexão OK" if resposta.status_code == 200 else "Falha na conexão",
            "dados": resposta.json() if resposta.status_code == 200 else None
        })
        
    except Exception as e:
        return jsonify({
            "status": "erro",
            "mensagem": str(e)
        }), 500

@app.route("/")
def home():
    return jsonify({
        "api": "ScoutBOX FRC - Debug",
        "rotas": {
            "teste": "GET /teste",
            "teste_supabase": "GET /teste_supabase",
            "salvar": "POST /api/salvar_robo"
        }
    })

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=3080)

