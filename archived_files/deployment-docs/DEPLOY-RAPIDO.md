# Deploy Rápido - Comando Único Testado

## Execute no seu servidor (69.62.65.24):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && apt-get update && apt-get install -y nodejs postgresql postgresql-contrib nginx ufw && npm install -g pm2 && systemctl start postgresql && systemctl enable postgresql && sudo -u postgres psql -c "DROP DATABASE IF EXISTS afiliadosbet; DROP USER IF EXISTS afiliadosapp; CREATE DATABASE afiliadosbet; CREATE USER afiliadosapp WITH ENCRYPTED PASSWORD 'app123'; GRANT ALL PRIVILEGES ON DATABASE afiliadosbet TO afiliadosapp; ALTER USER afiliadosapp CREATEDB;" && cd /var/www && rm -rf afiliadosbet && git clone https://github.com/eaidavid/AfiliadosBet.git afiliadosbet && cd afiliadosbet && npm install && cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://afiliadosapp:app123@localhost:5432/afiliadosbet
SESSION_SECRET=afiliadosbet_secret_2024
DOMAIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3000
EOF
npm run build && npm run db:push && pm2 delete all 2>/dev/null || true && pm2 start dist/index.js --name afiliadosbet && pm2 save && pm2 startup && sleep 10 && cat > /etc/nginx/sites-available/default << 'EOFNGINX'
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
EOFNGINX
nginx -t && systemctl reload nginx && ufw allow ssh && ufw allow 'Nginx Full' && ufw --force enable && echo "DEPLOY CONCLUÍDO! Site: http://$(curl -s ifconfig.me)" && pm2 status && curl -I http://localhost:3000
```

## Se der erro, execute por partes:

### 1. Sistema base:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get update
apt-get install -y nodejs postgresql postgresql-contrib nginx ufw
npm install -g pm2
```

### 2. Banco de dados:
```bash
systemctl start postgresql
systemctl enable postgresql
sudo -u postgres psql -c "DROP DATABASE IF EXISTS afiliadosbet; DROP USER IF EXISTS afiliadosapp; CREATE DATABASE afiliadosbet; CREATE USER afiliadosapp WITH ENCRYPTED PASSWORD 'app123'; GRANT ALL PRIVILEGES ON DATABASE afiliadosbet TO afiliadosapp; ALTER USER afiliadosapp CREATEDB;"
```

### 3. Aplicação:
```bash
cd /var/www
rm -rf afiliadosbet
git clone https://github.com/eaidavid/AfiliadosBet.git afiliadosbet
cd afiliadosbet
npm install
```

### 4. Configuração:
```bash
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://afiliadosapp:app123@localhost:5432/afiliadosbet
SESSION_SECRET=afiliadosbet_secret_2024
DOMAIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3000
EOF
```

### 5. Build e início:
```bash
npm run build
npm run db:push
pm2 delete all 2>/dev/null || true
pm2 start dist/index.js --name afiliadosbet
pm2 save
pm2 startup
```

### 6. Nginx:
```bash
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
systemctl reload nginx
```

### 7. Firewall:
```bash
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
```

## Verificar funcionamento:
```bash
pm2 status
curl http://localhost:3000
curl http://69.62.65.24
```

## Comandos úteis:
```bash
pm2 logs afiliadosbet    # Ver logs
pm2 restart afiliadosbet # Reiniciar
pm2 status               # Ver status
```

## Atualizar depois:
```bash
cd /var/www/afiliadosbet
git pull
npm run build
pm2 restart afiliadosbet
```

Execute o comando único no seu servidor e em poucos minutos terá o AfiliadosBet funcionando perfeitamente!