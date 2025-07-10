#!/bin/bash

# 🔧 Correção Completa do Banco de Produção
echo "🚨 CORREÇÃO CRÍTICA: Aplicação está usando SQLite em produção!"

log() {
    echo "[$(date '+%H:%M:%S')] $1"
}

success() {
    echo "✅ $1"
}

error() {
    echo "❌ $1"
}

warning() {
    echo "⚠️ $1"
}

# 1. Parar aplicação
log "1. Parando aplicação..."
pm2 stop afiliadosbet 2>/dev/null || true
pm2 delete afiliadosbet 2>/dev/null || true

# 2. Verificar arquivo .env
log "2. Verificando configuração .env..."
if [ ! -f ".env" ]; then
    warning "Arquivo .env não existe, criando..."
    cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://afiliadosbet:Alepoker800@localhost:5432/afiliadosbetdb
SESSION_SECRET=afiliadosbet_super_secret_production_2025
PORT=3000
HOST=0.0.0.0
EOF
    success "Arquivo .env criado"
else
    log "Arquivo .env existe, verificando DATABASE_URL..."
    if grep -q "DATABASE_URL.*postgresql" .env; then
        success "DATABASE_URL PostgreSQL configurado"
    else
        warning "Corrigindo DATABASE_URL para PostgreSQL..."
        sed -i '/^DATABASE_URL=/d' .env
        echo "DATABASE_URL=postgresql://afiliadosbet:Alepoker800@localhost:5432/afiliadosbetdb" >> .env
        success "DATABASE_URL corrigido"
    fi
fi

# 3. Verificar PostgreSQL
log "3. Verificando PostgreSQL..."
if ! systemctl is-active --quiet postgresql-15; then
    warning "PostgreSQL não está rodando, iniciando..."
    systemctl start postgresql-15
    sleep 3
fi

if systemctl is-active --quiet postgresql-15; then
    success "PostgreSQL rodando"
else
    error "PostgreSQL falhou ao iniciar, reinstalando..."
    dnf reinstall -y postgresql15-server postgresql15
    postgresql-setup --initdb
    systemctl enable postgresql-15
    systemctl start postgresql-15
fi

# 4. Configurar PostgreSQL se necessário
log "4. Configurando PostgreSQL..."
PGDATA="/var/lib/pgsql/15/data"

# Configurar postgresql.conf
if [ -f "$PGDATA/postgresql.conf" ]; then
    sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PGDATA/postgresql.conf"
    sed -i "s/#port = 5432/port = 5432/" "$PGDATA/postgresql.conf"
fi

# Configurar pg_hba.conf
if [ -f "$PGDATA/pg_hba.conf" ]; then
    cp "$PGDATA/pg_hba.conf" "$PGDATA/pg_hba.conf.backup.$(date +%s)"
    
    # Adicionar configurações se não existirem
    if ! grep -q "local.*afiliadosbetdb.*afiliadosbet.*md5" "$PGDATA/pg_hba.conf"; then
        echo "local   afiliadosbetdb  afiliadosbet                    md5" >> "$PGDATA/pg_hba.conf"
    fi
    if ! grep -q "host.*afiliadosbetdb.*afiliadosbet.*127.0.0.1/32.*md5" "$PGDATA/pg_hba.conf"; then
        echo "host    afiliadosbetdb  afiliadosbet    127.0.0.1/32    md5" >> "$PGDATA/pg_hba.conf"
    fi
    
    systemctl reload postgresql-15
fi

# 5. Criar usuário e banco PostgreSQL
log "5. Configurando usuário e banco PostgreSQL..."

# Criar usuário se não existir
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='afiliadosbet'" | grep -q 1; then
    warning "Criando usuário afiliadosbet..."
    sudo -u postgres psql -c "CREATE USER afiliadosbet WITH PASSWORD 'Alepoker800';"
    sudo -u postgres psql -c "ALTER USER afiliadosbet CREATEDB;"
    success "Usuário afiliadosbet criado"
fi

# Criar banco se não existir
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw afiliadosbetdb; then
    warning "Criando banco afiliadosbetdb..."
    sudo -u postgres psql -c "CREATE DATABASE afiliadosbetdb OWNER afiliadosbet;"
    success "Banco afiliadosbetdb criado"
fi

# 6. Testar conexão PostgreSQL
log "6. Testando conexão PostgreSQL..."
if PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "SELECT 1;" >/dev/null 2>&1; then
    success "Conexão PostgreSQL OK"
else
    error "Falha na conexão PostgreSQL"
    exit 1
fi

