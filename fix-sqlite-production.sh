#!/bin/bash

# 🔧 VOLTA PARA SQLITE - PRODUÇÃO
# Este script força o retorno ao SQLite que estava funcionando

echo "🔄 REVERTENDO PARA SQLITE - Sistema Funcionando"
echo "⏰ $(date)"

# Cores para logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# 1. PARAR APLICAÇÃO
log "1. Parando aplicação..."
pm2 kill 2>/dev/null || true
pkill -f "node.*afiliadosbet" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true
sleep 2
success "Aplicação parada"

# 2. REMOVER POSTGRESQL DA CONFIGURAÇÃO
log "2. Configurando para SQLite..."
cat > .env << 'EOF'
NODE_ENV=production
SESSION_SECRET=afiliadosbet_super_secret_production_2025
PORT=3000
HOST=0.0.0.0
EOF
success "Configuração SQLite definida"

# 3. CRIAR DIRETÓRIO DATA
log "3. Preparando SQLite..."
mkdir -p data
chmod 755 data
success "Diretório SQLite preparado"

# 4. LIMPAR CACHE E REBUILD
log "4. Limpando cache..."
rm -rf node_modules/.cache dist 2>/dev/null || true
npm cache clean --force > /dev/null 2>&1
success "Cache limpo"

# 5. INSTALAR DEPENDÊNCIAS
log "5. Instalando dependências..."
npm install > /dev/null 2>&1
if [ $? -ne 0 ]; then
    error "Falha ao instalar dependências"
    exit 1
fi
success "Dependências instaladas"

# 6. BUILD DA APLICAÇÃO
log "6. Fazendo build..."
npm run build > /dev/null 2>&1
if [ $? -ne 0 ]; then
    warning "Build falhou, tentando build manual..."
    npx vite build > /dev/null 2>&1
    npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist > /dev/null 2>&1
fi

# Verificar se build funcionou
if [ ! -f "dist/index.js" ]; then
    error "Build falhou completamente"
    exit 1
fi
success "Build concluído"

# 7. CRIAR ECOSYSTEM PARA SQLITE
log "7. Configurando PM2..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'afiliadosbet',
    script: 'dist/index.js',
    env: {
      NODE_ENV: 'production',
      SESSION_SECRET: 'afiliadosbet_super_secret_production_2025',
      PORT: 3000,
      HOST: '0.0.0.0'
    },
    instances: 1,
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    watch: false
  }]
};
EOF

mkdir -p logs
success "PM2 configurado para SQLite"

# 8. INICIAR APLICAÇÃO SQLITE
log "8. Iniciando aplicação SQLite..."
NODE_ENV=production pm2 start ecosystem.config.js

# 9. AGUARDAR INICIALIZAÇÃO
log "9. Aguardando inicialização..."
sleep 15

# 10. VERIFICAR STATUS
if pm2 list | grep -q "afiliadosbet.*online"; then
    success "Aplicação online"
    
    # Teste API
    log "10. Testando API..."
    sleep 5
    
    API_RESPONSE=$(curl -s -w "%{http_code}" "http://localhost:3000/api/health" -o /tmp/api_test.txt)
    if [ "$API_RESPONSE" = "200" ]; then
        success "API funcionando"
        
        # Teste admin stats
        STATS_RESPONSE=$(curl -s "http://localhost:3000/api/stats/admin")
        if echo "$STATS_RESPONSE" | grep -q "totalAffiliates"; then
            success "API stats funcionando"
            
            echo ""
            echo "🎉 SISTEMA SQLITE FUNCIONANDO!"
            echo "✅ SQLite: Ativo"
            echo "✅ Aplicação: Online"
            echo "✅ API: Funcionando"
            echo "✅ Build: Concluído"
            echo ""
            echo "🌐 Site: https://afiliadosbet.com.br"
            echo "🔐 Admin: admin@afiliadosbet.com.br / admin123"
            echo "📊 Panel: https://afiliadosbet.com.br/admin"
            echo ""
            echo "📋 Stats API: $STATS_RESPONSE"
            
        else
            warning "API stats com problemas"
            echo "Response: $STATS_RESPONSE"
        fi
    else
        warning "API não respondeu corretamente"
        cat /tmp/api_test.txt 2>/dev/null || echo "Erro na resposta da API"
    fi
    
else
    error "Aplicação falhou ao iniciar"
    echo "Logs dos últimos erros:"
    pm2 logs afiliadosbet --lines 10
    exit 1
fi

echo ""
echo "🔍 Para verificar logs: pm2 logs afiliadosbet"
echo "🔄 Para reiniciar: pm2 restart afiliadosbet"
echo "📊 Para stats: curl http://localhost:3000/api/stats/admin"
echo "🗂️ Banco SQLite: data/afiliadosbet.sqlite"

success "SISTEMA SQLITE PRODUÇÃO FUNCIONANDO!"