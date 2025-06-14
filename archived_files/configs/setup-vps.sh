#!/bin/bash

# 🚀 Script de Setup Automático - AfiliadosBet VPS
# Execute como root: bash setup-vps.sh

set -e

echo "🚀 Iniciando configuração automática do AfiliadosBet..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[AVISO] $1${NC}"
}

error() {
    echo -e "${RED}[ERRO] $1${NC}"
}

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    error "Execute como root: sudo bash setup-vps.sh"
    exit 1
fi

# Atualizar sistema
log "Atualizando sistema operacional..."
apt update && apt upgrade -y

# Instalar dependências básicas
log "Instalando dependências básicas..."
apt install -y curl wget git nginx postgresql postgresql-contrib ufw

# Instalar Node.js 20
log "Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verificar instalações
log "Verificando instalações..."
node --version
npm --version

# Instalar PM2
log "Instalando PM2..."
npm install -g pm2

# Configurar PostgreSQL
log "Configurando PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Criar banco e usuário
sudo -u postgres psql << EOF
CREATE DATABASE afiliados_db;
CREATE USER afiliados_user WITH PASSWORD 'AfiliadosBet2024!';
GRANT ALL PRIVILEGES ON DATABASE afiliados_db TO afiliados_user;
ALTER USER afiliados_user CREATEDB;
\q
EOF

# Configurar firewall
log "Configurando firewall..."
ufw --force enable
ufw allow 22/tcp  # SSH
ufw allow 80/tcp  # HTTP
ufw allow 443/tcp # HTTPS

# Criar diretório do projeto
log "Criando estrutura de diretórios..."
mkdir -p /opt/afiliados-bet
mkdir -p /opt/afiliados-bet/logs
mkdir -p /opt/afiliados-bet/backup

# Criar arquivo .env de exemplo
log "Criando arquivo de configuração..."
cat > /opt/afiliados-bet/.env << 'EOF'
# Configurações de Produção - AfiliadosBet
NODE_ENV=production
PORT=3000

# Banco de Dados
DATABASE_URL=postgresql://afiliados_user:AfiliadosBet2024!@localhost:5432/afiliados_db
PGUSER=afiliados_user
PGPASSWORD=AfiliadosBet2024!
PGDATABASE=afiliados_db
PGHOST=localhost
PGPORT=5432

# Segurança
SESSION_SECRET=sua_chave_secreta_muito_longa_e_segura_aqui_mude_esta_linha

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3000
EOF

# Configurar Nginx
log "Configurando Nginx..."
cat > /etc/nginx/sites-available/afiliados-bet << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Logs
    access_log /var/log/nginx/afiliados_access.log;
    error_log /var/log/nginx/afiliados_error.log;
    
    # Configurações de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF

# Ativar site no Nginx
ln -sf /etc/nginx/sites-available/afiliados-bet /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar configuração do Nginx
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

# Criar script de deploy
log "Criando script de deploy..."
cat > /opt/afiliados-bet/deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 Fazendo deploy da aplicação..."

cd /opt/afiliados-bet

# Backup do banco (se existir)
if pm2 list | grep -q "afiliados-bet"; then
    echo "📦 Fazendo backup do banco..."
    pg_dump -U afiliados_user -h localhost afiliados_db > backup/backup_$(date +%Y%m%d_%H%M%S).sql
fi

# Parar aplicação
pm2 stop afiliados-bet || true

# Instalar dependências
echo "📦 Instalando dependências..."
npm install --production

# Executar migrações do banco
echo "🗄️ Executando migrações..."
npm run db:push

# Iniciar aplicação
echo "🚀 Iniciando aplicação..."
pm2 start ecosystem.config.js

# Salvar configuração do PM2
pm2 save

echo "✅ Deploy concluído!"
EOF

chmod +x /opt/afiliados-bet/deploy.sh

# Criar script de backup
cat > /opt/afiliados-bet/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/afiliados-bet/backup"
DATE=$(date +%Y%m%d_%H%M%S)

echo "📦 Fazendo backup completo..."

# Backup do banco
pg_dump -U afiliados_user -h localhost afiliados_db > "$BACKUP_DIR/db_backup_$DATE.sql"

# Backup dos arquivos (se houver uploads)
if [ -d "/opt/afiliados-bet/uploads" ]; then
    tar -czf "$BACKUP_DIR/files_backup_$DATE.tar.gz" /opt/afiliados-bet/uploads
fi

# Manter apenas os últimos 7 backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup concluído: $DATE"
EOF

chmod +x /opt/afiliados-bet/backup.sh

# Configurar cron para backup automático
log "Configurando backup automático..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/afiliados-bet/backup.sh >> /opt/afiliados-bet/logs/backup.log 2>&1") | crontab -

# Configurar PM2 para iniciar no boot
log "Configurando PM2 para iniciar automaticamente..."
pm2 startup systemd -u root --hp /root
pm2 save

# Criar arquivo de status
cat > /opt/afiliados-bet/status.txt << EOF
🎉 SETUP CONCLUÍDO COM SUCESSO!

📁 Diretório do projeto: /opt/afiliados-bet
🗄️ Banco de dados: afiliados_db
👤 Usuário do banco: afiliados_user
🔑 Senha do banco: AfiliadosBet2024!

📋 PRÓXIMOS PASSOS:

1. Fazer upload do seu projeto:
   scp -r ./seu-projeto/* root@SEU_IP:/opt/afiliados-bet/

2. Configurar domínio no arquivo:
   nano /etc/nginx/sites-available/afiliados-bet
   (substituir server_name _ por seu-dominio.com)

3. Executar deploy:
   cd /opt/afiliados-bet
   ./deploy.sh

4. Configurar SSL (opcional):
   apt install certbot python3-certbot-nginx
   certbot --nginx -d seu-dominio.com

🔧 COMANDOS ÚTEIS:

- Ver logs: pm2 logs
- Status: pm2 status
- Restart: pm2 restart afiliados-bet
- Backup: ./backup.sh
- Deploy: ./deploy.sh

📊 MONITORAMENTO:

- Logs da aplicação: /opt/afiliados-bet/logs/
- Logs do Nginx: /var/log/nginx/
- PM2 monitoring: pm2 monit

✅ Sistema pronto para receber sua aplicação!
EOF

# Mostrar status final
log "Setup concluído! Verificando status dos serviços..."
systemctl status postgresql --no-pager -l
systemctl status nginx --no-pager -l

echo ""
cat /opt/afiliados-bet/status.txt

log "✅ Setup automático concluído com sucesso!"
log "📝 Leia o arquivo /opt/afiliados-bet/status.txt para próximos passos"