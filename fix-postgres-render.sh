#!/bin/bash

set -e

echo "======================================"
echo " AlEx AI Platform v2"
echo " Correção PostgreSQL Render"
echo "======================================"

BACKEND="/IA/workspace/alex-platform-v2/backend"

cd "$BACKEND"

echo ""
echo "1) Backup do application.yml"

cp src/main/resources/application.yml \
src/main/resources/application.yml.backup.$(date +%s)


echo ""
echo "2) Configurando PostgreSQL Render"

cat > src/main/resources/application.yml <<'EOF'
server:
  port: ${PORT:8080}


spring:

  application:
    name: alex-platform


  datasource:

    url: jdbc:postgresql://dpg-d9acnel7vvec738v4r90-a.virginia-postgres.render.com:5432/alia_db_2tcb

    username: alia_db_2tcb_user

    password: EBRstoSBu4s3K4NGJja8ir0QGhE7ZR2H


  jpa:

    hibernate:

      ddl-auto: update

    show-sql: false

    properties:

      hibernate:

        dialect: org.hibernate.dialect.PostgreSQLDialect


ollama:

  url: ${OLLAMA_URL:http://localhost:11434}

  model: ${OLLAMA_MODEL:qwen2.5-coder:7b}


qdrant:

  url: ${QDRANT_URL:http://localhost:6333}


springdoc:

  swagger-ui:

    path: /swagger-ui.html
EOF


echo ""
echo "3) Validando driver PostgreSQL"

if grep -q "postgresql" pom.xml
then
    echo "Driver PostgreSQL encontrado"
else
    echo "ERRO: Driver PostgreSQL não encontrado no pom.xml"
    exit 1
fi


echo ""
echo "4) Limpando e compilando"

mvn clean package


echo ""
echo "======================================"
echo " BUILD FINALIZADO COM SUCESSO"
echo "======================================"

echo ""
echo "Para iniciar:"
echo ""
echo "java -jar target/alex-platform-2.0.0.jar"
echo ""
