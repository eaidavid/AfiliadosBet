#!/bin/bash

# Script de Deploy para VPS Hostinger
echo "🚀 Iniciando deploy do AfiliadosBet..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build do projeto
echo "🏗️ Fazendo build do projeto..."
npm run build

# Copiar arquivos necessários
echo "📂 Organizando arquivos..."
mkdir -p production
cp -r dist/ production/
cp package.json production/
cp ecosystem.config.js production/
cp .env production/

echo "✅ Deploy preparado! Arquivos prontos na pasta 'production'"
echo ""
echo "📋 Próximos passos no VPS:"
echo "1. Conecte via SSH ao seu VPS"
echo "2. Instale Node.js (versão 18+) e PM2"
echo "3. Configure PostgreSQL"
echo "4. Transfira os arquivos da pasta 'production'"
echo "5. Configure o Nginx como proxy reverso"