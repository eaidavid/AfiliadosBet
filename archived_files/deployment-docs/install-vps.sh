#!/bin/bash

# Script de Instalação Automática VPS - AfiliadosBet
# Execute: curl -fsSL https://raw.githubusercontent.com/eaidavid/AfiliadosBet/main/install-vps.sh | bash

set -e

# Configurações
DOMAIN="afiliadosbet.com.br"
DB_NAME="afiliadosbet"
DB_USER="afiliadosbet"
DB_PASS="Alepoker@800"
APP_USER="afiliadosbet"
REPO_URL="https://github.com/eaidavid/AfiliadosBet.git"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    error "Execute como root: sudo bash install-vps.sh"
fi

log "Iniciando instalação do AfiliadosBet VPS..."

# 1. Atualizar sistema
log "Atualizando sistema..."
apt update && apt upgrade -y

# 2. Instalar dependências básicas
log "Instalando dependências básicas..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# 3. Instalar Node.js 18
log "Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 4. Instalar PM2
log "Instalando PM2..."
npm install -g pm2

# 5. Instalar PostgreSQL
log "Instalando PostgreSQL..."
apt install -y postgresql postgresql-contrib

# 6. Instalar Nginx
log "Instalando Nginx..."
apt install -y nginx

# 7. Instalar Certbot
log "Instalando Certbot..."
apt install -y certbot python3-certbot-nginx

# 8. Instalar segurança
log "Instalando fail2ban e UFW..."
apt install -y ufw fail2ban

# 9. Configurar PostgreSQL
log "Configurando PostgreSQL..."
sudo -u postgres psql << EOF
CREATE DATABASE ${DB_NAME};
CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASS}';
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
ALTER USER ${DB_USER} CREATEDB;
\q
EOF

# 10. Criar usuário da aplicação se não existir
if ! id "$APP_USER" &>/dev/null; then
    log "Criando usuário $APP_USER..."
    useradd -m -s /bin/bash $APP_USER
    echo "$APP_USER:$DB_PASS" | chpasswd
    usermod -aG sudo $APP_USER
fi

# 11. Clonar repositório
log "Baixando código da aplicação..."
cd /var/www
if [ -d "afiliadosbet" ]; then
    rm -rf afiliadosbet
fi

git clone $REPO_URL afiliadosbet
chown -R $APP_USER:$APP_USER afiliadosbet

# 12. Configurar aplicação
log "Configurando aplicação..."
cd afiliadosbet

# Criar .env
cat > .env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}
SESSION_SECRET=afiliadosbet_secret_$(openssl rand -base64 32)
DOMAIN=https://${DOMAIN}
FRONTEND_URL=https://${DOMAIN}
BACKEND_URL=https://${DOMAIN}
EOF

chown $APP_USER:$APP_USER .env

# 13. Instalar dependências como usuário da aplicação
log "Instalando dependências da aplicação..."
sudo -u $APP_USER bash << 'EOSU'
cd /var/www/afiliadosbet
npm install
npm run build || {
    echo "Build falhou, tentando alternativo..."
    rm -rf dist/
    mkdir -p dist/public
    cd client && npx vite build --outDir ../dist/public && cd ..
    npx esbuild server/index.ts --bundle --platform=node --outdir=dist --format=esm
}
npm run db:push
EOSU

# 14. Configurar PM2
log "Configurando PM2..."
sudo -u $APP_USER bash << 'EOSU'
cd /var/www/afiliadosbet
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'afiliadosbet',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    max_memory_restart: '1G',
    autorestart: true,
    watch: false
  }]
};
EOF

pm2 start ecosystem.config.js
pm2 save
pm2 startup
EOSU

# 15. Configurar Nginx
log "Configurando Nginx..."
cat > /etc/nginx/sites-available/afiliadosbet << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    client_max_body_size 10M;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}
EOF

ln -sf /etc/nginx/sites-available/afiliadosbet /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl restart nginx

# 16. Configurar SSL
log "Configurando SSL/HTTPS..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN --redirect

# 17. Configurar firewall
log "Configurando firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# 18. Configurar fail2ban
log "Configurando fail2ban..."
cat > /etc/fail2ban/jail.local << EOF
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
EOF

systemctl enable fail2ban
systemctl start fail2ban

# 19. Criar script de atualização
log "Criando script de atualização..."
cat > /home/$APP_USER/update-app.sh << 'EOF'
#!/bin/bash
cd /var/www/afiliadosbet
git pull origin main
npm install
npm run build || {
    rm -rf dist/
    mkdir -p dist/public
    cd client && npx vite build --outDir ../dist/public && cd ..
    npx esbuild server/index.ts --bundle --platform=node --outdir=dist --format=esm
}
pm2 restart afiliadosbet
echo "Aplicação atualizada com sucesso!"
EOF

chown $APP_USER:$APP_USER /home/$APP_USER/update-app.sh
chmod +x /home/$APP_USER/update-app.sh

# 20. Configurar backup automático
log "Configurando backup automático..."
cat > /home/$APP_USER/backup.sh << EOF
#!/bin/bash
BACKUP_DIR="/home/$APP_USER/backups"
mkdir -p \$BACKUP_DIR
DATE=\$(date +%Y%m%d_%H%M%S)

# Backup banco
pg_dump -U $DB_USER $DB_NAME > \$BACKUP_DIR/db_\$DATE.sql

# Backup aplicação
tar -czf \$BACKUP_DIR/app_\$DATE.tar.gz -C /var/www afiliadosbet --exclude=node_modules --exclude=dist

# Manter apenas 7 backups
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup concluído: \$DATE"
EOF

chown $APP_USER:$APP_USER /home/$APP_USER/backup.sh
chmod +x /home/$APP_USER/backup.sh

# Configurar cron para backup diário
echo "0 2 * * * /home/$APP_USER/backup.sh" | sudo -u $APP_USER crontab -

# 21. Verificações finais
log "Executando verificações finais..."

# Verificar serviços
systemctl is-active --quiet nginx || error "Nginx não está ativo"
systemctl is-active --quiet postgresql || error "PostgreSQL não está ativo"

# Verificar aplicação
sleep 5
if curl -f -s http://localhost:5000 > /dev/null; then
    log "Aplicação respondendo localmente"
else
    warning "Aplicação pode não estar respondendo"
fi

# 22. Informações finais
log "Instalação concluída com sucesso!"

echo
echo "==============================================="
echo "         INSTALAÇÃO CONCLUÍDA"
echo "==============================================="
echo "Domínio: https://$DOMAIN"
echo "IP: $(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
echo "Usuário SSH: $APP_USER"
echo "Senha SSH: $DB_PASS"
echo
echo "Comandos úteis:"
echo "  sudo -u $APP_USER pm2 status"
echo "  sudo -u $APP_USER pm2 logs afiliadosbet"
echo "  sudo -u $APP_USER /home/$APP_USER/update-app.sh"
echo "  sudo -u $APP_USER /home/$APP_USER/backup.sh"
echo
echo "Logs importantes:"
echo "  /var/log/nginx/access.log"
echo "  /var/log/nginx/error.log"
echo "  sudo -u $APP_USER pm2 logs"
echo "==============================================="