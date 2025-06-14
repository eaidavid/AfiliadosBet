#!/bin/bash

# Deploy Fácil - AfiliadosBet
# Execute: bash deploy-facil.sh

echo "🚀 Deploy Fácil - AfiliadosBet"
echo "================================"

# Verificar se está na pasta correta
if [ ! -f "package.json" ]; then
    echo "❌ Execute na pasta do projeto"
    exit 1
fi

echo "1️⃣ Limpando arquivos antigos..."
rm -rf dist/
mkdir -p dist/public

echo "2️⃣ Fazendo build do frontend..."
cd client
npx vite build --outDir ../dist/public || {
    echo "❌ Erro no build frontend"
    exit 1
}
cd ..

echo "3️⃣ Fazendo build do backend..."
npx esbuild server/index.ts --bundle --platform=node --outdir=dist --format=esm || {
    echo "❌ Erro no build backend"
    exit 1
}

echo "4️⃣ Verificando arquivos..."
if [ ! -f "dist/index.js" ]; then
    echo "❌ Backend não foi compilado"
    exit 1
fi

if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Frontend não foi compilado"
    exit 1
fi

echo "5️⃣ Instalando PM2..."
npm install -g pm2 2>/dev/null || sudo npm install -g pm2

echo "6️⃣ Parando aplicação anterior..."
pm2 delete afiliadosbet 2>/dev/null || true

echo "7️⃣ Iniciando aplicação..."
PORT=5000 NODE_ENV=production pm2 start dist/index.js --name afiliadosbet

echo "8️⃣ Salvando configuração..."
pm2 save
pm2 startup

echo ""
echo "✅ DEPLOY CONCLUÍDO!"
echo "================================"
echo "📊 Status:"
pm2 list
echo ""
echo "🔧 Comandos úteis:"
echo "pm2 logs afiliadosbet    # Ver logs"
echo "pm2 restart afiliadosbet # Reiniciar"
echo "pm2 monit               # Monitor"
echo ""
echo "🌐 Acesse: http://SEU_IP:5000"