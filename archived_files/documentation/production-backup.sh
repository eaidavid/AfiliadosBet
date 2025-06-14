#!/bin/bash

# Script de Backup Automatizado - AfiliadosBet Produção
# Execute com: chmod +x production-backup.sh && ./production-backup.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configurações
APP_NAME="afiliadosbet"
APP_DIR="/var/www/afiliadosbet"
BACKUP_DIR="/var/backups/afiliadosbet"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    error "Execute como root: sudo ./production-backup.sh"
fi

log "📦 Iniciando backup do AfiliadosBet..."

# Criar diretório de backup
mkdir -p $BACKUP_DIR/database
mkdir -p $BACKUP_DIR/files
mkdir -p $BACKUP_DIR/configs

# 1. Backup do Banco de Dados
log "🗄️ Fazendo backup do banco de dados..."
DB_BACKUP_FILE="$BACKUP_DIR/database/db_backup_$DATE.sql"

if sudo -u postgres pg_dump afiliadosbet > $DB_BACKUP_FILE; then
    # Comprimir backup do banco
    gzip $DB_BACKUP_FILE
    log "✅ Backup do banco salvo: ${DB_BACKUP_FILE}.gz"
    
    # Verificar tamanho do backup
    DB_SIZE=$(du -h "${DB_BACKUP_FILE}.gz" | cut -f1)
    info "   Tamanho: $DB_SIZE"
else
    error "Falha no backup do banco de dados"
fi

# 2. Backup dos Arquivos da Aplicação
log "📁 Fazendo backup dos arquivos da aplicação..."
FILES_BACKUP="$BACKUP_DIR/files/app_files_$DATE.tar.gz"

tar -czf $FILES_BACKUP \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=dist \
    --exclude=build \
    --exclude=*.log \
    --exclude=tmp \
    -C /var/www afiliadosbet

if [ -f $FILES_BACKUP ]; then
    FILES_SIZE=$(du -h $FILES_BACKUP | cut -f1)
    log "✅ Backup de arquivos salvo: $FILES_BACKUP"
    info "   Tamanho: $FILES_SIZE"
else
    error "Falha no backup dos arquivos"
fi

# 3. Backup das Configurações do Sistema
log "⚙️ Fazendo backup das configurações..."
CONFIGS_BACKUP="$BACKUP_DIR/configs/configs_$DATE.tar.gz"

tar -czf $CONFIGS_BACKUP \
    /etc/nginx/sites-available/ \
    /etc/postgresql/*/main/postgresql.conf \
    /etc/postgresql/*/main/pg_hba.conf \
    /etc/crontab \
    /etc/environment \
    2>/dev/null || true

if [ -f $CONFIGS_BACKUP ]; then
    CONFIGS_SIZE=$(du -h $CONFIGS_BACKUP | cut -f1)
    log "✅ Backup de configurações salvo: $CONFIGS_BACKUP"
    info "   Tamanho: $CONFIGS_SIZE"
fi

# 4. Backup dos Logs Importantes
log "📋 Fazendo backup dos logs..."
LOGS_BACKUP="$BACKUP_DIR/files/logs_$DATE.tar.gz"

tar -czf $LOGS_BACKUP \
    /var/log/nginx/afiliadosbet* \
    /var/log/pm2/ \
    /var/log/postgresql/ \
    2>/dev/null || true

if [ -f $LOGS_BACKUP ]; then
    LOGS_SIZE=$(du -h $LOGS_BACKUP | cut -f1)
    log "✅ Backup de logs salvo: $LOGS_BACKUP"
    info "   Tamanho: $LOGS_SIZE"
fi

# 5. Criar arquivo de informações do backup
INFO_FILE="$BACKUP_DIR/backup_info_$DATE.txt"
cat > $INFO_FILE << EOF
===========================================
BACKUP AFILIADOSBET - $(date)
===========================================

Data/Hora: $(date)
Servidor: $(hostname)
IP: $(hostname -I | awk '{print $1}')
Usuário: $(whoami)

