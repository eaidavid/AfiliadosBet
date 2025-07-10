# 🔄 CORREÇÃO COMPLETA - Loop de Usuários Não Aparecendo

## PROBLEMA IDENTIFICADO
- ✅ **Produção**: PostgreSQL tem usuários mas API não lista
- ✅ **Desenvolvimento**: SQLite com schema desatualizado  
- ✅ **Sincronização**: Bancos diferentes entre ambientes

## SOLUÇÕES APLICADAS

### 1. Banco de Desenvolvimento Corrigido
```bash
# Recriar banco SQLite com schema atualizado
rm -f data/database.sqlite  
npm run dev  # Recria automaticamente
```

### 2. Produção PostgreSQL - Execute no VPS:
```bash
cd /var/www/afiliadosbet

# 1. Atualizar código
git pull origin main

# 2. Corrigir PostgreSQL (se necessário)
./fix-postgresql-production.sh

# 3. OU script de debug de usuários  
./debug-users-production.sh

# 4. Reiniciar aplicação
pm2 restart afiliadosbet
```

## VERIFICAÇÃO FINAL

### No VPS - Teste direto no banco:
```bash
# Ver usuários PostgreSQL
PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "
SELECT id, username, email, role, \"createdAt\" 
FROM users 
WHERE role = 'affiliate' 
ORDER BY \"createdAt\" DESC 
LIMIT 5;
"

# Testar API diretamente  
curl -s "http://localhost:3000/api/admin/affiliates" | head -200
```

### No Painel Admin:
1. **Login**: https://afiliadosbet.com.br/auth
2. **Ir para**: Administração de Afiliados  
3. **Verificar**: Lista deve mostrar usuários cadastrados
4. **Contadores**: Devem refletir números reais

## SE AINDA NÃO FUNCIONAR

### Debug avançado no VPS:
```bash
# 1. Ver logs da aplicação
pm2 logs afiliadosbet | grep -E "(affiliates|users|error)"

# 2. Testar rota com auth manual
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"admin@afiliadosbet.com.br","password":"admin123"}'

# 3. Verificar tabelas PostgreSQL
PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "\dt"

# 4. Contar usuários diretamente
PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "
SELECT role, COUNT(*) as total FROM users GROUP BY role;
"
```

### Sincronização desenvolvimento → produção:
```bash
# No VPS - importar usuários de teste se necessário
PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "
INSERT INTO users (username, email, password, \"fullName\", cpf, \"birthDate\", role, \"isActive\")
VALUES 
('teste1', 'teste1@example.com', '\$2b\$10\$hashedpassword', 'Usuario Teste 1', '12345678901', '1990-01-01', 'affiliate', true),
('teste2', 'teste2@example.com', '\$2b\$10\$hashedpassword', 'Usuario Teste 2', '12345678902', '1990-01-01', 'affiliate', true)
ON CONFLICT (email) DO NOTHING;
"
```

## CAUSA RAIZ DO PROBLEMA

1. **Desenvolvimento SQLite** e **Produção PostgreSQL** usam bancos diferentes
2. **Schema SQLite** estava desatualizado (sem coluna 'type' em conversions)  
3. **Queries SQL** tinham problemas de compatibilidade entre bancos
4. **Session management** tinha problemas de persistência

## CORREÇÕES PERMANENTES

- ✅ Schema unificado entre desenvolvimento e produção
- ✅ Queries SQL compatíveis com ambos os bancos  
- ✅ Session management corrigido para produção
- ✅ Scripts de debug e correção automatizados
- ✅ Guias de troubleshooting completos

**Status**: Desenvolvimento funcionando ✅ | Produção necessita aplicar correções