#!/bin/bash

set -e

PROJECT="/IA/workspace/alex-platform-v2"
BACKEND="$PROJECT/backend"

echo "========================================="
echo " AlEx AI Platform v2"
echo " Preparação Git + Render"
echo "========================================="


cd "$PROJECT"


echo ""
echo "1) Backup da configuração atual"

if [ -f "$BACKEND/src/main/resources/application.yml" ]; then

cp "$BACKEND/src/main/resources/application.yml" \
"$BACKEND/src/main/resources/application.yml.backup.before-render"

fi



echo ""
echo "2) Criando application.yml com variáveis"


cat > "$BACKEND/src/main/resources/application.yml" <<'EOF'
server:

  port: ${PORT:8080}


spring:

  application:

    name: alex-platform


  datasource:

    url: ${DATABASE_URL}

    username: ${DATABASE_USERNAME}

    password: ${DATABASE_PASSWORD}


  jpa:

    hibernate:

      ddl-auto: update

    properties:

      hibernate:

        dialect: org.hibernate.dialect.PostgreSQLDialect



ollama:

  url: ${OLLAMA_URL:http://localhost:11434}

  model: ${OLLAMA_MODEL:qwen2.5-coder:7b}



qdrant:

  url: ${QDRANT_URL:http://localhost:6333}
EOF



echo ""
echo "3) Criando .env.example"


cat > "$PROJECT/.env.example" <<'EOF'
# PostgreSQL Render

DATABASE_URL=jdbc:postgresql://HOST:5432/DATABASE

DATABASE_USERNAME=username

DATABASE_PASSWORD=password


# IA Local

OLLAMA_URL=http://localhost:11434

OLLAMA_MODEL=qwen2.5-coder:7b


# Qdrant

QDRANT_URL=http://localhost:6333
EOF



echo ""
echo "4) Criando .gitignore"


cat > "$PROJECT/.gitignore" <<'EOF'
# Java

target/

*.jar


# IDE

.idea/

.vscode/


# Environment

.env


# Logs

*.log


# OS

.DS_Store


# Backups

*.backup.*
EOF



echo ""
echo "5) Criando Dockerfile para Render"


cat > "$BACKEND/Dockerfile" <<'EOF'
FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]
EOF



echo ""
echo "6) Criando README de deploy"


cat > "$PROJECT/RENDER_DEPLOY.md" <<'EOF'
# Deploy AlEx AI Platform v2 - Render


## Build

mvn clean package


## Start

java -jar target/alex-platform-2.0.0.jar


## Variáveis Render

DATABASE_URL

DATABASE_USERNAME

DATABASE_PASSWORD

OLLAMA_URL

QDRANT_URL
EOF



echo ""
echo "7) Validando build"


cd "$BACKEND"

mvn clean package



echo ""
echo "8) Preparando Git"


cd "$PROJECT"


if [ ! -d ".git" ]; then

git init

fi



git add .


git commit -m "Prepare AlEx AI Platform v2 for Render deployment" || true



echo ""
echo "========================================="
echo " FINALIZADO"
echo "========================================="


echo ""
echo "Próximos comandos:"
echo ""
echo "git remote add origin URL_DO_SEU_REPOSITORIO"
echo "git push -u origin main"
echo ""
