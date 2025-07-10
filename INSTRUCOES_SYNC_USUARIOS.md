# 🔄 SINCRONIZAÇÃO DE USUÁRIOS - ADMIN PAINEL

## PROBLEMA IDENTIFICADO
- Usuários se cadastram no site mas não aparecem no painel admin
- Erro na rota `/api/admin/affiliates` impedindo listagem
- Query SQL com problema de tipo de conversão ('click' vs 'register')

## CORREÇÕES APLICADAS

### 1. Correção na consulta SQL
- **PROBLEMA**: `conversions.filter(c => c.type === 'click')` - conversões não têm tipo 'click'
- **SOLUÇÃO**: Usar tabela `clickTracking` para contabilizar cliques
- **CORREÇÃO**: Separar cliques de conversões nas estatísticas

### 2. Tipos de dados corretos
- **Cliques**: Tabela `clickTracking`
- **Registros**: `conversions` com `type = 'register'`
- **Depósitos**: `conversions` com `type = 'deposit'`

## APLICAR NO VPS

### 1. Atualizar código
```bash
cd /var/www/afiliadosbet
git pull origin main
```

### 2. Testar rota corrigida
```bash
# Testar se rota funciona
curl -H "Cookie: afiliadosbet.sid=COOKIE_VALUE" http://localhost:3000/api/admin/affiliates
```

### 3. Se ainda não funcionar, reiniciar
```bash
pm2 restart afiliadosbet
```

## TESTE NO PAINEL ADMIN

### 1. Fazer login como admin
- URL: https://afiliadosbet.com.br/auth
- Login: admin@afiliadosbet.com.br
- Senha: admin123

### 2. Ir para seção de gerenciamento
- Navegar para página de afiliados
- Verificar se lista aparece corretamente
- Confirmar contagem de usuários cadastrados

### 3. Logs esperados no servidor
```
🔍 Listando afiliados com filtros: {...}
✅ Encontrados X afiliados
```

## VERIFICAR NOVOS CADASTROS

### 1. Cadastrar teste
- Ir para https://afiliadosbet.com.br/register
- Criar nova conta de teste
- Verificar se aparece imediatamente no admin

### 2. Forçar refresh no admin
- F5 na página de gerenciamento
- Verificar se novo usuário aparece

## SE AINDA NÃO APARECER

### Debug avançado:
```bash
# Ver usuários no banco diretamente
echo "SELECT id, username, email, role, createdAt FROM users ORDER BY createdAt DESC LIMIT 10;" | sqlite3 data/database.sqlite

# Ver logs da aplicação
pm2 logs afiliadosbet | grep -E "(afiliados|usuario|register)"

# Verificar se tabelas existem
echo ".tables" | sqlite3 data/database.sqlite
```

### Verificar integração desenvolvimento x produção:
- Desenvolvimento usa SQLite (`data/database.sqlite`)
- Produção usa PostgreSQL
- Dados podem não estar sincronizados entre ambientes