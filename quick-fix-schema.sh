#!/bin/bash

echo "🔧 Correção rápida do schema PostgreSQL..."

# Parar aplicação
pm2 stop afiliadosbet 2>/dev/null

# Criar schema completo
PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb << 'EOF'
-- Dropar e recriar schema completo
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS conversions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS "clickTracking" CASCADE;
DROP TABLE IF EXISTS "affiliateLinks" CASCADE;
DROP TABLE IF EXISTS "bettingHouses" CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Criar tabelas
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

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

-- Inserir usuários padrão
INSERT INTO users (username, email, password, "fullName", cpf, "birthDate", role, "isActive")
VALUES 
('admin', 'admin@afiliadosbet.com.br', '$2b$10$8K1p/a4xnw6bK8GxkOZkUeGxGN4v4Jl3rMLJFCw8RSI8S5Q7tHJ0e', 'Administrador', '00000000000', '1990-01-01', 'admin', true),
('afiliado', 'afiliado@afiliadosbet.com.br', '$2b$10$8K1p/a4xnw6bK8GxkOZkUeGxGN4v4Jl3rMLJFCw8RSI8S5Q7tHJ0e', 'Afiliado Teste', '11111111111', '1990-01-01', 'affiliate', true)
ON CONFLICT (email) DO NOTHING;

SELECT 'Schema criado com sucesso!' as status;
\dt
EOF

echo "✅ Schema PostgreSQL criado"

# Reiniciar aplicação
NODE_ENV=production pm2 start npm --name "afiliadosbet" -- start

echo "🎉 Aplicação reiniciada com PostgreSQL!"
echo "Aguarde 10 segundos e teste: https://afiliadosbet.com.br/admin"