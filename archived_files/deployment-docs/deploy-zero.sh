#!/bin/bash

# Deploy Zero Config - Método Replit Simplificado
# Instala tudo em 1 comando como o botão Deploy

set -e

echo "🚀 Deploy Automático - Método Replit"
echo "Configurando servidor completo..."

# 1. Sistema Base
echo "📦 Instalando dependências..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get update
apt-get install -y nodejs postgresql postgresql-contrib nginx ufw
npm install -g pm2

# 2. Banco PostgreSQL
echo "🗄️ Configurando banco..."
systemctl start postgresql
systemctl enable postgresql

sudo -u postgres psql << 'EOF'
CREATE DATABASE afiliadosbet;
CREATE USER afiliadosapp WITH ENCRYPTED PASSWORD 'app123';
GRANT ALL PRIVILEGES ON DATABASE afiliadosbet TO afiliadosapp;
ALTER USER afiliadosapp CREATEDB;
\q
EOF

# 3. Aplicação
echo "💻 Baixando aplicação..."
cd /var/www
rm -rf afiliadosbet
git clone https://github.com/eaidavid/AfiliadosBet.git afiliadosbet
cd afiliadosbet

# 4. Build (método Replit)
echo "🔨 Fazendo build..."
npm install --production

# Build frontend
cd client
npm run build
cd ..

# Build backend
npx esbuild server/index.ts --bundle --platform=node --target=node20 --outfile=dist/server.js --format=esm --external:pg-native

# 5. Configuração
echo "⚙️ Configurando ambiente..."
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://afiliadosapp:app123@localhost:5432/afiliadosbet
SESSION_SECRET=afiliadosbet_secret_2024
EOF

# 6. Banco de dados
echo "🗃️ Configurando tabelas..."
npm run db:push

# 7. PM2 (método Replit)
echo "🔄 Iniciando aplicação..."
pm2 delete afiliadosbet 2>/dev/null || true
pm2 start dist/server.js --name afiliadosbet
pm2 startup
pm2 save

# 8. Nginx (proxy como Replit)
echo "🌐 Configurando proxy..."
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

nginx -t
systemctl restart nginx
systemctl enable nginx

# 9. Firewall
echo "🔒 Configurando segurança..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# 10. Teste final
echo "🧪 Testando aplicação..."
sleep 5

if curl -f -s http://localhost:3000 > /dev/null; then
    echo "✅ Aplicação OK na porta 3000"
else
    echo "❌ Aplicação não responde"
    pm2 logs afiliadosbet --lines 10
fi

if curl -f -s http://localhost:80 > /dev/null; then
    echo "✅ Nginx proxy OK"
else
    echo "❌ Nginx não responde"
    systemctl status nginx
fi

# Status final
echo ""
echo "🎉 DEPLOY CONCLUÍDO!"
echo "📊 Status:"
pm2 status
echo ""
echo "🌐 Acessar em:"
echo "IP do servidor na porta 80"
echo ""
echo "📝 Comandos úteis:"
echo "pm2 status              # Ver status"
echo "pm2 logs afiliadosbet   # Ver logs"
echo "pm2 restart afiliadosbet # Reiniciar"