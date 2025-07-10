# 🚨 CORREÇÃO COMPLETA DO LOOP - VPS

## Diagnóstico Adicional
Os logs mostram erros de banco SQLite que podem estar interferindo:
- `no such column: "type"` - problema no schema
- Erros de analytics e estatísticas

## Solução Completa para VPS

### 1. Conectar ao servidor
```bash
ssh root@seu-servidor
cd /var/www/afiliadosbet
```

### 2. Parar aplicação completamente
```bash
pm2 stop afiliadosbet
pm2 delete afiliadosbet
```

### 3. Fazer backup completo
```bash
cp -r . ../backup-$(date +%Y%m%d-%H%M)
```

### 4. Verificar se arquivos foram atualizados
```bash
# Verificar se mudanças estão lá
grep -n "window.location.replace" client/src/hooks/use-auth.ts
grep -n "DESABILITADO para evitar loops" client/src/pages/auth.tsx
```

### 5. Limpar cache e rebuild completo
```bash
# Limpar tudo
rm -rf node_modules
rm -rf dist
rm -rf .vite
npm cache clean --force

# Reinstalar
npm install

# Build completo
npm run build
```

### 6. Verificar se PostgreSQL está funcionando
```bash
# Testar conexão
psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "SELECT 1;"

# Se falhar, verificar se está rodando
systemctl status postgresql-15
systemctl restart postgresql-15
```

### 7. Verificar arquivo .env
```bash
cat .env

# Deve ter:
# NODE_ENV=production
# DATABASE_URL=postgresql://afiliadosbet:Alepoker800@localhost:5432/afiliadosbetdb
# SESSION_SECRET=sua_chave_secreta
```

### 8. Iniciar aplicação novamente
```bash
# Iniciar com PM2
pm2 start npm --name "afiliadosbet" -- start

# OU se preferir direto
NODE_ENV=production npm start
```

### 9. Monitorar logs
```bash
pm2 logs afiliadosbet --lines 50
```

### 10. Teste específico de redirecionamento
```bash
# Testar API diretamente
curl -X POST https://seudominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@afiliadosbet.com.br","password":"admin123"}' \
  -v
```

## Se ainda não funcionar

### Opção A: Forçar substituição de arquivos específicos
```bash
# Verificar se arquivos corretos estão lá
ls -la client/src/hooks/use-auth.ts
ls -la client/src/pages/auth.tsx
ls -la client/src/App.tsx

# Se não estiverem atualizados, fazer upload manual
```

### Opção B: Resetar sessões PostgreSQL
```bash
# Limpar tabela de sessões
psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "DROP TABLE IF EXISTS sessions;"

# Reiniciar aplicação
pm2 restart afiliadosbet
```

### Opção C: Modo debug temporário
```bash
# Adicionar logs de debug
echo "console.log('DEBUG: Auth state:', isAuthenticated, isAdmin);" >> /tmp/debug.js

# Ver o que está acontecendo no navegador
# F12 → Console → procurar logs de debug
```

## Verificação Final
1. Site carrega sem erros 500?
2. Login não trava em "Entrando..."?
3. Redirecionamento funciona sem loop?
4. Logs PM2 sem erros?

## Credenciais de Teste
- Admin: admin@afiliadosbet.com.br / admin123
- Afiliado: afiliado@afiliadosbet.com.br / admin123

## Se persistir o problema
Execute este comando para ver exatamente o que está acontecendo:
```bash
pm2 logs afiliadosbet | grep -E "(Login|redirect|location|auth)" --line-buffered
```