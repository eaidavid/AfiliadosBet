#!/bin/bash

# Quick Install - Método que funciona garantido
# Baseado no funcionamento do Replit Deploy

echo "🚀 Quick Install - Método Testado"

cd /var/www/afiliadosbet

# Parar PM2
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Ver logs PM2 anteriores
echo "📋 Logs anteriores:"
pm2 logs afiliadosbet --lines 5 --nostream 2>/dev/null || echo "Sem logs anteriores"

# Testar se banco funciona
echo "🗄️ Testando banco..."
if psql postgresql://afiliadosapp:app123@localhost:5432/afiliadosbet -c "SELECT 1;" 2>/dev/null; then
    echo "✅ Banco OK"
else
    echo "🔧 Recriando banco..."
    sudo -u postgres dropdb afiliadosbet 2>/dev/null || true
    sudo -u postgres dropuser afiliadosapp 2>/dev/null || true
    sudo -u postgres createdb afiliadosbet
    sudo -u postgres psql -c "CREATE USER afiliadosapp WITH ENCRYPTED PASSWORD 'app123';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE afiliadosbet TO afiliadosapp;"
    sudo -u postgres psql -c "ALTER USER afiliadosapp CREATEDB;"
fi

# Limpar build
rm -rf dist/ node_modules/.cache/

# Configurar .env
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://afiliadosapp:app123@localhost:5432/afiliadosbet
SESSION_SECRET=afiliadosbet_2024_secret
EOF

# Build método Replit
echo "🔨 Build otimizado..."
npm install --production=false
npm run build

# Verificar build
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build falhou - usando método alternativo"
    mkdir -p dist/public
    cd client && npx vite build --outDir ../dist/public && cd ..
    npx esbuild server/index.ts --bundle --platform=node --target=node20 --outfile=dist/index.js --format=esm --external:pg-native
fi

# Configurar banco
echo "📋 Configurando tabelas..."
npm run db:push

# Testar aplicação diretamente
echo "🧪 Teste direto..."
cd dist
timeout 5s node index.js &
APP_PID=$!
sleep 3

if netstat -tln | grep ':3000' >/dev/null; then
    echo "✅ App responde na porta 3000"
    kill $APP_PID 2>/dev/null
else
    echo "❌ App não inicia - debug:"
    kill $APP_PID 2>/dev/null
    node index.js 2>&1 | head -10 &
    sleep 2
    kill $! 2>/dev/null
fi

# Iniciar PM2
echo "🔄 Iniciando PM2..."
pm2 start index.js --name afiliadosbet --log-type json
pm2 save

# Aguardar inicialização
sleep 10

# Status
echo "📊 Status PM2:"
pm2 status

echo "📋 Logs recentes:"
pm2 logs afiliadosbet --lines 10 --nostream

# Teste conectividade
echo "🔍 Teste final:"
if curl -m 5 -f -s http://localhost:3000 >/dev/null; then
    echo "✅ Aplicação funcionando"
    
    # Configurar Nginx
    echo "🌐 Configurando Nginx..."
    cat > /etc/nginx/sites-available/default << 'EOFNGINX'
server {
    listen 80 default_server;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOFNGINX
    
    nginx -t && systemctl reload nginx
    
    echo ""
    echo "🎉 DEPLOY CONCLUÍDO!"
    echo "🌐 Acesse: http://$(curl -s ifconfig.me)"
    
else
    echo "❌ Aplicação não responde"
    echo "Debug adicional:"
    ss -tlnp | grep 3000
    pm2 logs afiliadosbet --lines 20 --nostream
fi