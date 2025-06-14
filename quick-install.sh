#!/bin/bash

# Quick Install - AfiliadosBet VPS
# Comando único para instalação completa

echo "🚀 Instalação Rápida AfiliadosBet VPS"
echo "====================================="

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    echo "Execute como root: sudo bash quick-install.sh"
    exit 1
fi

# 1. Sistema base
echo "1/8 Preparando sistema..."
apt update && apt upgrade -y
apt install -y curl git nginx postgresql postgresql-contrib

# 2. Node.js
echo "2/8 Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
npm install -g pm2

# 3. Banco
echo "3/8 Configurando banco..."
sudo -u postgres psql << 'EOF'
CREATE DATABASE afiliadosbet;
CREATE USER afiliadosbet WITH ENCRYPTED PASSWORD 'Alepoker@800';
GRANT ALL PRIVILEGES ON DATABASE afiliadosbet TO afiliadosbet;
ALTER USER afiliadosbet CREATEDB;
\q
EOF

# 4. Código
echo "4/8 Baixando aplicação..."
cd /var/www
rm -rf afiliadosbet
git clone https://github.com/eaidavid/AfiliadosBet.git afiliadosbet
cd afiliadosbet

# 5. Configurar
echo "5/8 Configurando aplicação..."
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://afiliadosbet:Alepoker@800@localhost:5432/afiliadosbet
SESSION_SECRET=afiliadosbet_secret_key_2024
DOMAIN=https://afiliadosbet.com.br
FRONTEND_URL=https://afiliadosbet.com.br
BACKEND_URL=https://afiliadosbet.com.br
EOF

# 6. Build
echo "6/8 Fazendo build..."
npm install
npm run build || {
    rm -rf dist/
    mkdir -p dist/public
    cd client && npx vite build --outDir ../dist/public && cd ..
    npx esbuild server/index.ts --bundle --platform=node --outdir=dist --format=esm
}
npm run db:push

# 7. PM2
echo "7/8 Iniciando aplicação..."
pm2 delete afiliadosbet 2>/dev/null || true
pm2 start dist/index.js --name afiliadosbet
pm2 save
pm2 startup

# 8. Nginx
echo "8/8 Configurando Nginx..."
cat > /etc/nginx/sites-available/afiliadosbet << 'EOF'
server {
    listen 80;
    server_name afiliadosbet.com.br www.afiliadosbet.com.br;

    location / {
        proxy_pass http://127.0.0.1:5000;
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

ln -sf /etc/nginx/sites-available/afiliadosbet /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# SSL
apt install -y certbot python3-certbot-nginx
certbot --nginx -d afiliadosbet.com.br -d www.afiliadosbet.com.br --non-interactive --agree-tos -m admin@afiliadosbet.com.br

# Firewall
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

echo "✅ INSTALAÇÃO CONCLUÍDA!"
echo "🌐 Acesse: https://afiliadosbet.com.br"
echo "📊 Status: pm2 status"
echo "📋 Logs: pm2 logs afiliadosbet"