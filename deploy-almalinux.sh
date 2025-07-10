#!/bin/bash

# Script de Deploy Automático - AfiliadosBet para AlmaLinux
# Versão: 1.0
# Compatível com: AlmaLinux 8/9

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar se está rodando como root
if [[ $EUID -ne 0 ]]; then
   error "Este script deve ser executado como root (use sudo)"
fi

# Banner
echo -e "${BLUE}"
cat << "EOF"
 █████╗ ███████╗██╗██╗     ██╗ █████╗ ██████╗  ██████╗ ███████╗██████╗ ███████╗████████╗
██╔══██╗██╔════╝██║██║     ██║██╔══██╗██╔══██╗██╔═══██╗██╔════╝██╔══██╗██╔════╝╚══██╔══╝
███████║█████╗  ██║██║     ██║███████║██║  ██║██║   ██║███████╗██████╔╝█████╗     ██║   
██╔══██║██╔══╝  ██║██║     ██║██╔══██║██║  ██║██║   ██║╚════██║██╔══██╗██╔══╝     ██║   
██║  ██║██║     ██║███████╗██║██║  ██║██████╔╝╚██████╔╝███████║██████╔╝███████╗   ██║   
╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚══════╝╚═════╝ ╚══════╝   ╚═╝   
                                                                                         
              DEPLOY AUTOMÁTICO PARA ALMALINUX + WEBMIN
EOF
echo -e "${NC}"

log "Iniciando deploy do AfiliadosBet..."

# Obter informações do usuário
read -p "Digite o domínio (ex: afiliadosbet.com.br): " DOMAIN
read -p "Digite o URL do repositório GitHub: " GITHUB_REPO
read -s -p "Digite uma senha segura para o banco PostgreSQL: " DB_PASSWORD
echo

# Validar inputs
if [[ -z "$DOMAIN" ]] || [[ -z "$GITHUB_REPO" ]] || [[ -z "$DB_PASSWORD" ]]; then
    error "Todos os campos são obrigatórios!"
fi

log "Configurando variáveis..."
DB_USER="afiliadosbet"
DB_NAME="afiliadosbet"
APP_DIR="/var/www/afiliadosbet"
SESSION_SECRET=$(openssl rand -base64 32)

# 1. Atualização do sistema
log "Atualizando o sistema..."
dnf update -y
dnf install -y curl wget git vim unzip htop

# 2. Configurar firewall
log "Configurando firewall..."
systemctl start firewalld
systemctl enable firewalld
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --permanent --add-port=10000/tcp
firewall-cmd --reload

# 3. Instalar Webmin
log "Instalando Webmin..."
cat > /etc/yum.repos.d/webmin.repo << EOF
[Webmin]
name=Webmin Distribution Neutral
baseurl=https://download.webmin.com/download/yum/
enabled=1
gpgcheck=1
gpgkey=http://www.webmin.com/jcameron-key.asc
EOF

dnf install -y webmin
systemctl start webmin
systemctl enable webmin

# 4. Instalar Node.js
log "Instalando Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs

# Instalar PM2
npm install -g pm2
pm2 startup systemd

# 5. Instalar PostgreSQL
log "Instalando PostgreSQL..."
dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm
dnf install -y postgresql15-server postgresql15

# Inicializar PostgreSQL
/usr/pgsql-15/bin/postgresql-15-setup initdb
systemctl start postgresql-15
systemctl enable postgresql-15

# Configurar PostgreSQL
log "Configurando PostgreSQL..."
sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\q
EOF

# Configurar autenticação
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /var/lib/pgsql/15/data/postgresql.conf
echo "local   $DB_NAME    $DB_USER                            md5" >> /var/lib/pgsql/15/data/pg_hba.conf
systemctl restart postgresql-15

# 6. Instalar Nginx
log "Instalando Nginx..."
dnf install -y nginx
systemctl start nginx
systemctl enable nginx

# 7. Clonar e configurar aplicação
log "Clonando aplicação do GitHub..."
mkdir -p $APP_DIR
cd $APP_DIR
git clone $GITHUB_REPO .

# Criar arquivo .env
log "Configurando variáveis de ambiente..."
cat > $APP_DIR/.env << EOF
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME

# Session
SESSION_SECRET=$SESSION_SECRET

