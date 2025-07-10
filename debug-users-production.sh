#!/bin/bash

# 🔍 Debug de Usuários em Produção
echo "🔍 Verificando usuários cadastrados..."

# 1. Verificar usuários no banco PostgreSQL
echo "1. Usuários no PostgreSQL:"
PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "
SELECT 
    id, 
    username, 
    email, 
    \"fullName\" as full_name, 
    role, 
    \"isActive\" as is_active, 
    \"createdAt\" as created_at 
FROM users 
WHERE role = 'affiliate' 
ORDER BY \"createdAt\" DESC 
LIMIT 10;
"

# 2. Contar total de usuários
echo ""
echo "2. Total de usuários por role:"
PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "
SELECT role, COUNT(*) as total 
FROM users 
GROUP BY role;
"

# 3. Verificar estrutura da tabela
echo ""
echo "3. Estrutura da tabela users:"
PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "
\d users
"

# 4. Testar API endpoint
echo ""
echo "4. Testando API /api/admin/affiliates:"
curl -s -X GET "http://localhost:3000/api/admin/affiliates" \
  -H "Content-Type: application/json" \
  -H "Cookie: afiliadosbet.sid=test-session" | head -100

# 5. Verificar logs da aplicação
echo ""
echo "5. Logs recentes da aplicação:"
pm2 logs afiliadosbet --lines 10 | grep -E "(afiliado|user|error)"

echo ""
echo "Debug completo!"