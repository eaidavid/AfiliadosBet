#!/bin/bash

# 🔄 Script Específico para Correção de Sessão PostgreSQL
# Foca apenas na correção do problema de loop

echo "🔄 Corrigindo sessões PostgreSQL..."

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[ERRO]${NC} $1"; }
warning() { echo -e "${YELLOW}[AVISO]${NC} $1"; }

# Verificações básicas
if [ ! -f "package.json" ]; then
    error "Execute no diretório do projeto"
    exit 1
fi

log "1. Parando aplicação..."
pm2 stop afiliadosbet 2>/dev/null
pm2 delete afiliadosbet 2>/dev/null

log "2. Verificando se arquivos de correção estão aplicados..."
if grep -q "window.location.href = targetPath" client/src/hooks/use-auth.ts; then
    log "✅ Correção de redirecionamento aplicada"
elif grep -q "window.location.replace" client/src/hooks/use-auth.ts; then
    warning "⚠️ Versão antiga detectada, aplicando correção..."
    # Aplicar correção diretamente
    sed -i 's/window\.location\.replace(targetPath);/setTimeout(() => {\n          console.log("🔄 Executando redirecionamento para:", targetPath);\n          window.location.href = targetPath;\n        }, 500);/' client/src/hooks/use-auth.ts
    log "✅ Correção aplicada automaticamente"
else
    error "❌ Correção de redirecionamento NÃO aplicada"
    echo "Executando correção forçada..."
    
    # Force git update
    git fetch --all
    git reset --hard origin/main
    
    # Check again
    if ! grep -q "window.location.href = targetPath" client/src/hooks/use-auth.ts; then
        echo "Aplicando correção manual..."
        sed -i 's/window\.location\.replace(targetPath);/setTimeout(() => {\n          console.log("🔄 Executando redirecionamento para:", targetPath);\n          window.location.href = targetPath;\n        }, 500);/' client/src/hooks/use-auth.ts
    fi
fi

if grep -q "DESABILITADO para evitar loops" client/src/pages/auth.tsx; then
    log "✅ Correção de loop aplicada"
elif grep -q "Você já está logado" client/src/App.tsx; then
    log "✅ Correção de loop aplicada (versão App.tsx)"
else
    warning "⚠️ Correção de loop não encontrada, continuando..."
fi

log "3. Forçando ambiente PostgreSQL..."
cat > .env << EOF
NODE_ENV=production
DATABASE_URL=postgresql://afiliadosbet:Alepoker800@localhost:5432/afiliadosbetdb
SESSION_SECRET=afiliadosbet_super_secret_key_2025
PORT=3000
HOST=0.0.0.0
EOF

log "4. Testando PostgreSQL..."
if ! psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "SELECT 1;" >/dev/null 2>&1; then
    error "PostgreSQL não conectou"
    echo "Verifique: systemctl status postgresql-15"
    exit 1
fi

log "5. Recriando tabela de sessões..."
psql -U afiliadosbet -h localhost -d afiliadosbetdb << 'EOSQL'
DROP TABLE IF EXISTS sessions;
CREATE TABLE sessions (
  sid varchar PRIMARY KEY,
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);
CREATE INDEX IDX_session_expire ON sessions(expire);
EOSQL

log "6. Build rápido..."
npm run build

if [ $? -ne 0 ]; then
    error "Build falhou"
    exit 1
fi

log "7. Iniciando com logs..."
NODE_ENV=production pm2 start npm --name "afiliadosbet" -- start

sleep 5

log "8. Verificando logs..."
pm2 logs afiliadosbet --lines 10

echo ""
echo -e "${GREEN}✅ SESSÃO CORRIGIDA!${NC}"
echo ""
echo "🧪 Teste agora:"
echo "1. Acesse: https://afiliadosbet.com.br"
echo "2. Faça login com: admin@afiliadosbet.com.br / admin123"
echo "3. Deve redirecionar para /admin sem loop"
echo ""
echo "📊 Para monitorar:"
echo "pm2 logs afiliadosbet | grep -E '(Login|redirect|auth)'"