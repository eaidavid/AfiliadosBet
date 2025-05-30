#!/bin/bash

echo "DEPLOY RÁPIDO - PAINEL AFILIADOSBET"
echo "=================================="

# Compilar o projeto
npm run build

# Copiar arquivos essenciais para uma pasta simples
mkdir -p quick-deploy
cp -r dist/ quick-deploy/
cp production-server.js quick-deploy/server.js
cp package.json quick-deploy/

echo ""
echo "ARQUIVOS PRONTOS EM: quick-deploy/"
echo ""
echo "NO SERVIDOR, EXECUTE:"
echo "1. cd /var/www/site"
echo "2. rm -rf * (limpar pasta)"
echo "3. [Envie arquivos da pasta quick-deploy/]"
echo "4. npm install express express-session"
echo "5. node server.js"
echo ""
echo "PRONTO! Painel funcionando na porta 3000"