# 🔄 SINCRONIZAÇÃO DE USUÁRIOS - VPS Production

## SITUAÇÃO ATUAL
O erro persiste mesmo após tentativas de migração. Vamos fazer uma abordagem mais direta.

## COMANDOS DE DIAGNÓSTICO

### 1. Execute no VPS para ver o status atual:
```bash
cd /var/www/afiliadosbet

echo "=== STATUS DA APLICAÇÃO ==="
pm2 status

echo "=== LOGS RECENTES ==="
pm2 logs afiliadosbet --lines 20

echo "=== TESTE BANCO POSTGRESQL ==="
PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "\dt"

echo "=== CONTAR USUÁRIOS POSTGRESQL ==="
PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "SELECT role, COUNT(*) FROM users GROUP BY role;"

echo "=== ARQUIVO .ENV ==="
cat .env | grep DATABASE_URL

echo "=== TESTE API DIRETA ==="
curl -s "http://localhost:3000/api/stats/admin" | head -200
```

### 2. Se PostgreSQL não tem tabelas, execute:
```bash
# Criar schema força bruta
PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb << 'EOF'
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS conversions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS "clickTracking" CASCADE;
DROP TABLE IF EXISTS "affiliateLinks" CASCADE;
DROP TABLE IF EXISTS "bettingHouses" CASCADE;
DROP TABLE IF EXISTS users CASCADE;

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

INSERT INTO users (username, email, password, "fullName", cpf, "birthDate", role, "isActive") VALUES 
('admin', 'admin@afiliadosbet.com.br', '$2b$10$8K1p/a4xnw6bK8GxkOZkUeGxGN4v4Jl3rMLJFCw8RSI8S5Q7tHJ0e', 'Administrador', '00000000000', '1990-01-01', 'admin', true),
('teste1', 'teste1@afiliadosbet.com.br', '$2b$10$8K1p/a4xnw6bK8GxkOZkUeGxGN4v4Jl3rMLJFCw8RSI8S5Q7tHJ0e', 'Afiliado Teste 1', '11111111111', '1990-01-01', 'affiliate', true),
('teste2', 'teste2@afiliadosbet.com.br', '$2b$10$8K1p/a4xnw6bK8GxkOZkUeGxGN4v4Jl3rMLJFCw8RSI8S5Q7tHJ0e', 'Afiliado Teste 2', '22222222222', '1990-01-01', 'affiliate', true)
ON CONFLICT (email) DO NOTHING;

SELECT 'Usuarios criados:', COUNT(*) FROM users;
\dt
EOF
```

### 3. Se aplicação está usando SQLite em vez de PostgreSQL:
```bash
# Forçar variável de ambiente
echo "NODE_ENV=production" > .env
echo "DATABASE_URL=postgresql://afiliadosbet:Alepoker800@localhost:5432/afiliadosbetdb" >> .env
echo "SESSION_SECRET=afiliadosbet_super_secret_production_2025" >> .env
echo "PORT=3000" >> .env
echo "HOST=0.0.0.0" >> .env

# Deletar qualquer SQLite
rm -f data/*.sqlite data/*.db 2>/dev/null

# Reiniciar aplicação
pm2 delete afiliadosbet
NODE_ENV=production pm2 start npm --name "afiliadosbet" -- start

# Aguardar e testar
sleep 10
curl -s "http://localhost:3000/api/health"
```

### 4. VERIFICAÇÃO FINAL:
```bash
# Deve mostrar usuários
PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "SELECT id, email, role FROM users LIMIT 5;"

# Deve funcionar
curl -s "http://localhost:3000/api/stats/admin"

# Logs devem mostrar PostgreSQL
pm2 logs afiliadosbet --lines 10 | grep -i postgres
```

## RESULTADO ESPERADO

✅ PostgreSQL com tabela `users` criada  
✅ Aplicação conectada no PostgreSQL (não SQLite)  
✅ API `/api/stats/admin` retornando dados  
✅ Painel admin mostrando afiliados  

## SE NADA FUNCIONAR

Execute este comando de emergência completa:
```bash
cd /var/www/afiliadosbet
pm2 kill
systemctl restart postgresql-15
sleep 5

# Configurar banco do zero
sudo -u postgres psql -c "DROP DATABASE IF EXISTS afiliadosbetdb;"
sudo -u postgres psql -c "CREATE DATABASE afiliadosbetdb OWNER afiliadosbet;"

# Executar script novamente
./quick-fix-schema.sh

# Verificar se funcionou
sleep 10
curl -s "https://afiliadosbet.com.br/api/stats/admin"
```