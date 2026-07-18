#!/bin/bash
set -e

echo "🔎 Listando containers antigos de Ollama/WireGuard..."
docker ps -a | grep -E "ollama|wg-client"

echo "🧹 Removendo containers antigos..."
docker rm -f $(docker ps -aq --filter "name=ollama") || true
docker rm -f $(docker ps -aq --filter "name=wg-client") || true

echo "⬇️ Derrubando stack atual..."
docker compose -f docker-compose-render-wg.yml down --remove-orphans

echo "🚀 Subindo stack completa..."
docker compose -f docker-compose-render-wg.yml up -d

echo "✅ Verificando containers ativos..."
docker ps

echo "📥 Baixando modelo qwen2.5-coder:7b..."
docker exec -it ollama ollama pull qwen2.5-coder:7b

echo "🧪 Testando geração Hello World em Python..."
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5-coder:7b",
    "prompt": "Escreva um hello world em Python"
  }'