APLICAÇÃO:
- Versão: $(cd $APP_DIR && git rev-parse --short HEAD 2>/dev/null || echo "N/A")
- Branch: $(cd $APP_DIR && git branch --show-current 2>/dev/null || echo "N/A")
- Último commit: $(cd $APP_DIR && git log -1 --pretty=format:'%s' 2>/dev/null || echo "N/A")

ARQUIVOS DE BACKUP:
- Banco: ${DB_BACKUP_FILE}.gz ($DB_SIZE)
- Arquivos: $FILES_BACKUP ($FILES_SIZE)
- Configurações: $CONFIGS_BACKUP ($CONFIGS_SIZE)
- Logs: $LOGS_BACKUP ($LOGS_SIZE)

ESTATÍSTICAS DO SISTEMA:
- Uptime: $(uptime)
- Uso de disco: $(df -h / | awk 'NR==2{print $5}')
- Uso de memória: $(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')

STATUS DOS SERVIÇOS:
- Nginx: $(systemctl is-active nginx)
- PostgreSQL: $(systemctl is-active postgresql)
- PM2: $(pm2 list | grep -q afiliadosbet && echo "ativo" || echo "inativo")
EOF

log "📄 Arquivo de informações criado: $INFO_FILE"

# 6. Verificar integridade dos backups
log "🔍 Verificando integridade dos backups..."

# Verificar backup do banco
if gzip -t "${DB_BACKUP_FILE}.gz" 2>/dev/null; then
    log "✅ Backup do banco íntegro"
else
    error "❌ Backup do banco corrompido"
fi

# Verificar backup de arquivos
if tar -tzf $FILES_BACKUP > /dev/null 2>&1; then
    log "✅ Backup de arquivos íntegro"
else
    error "❌ Backup de arquivos corrompido"
fi

# 7. Limpeza de backups antigos
log "🧹 Limpando backups antigos (mais de $RETENTION_DAYS dias)..."

# Contar backups antes da limpeza
BEFORE_COUNT=$(find $BACKUP_DIR -name "*.gz" -o -name "*.sql" -o -name "*.txt" | wc -l)

# Remover backups antigos
find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
find $BACKUP_DIR -name "*.sql" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
find $BACKUP_DIR -name "*.txt" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

# Contar backups após limpeza
AFTER_COUNT=$(find $BACKUP_DIR -name "*.gz" -o -name "*.sql" -o -name "*.txt" | wc -l)
REMOVED=$((BEFORE_COUNT - AFTER_COUNT))

if [ $REMOVED -gt 0 ]; then
    log "🗑️ Removidos $REMOVED arquivos antigos"
else
    log "✅ Nenhum arquivo antigo para remover"
fi

# 8. Estatísticas finais
TOTAL_BACKUP_SIZE=$(du -sh $BACKUP_DIR | cut -f1)
log "📊 Estatísticas do backup:"
info "   • Total de backups: $AFTER_COUNT arquivos"
info "   • Espaço utilizado: $TOTAL_BACKUP_SIZE"
info "   • Diretório: $BACKUP_DIR"

# 9. Opcional: Enviar backup para armazenamento externo
if [ -n "$AWS_S3_BUCKET" ] && command -v aws > /dev/null; then
    log "☁️ Enviando backup para S3..."
    aws s3 cp "${DB_BACKUP_FILE}.gz" "s3://$AWS_S3_BUCKET/database/" || true
    aws s3 cp "$FILES_BACKUP" "s3://$AWS_S3_BUCKET/files/" || true
    log "✅ Backup enviado para S3"
fi

log "✅ Backup concluído com sucesso!"
log "📁 Arquivos salvos em: $BACKUP_DIR"

# Mostrar resumo final
echo
echo "==================================="
echo "📦 RESUMO DO BACKUP"
echo "==================================="
echo "Data: $(date)"
echo "Banco: ${DB_BACKUP_FILE}.gz"
echo "Arquivos: $FILES_BACKUP"
echo "Info: $INFO_FILE"
echo "Total: $TOTAL_BACKUP_SIZE"
echo "==================================="