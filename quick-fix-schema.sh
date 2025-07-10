#!/bin/bash

# 🚀 CORREÇÃO RÁPIDA SQLITE - VPS

echo "🚀 Correção rápida SQLite..."

# 1. Parar tudo
pkill -f "node.*afiliadosbet" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true
pm2 kill 2>/dev/null || true

# 2. Configurar .env SQLite
cat > .env << 'EOF'
NODE_ENV=production
SESSION_SECRET=afiliadosbet_super_secret_production_2025
PORT=3000
HOST=0.0.0.0
EOF

# 3. Preparar dados
mkdir -p data logs

# 4. Build se necessário
if [ ! -f "dist/index.js" ]; then
    echo "🔨 Fazendo build..."
    npm run build
fi

# 5. Iniciar aplicação
echo "🚀 Iniciando aplicação..."
NODE_ENV=production nohup node dist/index.js > logs/app.log 2>&1 &
echo $! > app.pid

# 6. Aguardar
sleep 10

# 7. Testar
echo "🧪 Testando..."
curl -s http://localhost:3000/api/health
echo ""
curl -s http://localhost:3000/api/stats/admin
echo ""

echo "✅ Aplicação SQLite iniciada!"
echo "🔍 Logs: tail -f logs/app.log"
echo "🌐 Site: https://afiliadosbet.com.br/admin"