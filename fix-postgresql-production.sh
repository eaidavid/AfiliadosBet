#!/bin/bash

# 🔧 Script de Correção Automática para VPS
# Corrige loop de redirecionamento e força PostgreSQL

echo "🚀 Iniciando correção do sistema AfiliadosBet..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script no diretório do projeto AfiliadosBet"
    exit 1
fi

log "1. Fazendo backup..."
cp -r . ../backup-$(date +%Y%m%d-%H%M) 2>/dev/null || warning "Não foi possível fazer backup"

log "2. Parando aplicação..."
pm2 stop afiliadosbet 2>/dev/null || warning "Aplicação não estava rodando"
pm2 delete afiliadosbet 2>/dev/null || warning "Aplicação não estava no PM2"

log "3. Verificando PostgreSQL..."
if systemctl is-active --quiet postgresql-15; then
    info "PostgreSQL está rodando"
else
    warning "PostgreSQL não está rodando, tentando iniciar..."
    systemctl start postgresql-15
    sleep 3
fi

log "4. Testando conexão com banco..."
if psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "SELECT 1;" >/dev/null 2>&1; then
    info "Conexão com PostgreSQL OK"
else
    error "Falha na conexão com PostgreSQL"
    info "Verifique as credenciais: afiliadosbet / Alepoker800"
    exit 1
fi

log "5. Criando tabela de sessões se necessário..."
psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "
CREATE TABLE IF NOT EXISTS sessions (
  sid varchar PRIMARY KEY,
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);
" >/dev/null 2>&1

log "6. Limpando sessões antigas..."
psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "DELETE FROM sessions WHERE expire < NOW();" >/dev/null 2>&1

log "7. Configurando ambiente de produção..."
cat > .env << EOF
NODE_ENV=production
DATABASE_URL=postgresql://afiliadosbet:Alepoker800@localhost:5432/afiliadosbetdb
SESSION_SECRET=afiliadosbet_super_secret_key_$(date +%s)
PORT=3000
HOST=0.0.0.0
EOF

log "8. Limpando cache e dependências..."
rm -rf node_modules dist .vite .next 2>/dev/null
npm cache clean --force >/dev/null 2>&1

log "9. Reinstalando dependências..."
npm install --production=false

if [ $? -ne 0 ]; then
    error "Falha ao instalar dependências"
    exit 1
fi

log "10. Fazendo build da aplicação..."
npm run build

if [ $? -ne 0 ]; then
    error "Falha no build da aplicação"
    exit 1
fi

log "11. Iniciando aplicação..."
NODE_ENV=production pm2 start npm --name "afiliadosbet" -- start

if [ $? -ne 0 ]; then
    error "Falha ao iniciar aplicação"
    exit 1
fi

sleep 5

log "12. Verificando status..."
if pm2 describe afiliadosbet >/dev/null 2>&1; then
    info "Aplicação iniciada com sucesso!"
else
    error "Aplicação não está rodando"
    exit 1
fi

log "13. Testando endpoint de saúde..."
sleep 3
if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    info "Endpoint de saúde respondendo OK"
else
    warning "Endpoint de saúde não está respondendo ainda"
fi

echo ""
echo -e "${GREEN}✅ CORREÇÃO CONCLUÍDA!${NC}"
echo ""
echo "📊 Status do sistema:"
pm2 status | grep afiliadosbet
echo ""
echo "📝 Para ver logs:"
echo "   pm2 logs afiliadosbet"
echo ""
echo "🌐 Teste o site:"
echo "   https://afiliadosbet.com.br"
echo ""
echo "🔑 Credenciais de teste:"
echo "   Admin: admin@afiliadosbet.com.br / admin123"
echo "   Afiliado: afiliado@afiliadosbet.com.br / admin123"
echo ""
echo "🐛 Para debug adicional:"
echo "   pm2 logs afiliadosbet | grep -E '(Login|redirect|auth|session)'"
echo ""