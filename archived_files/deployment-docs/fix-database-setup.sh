#!/bin/bash

# Fix Database Setup - AfiliadosBet
# Execute after the main installation

echo "🔧 Corrigindo configuração do banco de dados..."

# Configurar PostgreSQL corretamente
sudo -u postgres psql << 'EOF'
DROP DATABASE IF EXISTS afiliadosbet;
DROP USER IF EXISTS afiliadosbet;
CREATE DATABASE afiliadosbet;
CREATE USER afiliadosbet WITH ENCRYPTED PASSWORD 'Alepoker@800';
GRANT ALL PRIVILEGES ON DATABASE afiliadosbet TO afiliadosbet;
ALTER USER afiliadosbet CREATEDB;
\q
EOF

echo "✅ Banco de dados configurado"

# Ir para diretório da aplicação
cd /var/www/afiliadosbet

# Recriar .env com configurações corretas
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://afiliadosbet:Alepoker@800@localhost:5432/afiliadosbet
SESSION_SECRET=afiliadosbet_secret_key_2024_$(openssl rand -hex 16)
DOMAIN=https://afiliadosbet.com.br
FRONTEND_URL=https://afiliadosbet.com.br
BACKEND_URL=https://afiliadosbet.com.br
EOF

echo "✅ Arquivo .env atualizado"

# Executar migrações do banco
npm run db:push

echo "✅ Migrações aplicadas"

# Parar PM2 se estiver rodando
pm2 delete afiliadosbet 2>/dev/null || true

# Fazer build da aplicação
npm run build || {
    echo "Build padrão falhou, usando método alternativo..."
    rm -rf dist/
    mkdir -p dist/public
    cd client && npx vite build --outDir ../dist/public && cd ..
    npx esbuild server/index.ts --bundle --platform=node --outdir=dist --format=esm
}

# Iniciar aplicação
pm2 start dist/index.js --name afiliadosbet
pm2 save
pm2 startup

echo "✅ Aplicação iniciada"

# Configurar Nginx
tee /etc/nginx/sites-available/afiliadosbet << 'EOF'
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
    
    client_max_body_size 10M;
}
EOF

# Ativar site
ln -sf /etc/nginx/sites-available/afiliadosbet /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar e reiniciar Nginx
nginx -t && systemctl restart nginx

echo "✅ Nginx configurado"

# Configurar SSL
apt install -y certbot python3-certbot-nginx
certbot --nginx -d afiliadosbet.com.br -d www.afiliadosbet.com.br --non-interactive --agree-tos -m admin@afiliadosbet.com.br

echo "✅ SSL configurado"

# Configurar firewall
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

echo "✅ Firewall configurado"

# Verificar status
echo "📊 Status final:"
pm2 status
systemctl status nginx --no-pager -l

# Testar aplicação
sleep 5
if curl -f -s http://localhost:5000 > /dev/null; then
    echo "✅ Aplicação funcionando localmente"
else
    echo "⚠️ Aplicação pode não estar respondendo"
fi

echo ""
echo "🎉 DEPLOY FINALIZADO!"
echo "🌐 Acesse: https://afiliadosbet.com.br"
echo "📋 Logs: pm2 logs afiliadosbet"