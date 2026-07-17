#!/bin/bash

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "============================================"
echo "  AlEx AI Platform v2 — DESLIGAR TUDO"
echo "============================================"

# 1. Parar Docker Compose (se estiver rodando)
if command -v docker &> /dev/null; then
  if docker compose ps --quiet 2>/dev/null | grep -q .; then
    echo ""
    echo "[1/3] Parando containers Docker Compose..."
    cd "$ROOT"
    docker compose down
    echo "  ✔ Docker Compose parado."
  else
    echo ""
    echo "[1/3] Nenhum container Docker Compose ativo. Pulando..."
  fi
else
  echo ""
  echo "[1/3] Docker não encontrado. Pulando..."
fi

# 2. Parar backend Java (Spring Boot)
echo ""
echo "[2/3] Procurando processo do backend Java (alex-platform-2.0.0.jar)..."

JAVA_PIDS=$(pgrep -f "alex-platform-2.0.0.jar" 2>/dev/null || true)

if [ -n "$JAVA_PIDS" ]; then
  echo "  Encontrado PID(s): $JAVA_PIDS"
  for pid in $JAVA_PIDS; do
    echo "  Enviando SIGTERM para PID $pid..."
    kill "$pid" 2>/dev/null || true
  done

  # Aguardar graceful shutdown (máx 15 segundos)
  echo "  Aguardando shutdown graceful (máx 15s)..."
  for i in $(seq 1 15); do
    if ! kill -0 $JAVA_PIDS 2>/dev/null; then
      echo "  ✔ Backend Java encerrado com sucesso."
      break
    fi
    sleep 1
  done

  # Forçar kill se ainda estiver rodando
  if kill -0 $JAVA_PIDS 2>/dev/null; then
    echo "  ⚠ Processo ainda ativo. Forçando SIGKILL..."
    kill -9 $JAVA_PIDS 2>/dev/null || true
    echo "  ✔ Processo forçadamente encerrado."
  fi
else
  echo "  Nenhum processo do backend encontrado."
fi

# 3. Parar Ollama (se rodando local, fora do Docker)
echo ""
echo "[3/3] Procurando processo do Ollama local..."

OLLAMA_PIDS=$(pgrep -f "ollama serve" 2>/dev/null || true)

if [ -n "$OLLAMA_PIDS" ]; then
  echo "  Encontrado PID(s): $OLLAMA_PIDS"
  for pid in $OLLAMA_PIDS; do
    echo "  Enviando SIGTERM para PID $pid..."
    kill "$pid" 2>/dev/null || true
  done
  sleep 2
  echo "  ✔ Ollama encerrado."
else
  echo "  Nenhum processo do Ollama local encontrado."
fi

echo ""
echo "============================================"
echo "  ✅ AlEx AI Platform v2 — TUDO DESLIGADO"
echo "============================================"
echo ""
