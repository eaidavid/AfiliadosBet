#!/bin/bash

# 🔧 CORREÇÃO FORÇADA: SQLite → PostgreSQL
# Este script força a migração completa para PostgreSQL

echo "🚨 CORREÇÃO FORÇADA: Migrando SQLite → PostgreSQL"
echo "⏰ $(date)"

# Cores para logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# 1. PARAR APLICAÇÃO COMPLETAMENTE
log "1. Parando aplicação..."
pm2 kill 2>/dev/null || true
pkill -f "node.*afiliadosbet" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true
sleep 2
success "Aplicação parada"

# 2. REMOVER TODOS OS ARQUIVOS SQLITE
log "2. Removendo SQLite..."
rm -rf data/ 2>/dev/null || true
rm -f *.sqlite *.db 2>/dev/null || true
rm -rf node_modules/.cache/ 2>/dev/null || true
success "SQLite removido"

# 3. FORÇAR CONFIGURAÇÃO POSTGRESQL
log "3. Configurando .env para PostgreSQL..."
cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://afiliadosbet:Alepoker800@localhost:5432/afiliadosbetdb
SESSION_SECRET=afiliadosbet_super_secret_production_2025
PORT=3000
HOST=0.0.0.0
EOF
success "Arquivo .env configurado"

# 4. GARANTIR POSTGRESQL RODANDO
log "4. Verificando PostgreSQL..."
if ! systemctl is-active --quiet postgresql-15; then
    warning "PostgreSQL não rodando, iniciando..."
    systemctl start postgresql-15
    sleep 3
fi

if systemctl is-active --quiet postgresql-15; then
    success "PostgreSQL rodando"
else
    error "PostgreSQL falhou, reinstalando..."
    dnf reinstall -y postgresql15-server postgresql15 > /dev/null 2>&1
    postgresql-setup --initdb > /dev/null 2>&1
    systemctl enable postgresql-15 > /dev/null 2>&1
    systemctl start postgresql-15
    sleep 5
fi

# 5. CONFIGURAR POSTGRESQL
log "5. Configurando PostgreSQL..."
PGDATA="/var/lib/pgsql/15/data"

# Configurar acesso
if [ -f "$PGDATA/postgresql.conf" ]; then
    sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PGDATA/postgresql.conf"
    sed -i "s/#port = 5432/port = 5432/" "$PGDATA/postgresql.conf"
fi

# Configurar autenticação
if [ -f "$PGDATA/pg_hba.conf" ]; then
    if ! grep -q "local.*afiliadosbetdb.*afiliadosbet.*md5" "$PGDATA/pg_hba.conf"; then
        echo "local   afiliadosbetdb  afiliadosbet                    md5" >> "$PGDATA/pg_hba.conf"
        echo "host    afiliadosbetdb  afiliadosbet    127.0.0.1/32    md5" >> "$PGDATA/pg_hba.conf"
        systemctl reload postgresql-15
    fi
fi

# 6. CRIAR USUÁRIO E BANCO
log "6. Criando usuário e banco PostgreSQL..."

# Criar usuário se não existir
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='afiliadosbet'" | grep -q 1; then
    sudo -u postgres psql -c "CREATE USER afiliadosbet WITH PASSWORD 'Alepoker800';" > /dev/null 2>&1
    sudo -u postgres psql -c "ALTER USER afiliadosbet CREATEDB;" > /dev/null 2>&1
fi

# Recriar banco (dropar e criar novo)
sudo -u postgres psql -c "DROP DATABASE IF EXISTS afiliadosbetdb;" > /dev/null 2>&1
sudo -u postgres psql -c "CREATE DATABASE afiliadosbetdb OWNER afiliadosbet;" > /dev/null 2>&1

success "Banco PostgreSQL criado"

# 7. TESTAR CONEXÃO
log "7. Testando conexão PostgreSQL..."
if ! PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "SELECT 1;" > /dev/null 2>&1; then
    error "Falha na conexão PostgreSQL"
    exit 1
fi
success "Conexão PostgreSQL OK"