# Domain
DOMAIN=$DOMAIN
EOF

chmod 600 $APP_DIR/.env

# 8. Instalar dependências e build
log "Instalando dependências..."
npm ci --production

log "Fazendo build da aplicação..."
npm run build

# 9. Configurar Nginx
log "Configurando Nginx..."
cat > /etc/nginx/conf.d/$DOMAIN.conf << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL será configurado pelo Certbot
    
    root $APP_DIR/dist/public;
    index index.html;

    access_log /var/log/nginx/${DOMAIN}_access.log;
    error_log /var/log/nginx/${DOMAIN}_error.log;

    location / {
        try_files \$uri \$uri/ @nodejs;
    }

    location @nodejs {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

nginx -t
systemctl reload nginx

# 10. Configurar SSL com Let's Encrypt
log "Instalando Certbot para SSL..."
dnf install -y certbot python3-certbot-nginx

info "Para configurar SSL, execute depois:"
info "certbot --nginx -d $DOMAIN -d www.$DOMAIN"

# 11. Configurar PM2
log "Configurando PM2..."
cat > $APP_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'afiliadosbet',
    script: './dist/index.js',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/afiliadosbet/error.log',
    out_file: '/var/log/afiliadosbet/out.log',
    log_file: '/var/log/afiliadosbet/combined.log',
    time: true
  }]
};
EOF

mkdir -p /var/log/afiliadosbet
chown nginx:nginx /var/log/afiliadosbet
chown -R nginx:nginx $APP_DIR

# Executar migrations
log "Executando migrations do banco..."
npm run db:push

# Iniciar aplicação
log "Iniciando aplicação..."
pm2 start ecosystem.config.js
pm2 save

# 12. Configurar backups
log "Configurando sistema de backup..."
cat > /usr/local/bin/backup-afiliadosbet.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/afiliadosbet"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup do banco
pg_dump -U afiliadosbet -h localhost afiliadosbet > $BACKUP_DIR/db_$DATE.sql

# Backup dos arquivos
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/afiliadosbet

# Limpar backups antigos
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-afiliadosbet.sh

# Agendar backup diário
echo "0 3 * * * /usr/local/bin/backup-afiliadosbet.sh" | crontab -

# 13. Script de deploy
log "Criando script de deploy..."
cat > /usr/local/bin/deploy-afiliadosbet.sh << 'EOF'
#!/bin/bash
set -e

cd /var/www/afiliadosbet

echo "Iniciando deploy..."
/usr/local/bin/backup-afiliadosbet.sh

pm2 stop afiliadosbet
git pull origin main
npm ci --production
npm run build
npm run db:push
pm2 restart afiliadosbet

echo "Deploy concluído!"
EOF

chmod +x /usr/local/bin/deploy-afiliadosbet.sh

# 14. Instalar fail2ban para segurança
log "Instalando Fail2ban..."
dnf install -y fail2ban

cat > /etc/fail2ban/jail.local << EOF
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/secure
maxretry = 3
bantime = 3600
EOF

systemctl start fail2ban
systemctl enable fail2ban

# Finalização
log "Deploy concluído com sucesso!"
echo
echo -e "${GREEN}==================== INFORMAÇÕES DO SISTEMA ====================${NC}"
echo -e "${BLUE}Site:${NC} http://$DOMAIN (configure SSL depois)"
echo -e "${BLUE}Webmin:${NC} https://$DOMAIN:10000"
echo -e "${BLUE}Login padrão:${NC} admin@afiliadosbet.com.br / admin123"
echo -e "${BLUE}Banco:${NC} $DB_NAME / $DB_USER"
echo
echo -e "${YELLOW}PRÓXIMOS PASSOS:${NC}"
echo "1. Configure SSL: certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "2. Acesse o Webmin para monitorar o sistema"
echo "3. Teste o site e as funcionalidades"
echo "4. Configure monitoramento adicional se necessário"
echo
echo -e "${GREEN}COMANDOS ÚTEIS:${NC}"
echo "- Status: pm2 status"
echo "- Logs: pm2 logs afiliadosbet"
echo "- Deploy: /usr/local/bin/deploy-afiliadosbet.sh"
echo "- Backup: /usr/local/bin/backup-afiliadosbet.sh"
echo
log "Sistema AfiliadosBet instalado e configurado!"