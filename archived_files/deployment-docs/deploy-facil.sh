#!/bin/bash

# Deploy Fácil - Corrigido
# Método simplificado que funciona

set -e

echo "🚀 Deploy Automático Corrigido"

# Parar PM2 se existir
pm2 stop afiliadosbet 2>/dev/null || true
pm2 delete afiliadosbet 2>/dev/null || true

# Ir para diretório
cd /var/www/afiliadosbet

# Recriar usuário PostgreSQL corretamente
echo "🗄️ Configurando banco PostgreSQL..."
sudo -u postgres dropdb afiliadosbet 2>/dev/null || true
sudo -u postgres dropuser afiliadosapp 2>/dev/null || true

sudo -u postgres createdb afiliadosbet
sudo -u postgres psql -c "CREATE USER afiliadosapp WITH ENCRYPTED PASSWORD 'app123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE afiliadosbet TO afiliadosapp;"
sudo -u postgres psql -c "ALTER USER afiliadosapp CREATEDB;"

echo "✅ Banco configurado"

# Configurar .env correto
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://afiliadosapp:app123@localhost:5432/afiliadosbet
SESSION_SECRET=afiliadosbet_secret_2024
DOMAIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3000
EOF

echo "✅ Variáveis configuradas"

# Testar conexão banco
echo "🔍 Testando conexão banco..."
psql postgresql://afiliadosapp:app123@localhost:5432/afiliadosbet -c "SELECT 1;" || {
    echo "❌ Erro conexão banco"
    exit 1
}

# Executar migrações
echo "📋 Aplicando migrações..."
npm run db:push

# Build aplicação
echo "🔨 Build aplicação..."
npm run build

# Verificar se build existe
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build falhou"
    exit 1
fi

# Iniciar com PM2
echo "🔄 Iniciando aplicação..."
pm2 start dist/index.js --name afiliadosbet
pm2 save

# Aguardar e testar
sleep 5
echo "🧪 Testando aplicação..."

if curl -f -s http://localhost:3000 > /dev/null; then
    echo "✅ Aplicação funcionando"
else
    echo "❌ Aplicação não responde"
    pm2 logs afiliadosbet --lines 10 --nostream
    exit 1
fi

# Configurar Nginx
echo "🌐 Configurando Nginx..."
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

nginx -t && systemctl restart nginx

# Teste final
echo "🏁 Teste final..."
if curl -f -s http://localhost:80 > /dev/null; then
    echo "✅ Site funcionando"
else
    echo "❌ Nginx com problema"
fi

echo ""
echo "🎉 DEPLOY CONCLUÍDO!"
echo "📊 Status:"
pm2 status
echo ""
echo "🌐 Acesse: http://$(curl -s ifconfig.me)"
echo ""
echo "📝 Gerenciar:"
echo "pm2 status"
echo "pm2 logs afiliadosbet"
echo "pm2 restart afiliadosbet"