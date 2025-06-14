# Continuar Deploy - AfiliadosBet

## Status Atual
✅ Sistema base instalado
✅ Node.js e PM2 instalados  
⚠️ Erro no banco (normal, vamos corrigir)

## Comandos para Continuar

Execute estes comandos em sequência no seu servidor:

### 1. Corrigir banco de dados
```bash
sudo -u postgres dropdb afiliadosbet 2>/dev/null || true
sudo -u postgres dropuser afiliadosbet 2>/dev/null || true
sudo -u postgres createdb afiliadosbet
sudo -u postgres psql -c "CREATE USER afiliadosbet WITH ENCRYPTED PASSWORD 'Alepoker@800';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE afiliadosbet TO afiliadosbet;"
sudo -u postgres psql -c "ALTER USER afiliadosbet CREATEDB;"
```

### 2. Baixar código
```bash
cd /var/www
rm -rf afiliadosbet
git clone https://github.com/eaidavid/AfiliadosBet.git afiliadosbet
cd afiliadosbet
useradd -m -s /bin/bash afiliadosbet 2>/dev/null || true
echo "afiliadosbet:Alepoker@800" | chpasswd
chown -R afiliadosbet:afiliadosbet .
```

### 3. Configurar aplicação
```bash
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://afiliadosbet:Alepoker@800@localhost:5432/afiliadosbet
SESSION_SECRET=afiliadosbet_secret_key_2024
DOMAIN=https://afiliadosbet.com.br
FRONTEND_URL=https://afiliadosbet.com.br
BACKEND_URL=https://afiliadosbet.com.br
EOF
```

### 4. Build e iniciar
```bash
npm install
npm run build
npm run db:push
pm2 delete afiliadosbet 2>/dev/null || true
pm2 start dist/index.js --name afiliadosbet
pm2 save
pm2 startup
```

### 5. Configurar Nginx
```bash
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
}
EOF

ln -sf /etc/nginx/sites-available/afiliadosbet /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### 6. SSL e firewall
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d afiliadosbet.com.br -d www.afiliadosbet.com.br --non-interactive --agree-tos -m admin@afiliadosbet.com.br
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
```

### 7. Verificar funcionamento
```bash
pm2 status
curl http://localhost:5000
curl https://afiliadosbet.com.br
```

## Comando Único (Alternativa)

Se preferir, cole tudo de uma vez:

```bash
sudo -u postgres dropdb afiliadosbet 2>/dev/null || true && sudo -u postgres dropuser afiliadosbet 2>/dev/null || true && sudo -u postgres createdb afiliadosbet && sudo -u postgres psql -c "CREATE USER afiliadosbet WITH ENCRYPTED PASSWORD 'Alepoker@800';" && sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE afiliadosbet TO afiliadosbet;" && cd /var/www && rm -rf afiliadosbet && git clone https://github.com/eaidavid/AfiliadosBet.git afiliadosbet && cd afiliadosbet && useradd -m -s /bin/bash afiliadosbet 2>/dev/null || true && chown -R afiliadosbet:afiliadosbet . && cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://afiliadosbet:Alepoker@800@localhost:5432/afiliadosbet
SESSION_SECRET=afiliadosbet_secret_key_2024
DOMAIN=https://afiliadosbet.com.br
FRONTEND_URL=https://afiliadosbet.com.br
BACKEND_URL=https://afiliadosbet.com.br
EOF
npm install && npm run build && npm run db:push && pm2 delete afiliadosbet 2>/dev/null || true && pm2 start dist/index.js --name afiliadosbet && pm2 save && echo "Deploy finalizado! Acesse: https://afiliadosbet.com.br"
```

## Resultado Esperado

Após executar, você terá:
- Site funcionando em https://afiliadosbet.com.br
- SSL automático configurado
- Sistema rodando com PM2
- Banco PostgreSQL configurado

Execute os comandos e me informe se algum erro aparecer.