#!/bin/bash

# Script para restaurar todos os projetos do ecossistema Alex no novo computador

WORKSPACE_DIR="/IA/workspace"

echo "==================================================="
echo "🚀 Iniciando configuração do Workspace Alex"
echo "==================================================="

echo "📂 Criando diretório base em $WORKSPACE_DIR..."
# Caso o script seja rodado sem permissão no diretório /IA, tentamos usar sudo se necessário
sudo mkdir -p $WORKSPACE_DIR
sudo chown -R $USER:$USER $WORKSPACE_DIR
cd $WORKSPACE_DIR

echo "📥 Clonando alex-platform-v2..."
if [ ! -d "alex-platform-v2" ]; then
    git clone git@github.com:asizaguirre/alex-platform-v2.git
else
    echo "✔️ alex-platform-v2 já existe"
fi

echo "📥 Clonando alex-engine-local..."
if [ ! -d "alex-engine-local" ]; then
    git clone git@github.com:asizaguirre/alex-engine.git alex-engine-local
else
    echo "✔️ alex-engine-local já existe"
fi

echo "📥 Clonando alex-alia-platform..."
if [ ! -d "alex-alia-platform" ]; then
    git clone git@github.com:asizaguirre/alex-alia-platform.git
else
    echo "✔️ alex-alia-platform já existe"
fi

echo "==================================================="
echo "✅ Todos os repositórios clonados com sucesso!"
echo "==================================================="
