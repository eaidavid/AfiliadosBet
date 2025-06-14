# Deploy Final VPS - AfiliadosBet

## Dados do Servidor
- **IP:** 69.62.65.24
- **Usuário:** root
- **Senha:** Alepoker@800
- **Domínio:** afiliadosbet.com.br

## Comando Único de Instalação

Conecte no servidor e execute:

```bash
ssh root@69.62.65.24
```

Depois cole este comando completo:

```bash
apt update && apt upgrade -y && apt install -y curl git nginx postgresql postgresql-contrib && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs && npm install -g pm2 && sudo -u postgres psql << 'EOFDB'
CREATE DATABASE afiliadosbet;
CREATE USER afiliadosbet WITH ENCRYPTED PASSWORD 'Alepoker@800';
GRANT ALL PRIVILEGES ON DATABASE afiliadosbet TO afiliadosbet;
ALTER USER afiliadosbet CREATEDB;
\q
EOFDB
cd /var/www && rm -rf afiliadosbet && git clone https://github.com/eaidavid/AfiliadosBet.git afiliadosbet && cd afiliadosbet && useradd -m -s /bin/bash afiliadosbet && echo "afiliadosbet:Alepoker@800" | chpasswd && chown -R afiliadosbet:afiliadosbet . && cat > .env << 'EOFENV'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://afiliadosbet:Alepoker@800@localhost:5432/afiliadosbet
SESSION_SECRET=afiliadosbet_secret_$(openssl rand -base64 16)
DOMAIN=https://afiliadosbet.com.br
FRONTEND_URL=https://afiliadosbet.com.br
BACKEND_URL=https://afiliadosbet.com.br
EOFENV
npm install && npm run build && npm run db:push && pm2 delete afiliadosbet 2>/dev/null || true && pm2 start dist/index.js --name afiliadosbet && pm2 save && pm2 startup && tee /etc/nginx/sites-available/afiliadosbet << 'EOFNGINX'
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
EOFNGINX
ln -sf /etc/nginx/sites-available/afiliadosbet /etc/nginx/sites-enabled/ && rm -f /etc/nginx/sites-enabled/default && nginx -t && systemctl restart nginx && apt install -y certbot python3-certbot-nginx && certbot --nginx -d afiliadosbet.com.br -d www.afiliadosbet.com.br --non-interactive --agree-tos -m admin@afiliadosbet.com.br && ufw allow ssh && ufw allow 'Nginx Full' && ufw --force enable && echo "✅ DEPLOY CONCLUÍDO! Acesse: https://afiliadosbet.com.br"
```

## Se der erro, use instalação passo a passo:

### 1. Preparar sistema
```bash
apt update && apt upgrade -y
apt install -y curl git nginx postgresql postgresql-contrib
```

### 2. Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
npm install -g pm2
```

### 3. Configurar banco
```bash
sudo -u postgres psql
CREATE DATABASE afiliadosbet;
CREATE USER afiliadosbet WITH ENCRYPTED PASSWORD 'Alepoker@800';
GRANT ALL PRIVILEGES ON DATABASE afiliadosbet TO afiliadosbet;
ALTER USER afiliadosbet CREATEDB;
\q
```

### 4. Baixar código
```bash
cd /var/www
git clone https://github.com/eaidavid/AfiliadosBet.git afiliadosbet
cd afiliadosbet
useradd -m -s /bin/bash afiliadosbet
echo "afiliadosbet:Alepoker@800" | chpasswd
chown -R afiliadosbet:afiliadosbet .
```

### 5. Configurar aplicação
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

### 6. Build e iniciar
```bash
npm install
npm run build
npm run db:push
pm2 start dist/index.js --name afiliadosbet
pm2 save
pm2 startup
```

### 7. Configurar Nginx
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
    
    client_max_body_size 10M;
}
EOF

ln -sf /etc/nginx/sites-available/afiliadosbet /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### 8. SSL e segurança
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d afiliadosbet.com.br -d www.afiliadosbet.com.br --non-interactive --agree-tos -m admin@afiliadosbet.com.br

sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## Verificar instalação

```bash
pm2 status
curl http://localhost:5000
curl https://afiliadosbet.com.br
```

## Para atualizar no futuro

```bash
cd /var/www/afiliadosbet
git pull origin main
npm install
npm run build
pm2 restart afiliadosbet
```

## Comandos úteis

```bash
# Status
pm2 status

# Logs
pm2 logs afiliadosbet

# Reiniciar
pm2 restart afiliadosbet

# Parar
pm2 stop afiliadosbet

# Nginx
sudo systemctl status nginx
sudo nginx -t

# Banco
sudo -u postgres psql afiliadosbet
```

## Acessos

- **Site:** https://afiliadosbet.com.br
- **SSH:** ssh afiliadosbet@69.62.65.24
- **Logs:** pm2 logs afiliadosbet

O sistema estará totalmente independente e funcionando em produção.