#!/bin/bash

# 🔧 Correção de sessão em produção
echo "🔧 Corrigindo sessões PostgreSQL..."

# 1. Parar aplicação
pm2 stop afiliadosbet 2>/dev/null

# 2. Verificar/criar tabela sessions
PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb << 'EOF'
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

-- Limpar sessões antigas
DELETE FROM sessions WHERE expire < NOW();

SELECT 'Tabela sessions configurada' as status;
EOF

# 3. Atualizar .env com configurações de sessão
cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://afiliadosbet:Alepoker800@localhost:5432/afiliadosbetdb
SESSION_SECRET=afiliadosbet_super_secret_production_2025
PORT=3000
HOST=0.0.0.0
POSTGRES_SESSION_STORE=true
EOF

# 4. Reiniciar aplicação
pm2 start ecosystem.config.js --env production

echo "✅ Sessões PostgreSQL configuradas"
echo "🔍 Teste: curl http://localhost:3000/api/health"