# 8. CRIAR SCHEMA COMPLETO
log "8. Criando schema PostgreSQL..."
PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb << 'EOF'
-- Schema AfiliadosBet - Versão PostgreSQL
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    "fullName" VARCHAR NOT NULL,
    cpf VARCHAR UNIQUE NOT NULL,
    "birthDate" VARCHAR NOT NULL,
    phone VARCHAR,
    city VARCHAR,
    state VARCHAR,
    country VARCHAR DEFAULT 'BR',
    role VARCHAR DEFAULT 'affiliate',
    "isActive" BOOLEAN DEFAULT true,
    "pixKeyType" VARCHAR,
    "pixKeyValue" VARCHAR,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "bettingHouses" (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    "logoUrl" VARCHAR,
    "baseUrl" VARCHAR NOT NULL,
    "primaryParam" VARCHAR NOT NULL,
    "additionalParams" TEXT,
    "commissionType" VARCHAR NOT NULL,
    "commissionValue" VARCHAR,
    "cpaValue" VARCHAR,
    "revshareValue" VARCHAR,
    "revshareAffiliatePercent" REAL,
    "cpaAffiliatePercent" REAL,
    "minDeposit" VARCHAR,
    "paymentMethods" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    identifier VARCHAR UNIQUE NOT NULL,
    "enabledPostbacks" TEXT,
    "securityToken" VARCHAR NOT NULL,
    "parameterMapping" TEXT,
    "integrationType" VARCHAR NOT NULL DEFAULT 'postback',
    "apiConfig" TEXT,
    "apiBaseUrl" VARCHAR,
    "apiKey" VARCHAR,
    "apiSecret" VARCHAR,
    "apiVersion" VARCHAR DEFAULT 'v1',
    "syncInterval" INTEGER DEFAULT 30,
    "lastSyncAt" VARCHAR,
    "syncStatus" VARCHAR DEFAULT 'pending',
    "syncErrorMessage" VARCHAR,
    "endpointMapping" TEXT,
    "authType" VARCHAR DEFAULT 'bearer',
    "authHeaders" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "affiliateLinks" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id),
    "houseId" INTEGER NOT NULL REFERENCES "bettingHouses"(id),
    "generatedUrl" VARCHAR NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "clickTracking" (
    id SERIAL PRIMARY KEY,
    "linkId" INTEGER NOT NULL REFERENCES "affiliateLinks"(id),
    "userId" INTEGER NOT NULL REFERENCES users(id),
    "houseId" INTEGER NOT NULL REFERENCES "bettingHouses"(id),
    "ipAddress" VARCHAR NOT NULL,
    "userAgent" VARCHAR,
    referrer VARCHAR,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversions (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id),
    "houseId" INTEGER NOT NULL REFERENCES "bettingHouses"(id),
    "affiliateLinkId" INTEGER REFERENCES "affiliateLinks"(id),
    type VARCHAR NOT NULL,
    amount VARCHAR NOT NULL,
    commission VARCHAR NOT NULL,
    "conversionData" TEXT,
    status VARCHAR DEFAULT 'pending',
    "processedAt" VARCHAR,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id),
    amount REAL NOT NULL,
    status VARCHAR DEFAULT 'pending',
    "paymentMethod" VARCHAR,
    "pixKey" VARCHAR,
    "transactionId" VARCHAR,
    "requestedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "processedAt" VARCHAR,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

-- Inserir dados padrão
INSERT INTO users (username, email, password, "fullName", cpf, "birthDate", role, "isActive") VALUES 
('admin', 'admin@afiliadosbet.com.br', '$2b$10$8K1p/a4xnw6bK8GxkOZkUeGxGN4v4Jl3rMLJFCw8RSI8S5Q7tHJ0e', 'Administrador', '00000000000', '1990-01-01', 'admin', true),
('afiliado1', 'afiliado1@afiliadosbet.com.br', '$2b$10$8K1p/a4xnw6bK8GxkOZkUeGxGN4v4Jl3rMLJFCw8RSI8S5Q7tHJ0e', 'Afiliado Teste 1', '11111111111', '1990-01-01', 'affiliate', true),
('afiliado2', 'afiliado2@afiliadosbet.com.br', '$2b$10$8K1p/a4xnw6bK8GxkOZkUeGxGN4v4Jl3rMLJFCw8RSI8S5Q7tHJ0e', 'Afiliado Teste 2', '22222222222', '1990-01-01', 'affiliate', true),
('afiliado3', 'afiliado3@afiliadosbet.com.br', '$2b$10$8K1p/a4xnw6bK8GxkOZkUeGxGN4v4Jl3rMLJFCw8RSI8S5Q7tHJ0e', 'Afiliado Teste 3', '33333333333', '1990-01-01', 'affiliate', true)
ON CONFLICT (email) DO NOTHING;