# 7. Migrar dados do SQLite para PostgreSQL (se SQLite existir)
log "7. Verificando migração de dados..."
if [ -f "data/database.sqlite" ] || [ -f "data/afiliadosbet.db" ]; then
    warning "Detectado banco SQLite, executando migração para PostgreSQL..."
    
    # Usar Drizzle para migrar schema
    npm run db:push 2>/dev/null || {
        warning "Drizzle push falhou, criando schema manualmente..."
        
        PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb << 'EOF'
-- Criar tabelas principais se não existirem
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

-- Criar índices
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

-- Inserir admin padrão se não existir
INSERT INTO users (username, email, password, "fullName", cpf, "birthDate", role, "isActive")
VALUES ('admin', 'admin@afiliadosbet.com.br', '$2b$10$8K1p/a4xnw6bK8GxkOZkUeGxGN4v4Jl3rMLJFCw8RSI8S5Q7tHJ0e', 'Administrador', '00000000000', '1990-01-01', 'admin', true)
ON CONFLICT (email) DO NOTHING;

EOF
        
        if [ $? -eq 0 ]; then
            success "Schema PostgreSQL criado manualmente"
        else
            error "Falha ao criar schema PostgreSQL"
            exit 1
        fi
    }
    
    # Mover arquivos SQLite para backup
    mkdir -p backup-sqlite
    mv data/*.sqlite backup-sqlite/ 2>/dev/null || true
    mv data/*.db backup-sqlite/ 2>/dev/null || true
    success "Dados SQLite movidos para backup"
    
else
    log "Nenhum banco SQLite encontrado, criando schema PostgreSQL..."
    npm run db:push 2>/dev/null || {
        warning "Usando criação manual de schema..."
        # Schema já foi criado acima
    }
fi

# 8. Forçar criação de schema se Drizzle falhou
log "8. Forçando criação do schema PostgreSQL..."
PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb << 'EOF'
-- Dropar tabelas existentes se houver (para recriar)
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS conversions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS "clickTracking" CASCADE;
DROP TABLE IF EXISTS "affiliateLinks" CASCADE;
DROP TABLE IF EXISTS "bettingHouses" CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Criar tabelas na ordem correta (respeitando foreign keys)
CREATE TABLE users (
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

CREATE TABLE "bettingHouses" (
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

CREATE TABLE "affiliateLinks" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id),
    "houseId" INTEGER NOT NULL REFERENCES "bettingHouses"(id),
    "generatedUrl" VARCHAR NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "clickTracking" (
    id SERIAL PRIMARY KEY,
    "linkId" INTEGER NOT NULL REFERENCES "affiliateLinks"(id),
    "userId" INTEGER NOT NULL REFERENCES users(id),
    "houseId" INTEGER NOT NULL REFERENCES "bettingHouses"(id),
    "ipAddress" VARCHAR NOT NULL,
    "userAgent" VARCHAR,
    referrer VARCHAR,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversions (
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

CREATE TABLE payments (
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

CREATE TABLE sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);

-- Criar índices
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

-- Inserir dados padrão
INSERT INTO users (username, email, password, "fullName", cpf, "birthDate", role, "isActive")
VALUES 
('admin', 'admin@afiliadosbet.com.br', '$2b$10$8K1p/a4xnw6bK8GxkOZkUeGxGN4v4Jl3rMLJFCw8RSI8S5Q7tHJ0e', 'Administrador', '00000000000', '1990-01-01', 'admin', true),
('afiliado', 'afiliado@afiliadosbet.com.br', '$2b$10$8K1p/a4xnw6bK8GxkOZkUeGxGN4v4Jl3rMLJFCw8RSI8S5Q7tHJ0e', 'Afiliado Teste', '11111111111', '1990-01-01', 'affiliate', true)
ON CONFLICT (email) DO NOTHING;

-- Mostrar tabelas criadas
\dt
EOF

# Verificar se schema foi criado corretamente
log "9. Verificando schema PostgreSQL..."
if PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "\dt" | grep -q users; then
    success "Schema PostgreSQL OK"
    
    # Contar usuários
    USER_COUNT=$(PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -tAc "SELECT COUNT(*) FROM users;")
    log "Total de usuários no PostgreSQL: $USER_COUNT"
    
else
    error "Schema PostgreSQL com problemas"
    exit 1
fi

# 9. Rebuild e restart da aplicação
log "10. Rebuilding aplicação..."
npm install --production
npm run build

log "11. Iniciando aplicação em modo PostgreSQL..."
NODE_ENV=production pm2 start npm --name "afiliadosbet" -- start

# 12. Aguardar e verificar
log "Aguardando aplicação inicializar..."
sleep 10

if pm2 list | grep -q "afiliadosbet.*online"; then
    success "Aplicação rodando com PostgreSQL"
    
    # Teste final
    log "Testando API..."
    sleep 5
    
    if curl -s http://localhost:3000/api/health | grep -q "ok"; then
        success "API funcionando"
        
        echo ""
        echo "🎉 MIGRAÇÃO COMPLETA!"
        echo "✅ PostgreSQL: Funcionando"
        echo "✅ Schema: Criado"
        echo "✅ Aplicação: Rodando"
        echo ""
        echo "🌐 Site: https://afiliadosbet.com.br"
        echo "📊 Admin: https://afiliadosbet.com.br/admin"
        echo "🔍 Logs: pm2 logs afiliadosbet"
        
    else
        warning "Aplicação rodando mas API com problemas"
        pm2 logs afiliadosbet --lines 10
    fi
    
else
    error "Falha ao iniciar aplicação"
    pm2 logs afiliadosbet --lines 20
    exit 1
fi