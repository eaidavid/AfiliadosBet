#!/bin/bash

# Script para iniciar a aplicação com as variáveis de ambiente corretas

# Definir variáveis de ambiente
export DATABASE_URL="postgresql://afiliadosbet:AfiliadosBet1001@localhost:5432/afiliadosbet"
export NODE_ENV="production"
export PORT="3000"

# Parar aplicação existente
pm2 delete afiliadosbet 2>/dev/null || true

# Aguardar um momento
sleep 2

# Iniciar aplicação
pm2 start dist/index.js --name afiliadosbet

# Salvar configuração do PM2
pm2 save

# Mostrar status
pm2 status

echo "Aplicação iniciada com as seguintes variáveis:"
echo "DATABASE_URL: $DATABASE_URL"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"