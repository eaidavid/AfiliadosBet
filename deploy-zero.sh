#!/bin/bash

# Deploy do Zero - AfiliadosBet
# Só execute: bash deploy-zero.sh

echo "🚀 Deploy do Zero - AfiliadosBet"
echo "================================"

# Parar qualquer coisa rodando
pkill -f "node.*afiliadosbet" 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Limpar tudo
rm -rf dist/ node_modules/.vite/

# 1. Build simples do frontend
echo "1️⃣ Build Frontend..."
cd client
npx vite build --outDir ../dist/public
cd ..

# 2. Build simples do backend  
echo "2️⃣ Build Backend..."
npx esbuild server/index.ts --bundle --platform=node --outdir=dist --format=esm

# 3. Testar se funcionou
if [ ! -f "dist/index.js" ] || [ ! -f "dist/public/index.html" ]; then
    echo "❌ Build falhou"
    exit 1
fi

# 4. Rodar direto
echo "3️⃣ Iniciando servidor..."
cd dist
NODE_ENV=production PORT=5000 node index.js &
SERVER_PID=$!

echo "✅ Servidor iniciado (PID: $SERVER_PID)"
echo "🌐 Acesse: http://localhost:5000"

# Aguardar 5 segundos e testar
sleep 5
if curl -s http://localhost:5000 > /dev/null; then
    echo "✅ Servidor funcionando!"
else
    echo "❌ Servidor não responde"
    kill $SERVER_PID 2>/dev/null
fi