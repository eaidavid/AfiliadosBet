#!/bin/bash

# Script de Deploy Automatizado - AfiliadosBet Produção
# Execute com: chmod +x production-deploy.sh && ./production-deploy.sh

set -e  # Parar execução em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
APP_NAME="afiliadosbet"
APP_DIR="/var/www/afiliadosbet"
BACKUP_DIR="/var/backups/afiliadosbet"
LOG_FILE="/var/log/deploy.log"

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a $LOG_FILE
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    error "Execute como root: sudo ./production-deploy.sh"
fi

log "🚀 Iniciando deploy do AfiliadosBet em produção..."

# Verificar se o diretório existe
if [ ! -d "$APP_DIR" ]; then
    error "Diretório da aplicação não encontrado: $APP_DIR"
fi

cd $APP_DIR

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# 1. Backup do banco de dados
log "📦 Fazendo backup do banco de dados..."
BACKUP_FILE="$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql"
sudo -u postgres pg_dump afiliadosbet > $BACKUP_FILE || error "Falha no backup do banco"
log "✅ Backup do banco salvo em: $BACKUP_FILE"

# 2. Backup dos arquivos da aplicação
log "📁 Fazendo backup dos arquivos..."
tar -czf "$BACKUP_DIR/app_backup_$(date +%Y%m%d_%H%M%S).tar.gz" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=dist \
    --exclude=build \
    -C /var/www afiliadosbet || warning "Backup de arquivos falhou"

# 3. Verificar status da aplicação antes da atualização
log "🔍 Verificando status atual da aplicação..."
if pm2 list | grep -q "$APP_NAME"; then
    APP_RUNNING=true
    log "✅ Aplicação está rodando"
else
    APP_RUNNING=false
    warning "Aplicação não está rodando"
fi

# 4. Atualizar código do repositório
log "⬇️ Baixando atualizações do repositório..."
git fetch origin || error "Falha ao fazer fetch do repositório"

# Verificar se há atualizações
UPDATES=$(git rev-list HEAD...origin/main --count)
if [ "$UPDATES" -eq 0 ]; then
    log "✅ Código já está atualizado"
else
    log "📥 Aplicando $UPDATES atualizações..."
    git pull origin main || error "Falha ao atualizar código"
fi

# 5. Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    warning "Arquivo .env não encontrado. Criando template..."
    cp .env.example .env 2>/dev/null || true
    error "Configure o arquivo .env antes de continuar"
fi

# 6. Instalar/Atualizar dependências
log "📦 Instalando dependências..."
npm ci --production || error "Falha ao instalar dependências"

# 7. Build da aplicação
log "🔨 Fazendo build da aplicação..."
npm run build || error "Falha no build da aplicação"

# 8. Executar migrações do banco
log "🗄️ Executando migrações do banco..."
npm run db:push || error "Falha nas migrações do banco"

# 9. Verificar configuração do Nginx
log "🌐 Verificando configuração do Nginx..."
nginx -t || error "Configuração do Nginx inválida"

# 10. Reiniciar aplicação
if [ "$APP_RUNNING" = true ]; then
    log "🔄 Reiniciando aplicação..."
    pm2 restart $APP_NAME || error "Falha ao reiniciar aplicação"
else
    log "▶️ Iniciando aplicação..."
    pm2 start production-ecosystem.config.js || error "Falha ao iniciar aplicação"
fi

# 11. Aguardar aplicação inicializar
log "⏳ Aguardando aplicação inicializar..."
sleep 10

# 12. Verificar se a aplicação está respondendo
log "🔍 Verificando saúde da aplicação..."
for i in {1..30}; do
    if curl -f -s http://localhost:5000/health > /dev/null 2>&1; then
        log "✅ Aplicação está respondendo"
        break
    fi
    if [ $i -eq 30 ]; then
        error "Aplicação não está respondendo após 30 tentativas"
    fi
    sleep 2
done

# 13. Recarregar Nginx
log "🔄 Recarregando Nginx..."
systemctl reload nginx || warning "Falha ao recarregar Nginx"

# 14. Salvar configuração PM2
log "💾 Salvando configuração PM2..."
pm2 save || warning "Falha ao salvar configuração PM2"

# 15. Limpeza de backups antigos (manter apenas 7 dias)
log "🧹 Limpando backups antigos..."
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete 2>/dev/null || true
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete 2>/dev/null || true

# 16. Status final
log "📊 Status final da aplicação:"
pm2 status $APP_NAME

log "✅ Deploy concluído com sucesso!"
log "🌐 Site disponível em: https://$(hostname -f)"

# 17. Estatísticas do deploy
DEPLOY_END=$(date +%s)
echo
info "📈 Estatísticas do Deploy:"
info "   • Data/Hora: $(date)"
info "   • Versão: $(git rev-parse --short HEAD)"
info "   • Branch: $(git branch --show-current)"
info "   • Último commit: $(git log -1 --pretty=format:'%s')"
info "   • Backup do banco: $BACKUP_FILE"

echo
log "🎉 Deploy do AfiliadosBet concluído com sucesso!"