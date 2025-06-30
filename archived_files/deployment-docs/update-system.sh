#!/bin/bash

# Sistema de Atualização Automática - AfiliadosBet
# Execute: bash update-system.sh

set -e

# Configurações
APP_DIR="/var/www/afiliadosbet"
BACKUP_DIR="/home/afiliadosbet/backups"
LOG_FILE="/var/log/afiliadosbet-update.log"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

# Verificar se está no diretório correto
if [ ! -f "$APP_DIR/package.json" ]; then
    error "Diretório da aplicação não encontrado: $APP_DIR"
fi

cd $APP_DIR

log "Iniciando atualização do AfiliadosBet..."

# 1. Backup antes da atualização
log "Criando backup..."
mkdir -p $BACKUP_DIR
BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S)"

# Backup do banco
pg_dump -U afiliadosbet afiliadosbet > "${BACKUP_FILE}_db.sql" || warning "Falha no backup do banco"

# Backup dos arquivos
tar -czf "${BACKUP_FILE}_app.tar.gz" . --exclude=node_modules --exclude=dist --exclude=.git || warning "Falha no backup dos arquivos"

# 2. Verificar atualizações disponíveis
log "Verificando atualizações..."
git fetch origin

UPDATES=$(git rev-list HEAD...origin/main --count 2>/dev/null || echo "0")
if [ "$UPDATES" -eq 0 ]; then
    log "Sistema já está atualizado"
    exit 0
fi

log "Encontradas $UPDATES atualizações"

# 3. Parar aplicação
log "Parando aplicação..."
pm2 stop afiliadosbet || warning "Falha ao parar aplicação"

# 4. Aplicar atualizações
log "Aplicando atualizações..."
git pull origin main || error "Falha ao baixar atualizações"

# 5. Atualizar dependências
log "Atualizando dependências..."
npm install --production || error "Falha ao instalar dependências"

# 6. Executar migrações
log "Executando migrações do banco..."
npm run db:push || warning "Falha nas migrações"

# 7. Build da aplicação
log "Fazendo build da aplicação..."
npm run build || {
    warning "Build padrão falhou, usando método alternativo..."
    rm -rf dist/
    mkdir -p dist/public
    cd client && npx vite build --outDir ../dist/public && cd ..
    npx esbuild server/index.ts --bundle --platform=node --outdir=dist --format=esm
}

# 8. Verificar se build foi bem-sucedido
if [ ! -f "dist/index.js" ] || [ ! -f "dist/public/index.html" ]; then
    error "Build falhou - arquivos não foram gerados"
fi

# 9. Reiniciar aplicação
log "Reiniciando aplicação..."
pm2 restart afiliadosbet || pm2 start dist/index.js --name afiliadosbet

# 10. Aguardar aplicação inicializar
log "Aguardando aplicação inicializar..."
sleep 10

# 11. Verificar se aplicação está funcionando
for i in {1..30}; do
    if curl -f -s http://localhost:5000 > /dev/null; then
        log "Aplicação funcionando corretamente"
        break
    fi
    if [ $i -eq 30 ]; then
        error "Aplicação não respondeu após 30 tentativas"
    fi
    sleep 2
done

# 12. Recarregar Nginx
log "Recarregando Nginx..."
nginx -t && systemctl reload nginx || warning "Falha ao recarregar Nginx"

# 13. Limpeza
log "Limpando arquivos temporários..."
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete 2>/dev/null || true
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete 2>/dev/null || true

# 14. Log final
log "Atualização concluída com sucesso!"
log "Versão atual: $(git rev-parse --short HEAD)"
log "Último commit: $(git log -1 --pretty=format:'%s')"

# 15. Status final
pm2 status afiliadosbet