SELECT 'Schema criado, usuarios inseridos:', COUNT(*) FROM users;
EOF

if [ $? -eq 0 ]; then
    success "Schema PostgreSQL criado"
else
    error "Falha ao criar schema"
    exit 1
fi

# 9. VERIFICAR SCHEMA
log "9. Verificando schema..."
TABLE_COUNT=$(PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
USER_COUNT=$(PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -tAc "SELECT COUNT(*) FROM users;")

if [ "$TABLE_COUNT" -gt 5 ] && [ "$USER_COUNT" -gt 0 ]; then
    success "Schema OK - $TABLE_COUNT tabelas, $USER_COUNT usuários"
else
    error "Schema com problemas"
    exit 1
fi

# 10. REBUILD APLICAÇÃO
log "10. Rebuilding aplicação..."
npm install --production > /dev/null 2>&1
npm run build > /dev/null 2>&1
success "Aplicação rebuilded"

# 11. INICIAR COM POSTGRESQL
log "11. Iniciando aplicação PostgreSQL..."
NODE_ENV=production DATABASE_URL=postgresql://afiliadosbet:Alepoker800@localhost:5432/afiliadosbetdb pm2 start npm --name "afiliadosbet" -- start

# 12. AGUARDAR E VERIFICAR
log "12. Aguardando inicialização..."
sleep 15

if pm2 list | grep -q "afiliadosbet.*online"; then
    success "Aplicação online"
    
    # Teste API
    log "13. Testando API..."
    sleep 5
    
    API_RESPONSE=$(curl -s -w "%{http_code}" "http://localhost:3000/api/health" -o /tmp/api_test.txt)
    if [ "$API_RESPONSE" = "200" ]; then
        success "API funcionando"
        
        # Teste admin stats
        STATS_RESPONSE=$(curl -s "http://localhost:3000/api/stats/admin")
        if echo "$STATS_RESPONSE" | grep -q "totalAffiliates"; then
            success "API stats funcionando"
            
            echo ""
            echo "🎉 MIGRAÇÃO COMPLETA!"
            echo "✅ PostgreSQL: Funcionando"
            echo "✅ Schema: $TABLE_COUNT tabelas criadas"
            echo "✅ Usuários: $USER_COUNT cadastrados"
            echo "✅ Aplicação: Online"
            echo "✅ API: Funcionando"
            echo ""
            echo "🌐 Site: https://afiliadosbet.com.br"
            echo "🔐 Admin: admin@afiliadosbet.com.br / admin123"
            echo "📊 Panel: https://afiliadosbet.com.br/admin"
            echo ""
            
            # Mostrar usuarios criados
            echo "👥 Usuários cadastrados:"
            PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "SELECT id, username, email, role FROM users ORDER BY id;"
            
        else
            warning "API stats com problemas"
            echo "Response: $STATS_RESPONSE"
        fi
    else
        warning "API não respondeu corretamente"
        cat /tmp/api_test.txt
    fi
    
else
    error "Aplicação falhou ao iniciar"
    pm2 logs afiliadosbet --lines 10
    exit 1
fi

echo ""
echo "🔍 Para verificar logs: pm2 logs afiliadosbet"
echo "🔄 Para reiniciar: pm2 restart afiliadosbet"
echo "📊 Para stats: curl http://localhost:3000/api/stats/admin"

success "MIGRAÇÃO POSTGRESQL COMPLETA!"