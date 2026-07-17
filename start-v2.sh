#!/bin/bash

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"

if [ -f "$ROOT/.env" ]; then
  set -a
  source "$ROOT/.env"
  set +a
fi

if [ "$1" = "docker" ]; then
  echo "Iniciando AlEx AI Platform v2 com Docker Compose..."
  docker compose up --build
  exit 0
fi

echo "Construindo backend..."
cd "$BACKEND"
mvn clean package -DskipTests

echo "Iniciando backend local..."
export PORT=${PORT:-8080}
export OLLAMA_URL=${OLLAMA_URL:-http://localhost:11434}
export OLLAMA_MODEL=${OLLAMA_MODEL:-qwen2.5-coder:7b}

java -jar target/alex-platform-2.0.0.jar
