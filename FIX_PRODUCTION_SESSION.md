# 🔧 CORREÇÃO ESPECÍFICA PARA PRODUÇÃO

## Problema Identificado
- Loop infinito de redirecionamento no VPS
- Diferença entre desenvolvimento (SQLite) e produção (PostgreSQL)
- Sessão não sendo persistida corretamente

## Solução VPS Específica

### 1. Conectar ao servidor
```bash
ssh root@69.62.65.24
cd /var/www/afiliadosbet
```

### 2. Verificar ambiente atual
```bash
# Ver qual NODE_ENV está ativo
echo $NODE_ENV
cat .env | grep NODE_ENV

# Ver se PostgreSQL está funcionando
systemctl status postgresql-15
```

### 3. Parar aplicação
```bash
pm2 stop afiliadosbet
pm2 delete afiliadosbet
```

### 4. Forçar rebuild completo
```bash
# Limpar tudo
rm -rf node_modules dist .vite
npm cache clean --force

# Reinstalar
npm install

# Build novo
npm run build
```

### 5. Verificar configuração de sessão
```bash
# Criar ou verificar .env
cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://afiliadosbet:Alepoker800@localhost:5432/afiliadosbetdb
SESSION_SECRET=afiliadosbet_super_secret_key_2025
PORT=3000
HOST=0.0.0.0
EOF
```

### 6. Testar banco PostgreSQL
```bash
# Testar conexão
psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'sessions';
"

# Se tabela sessions não existir, criar
psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "
CREATE TABLE IF NOT EXISTS sessions (
  sid varchar PRIMARY KEY,
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);
"
```

### 7. Limpar sessões antigas
```bash
psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "
DELETE FROM sessions WHERE expire < NOW();
"
```

### 8. Iniciar aplicação
```bash
NODE_ENV=production pm2 start npm --name "afiliadosbet" -- start
```

### 9. Monitorar logs específicos
```bash
# Ver logs de autenticação
pm2 logs afiliadosbet | grep -E "(Login|redirect|auth|session)" --line-buffered

# Ver logs gerais
pm2 logs afiliadosbet --lines 30
```

### 10. Teste direto da API
```bash
# Testar login via curl
curl -c cookies.txt -X POST https://afiliadosbet.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@afiliadosbet.com.br","password":"admin123"}' \
  -v

# Ver resposta
cat cookies.txt
```

## Se ainda persistir - Modo Debug

### Adicionar logs temporários no servidor
```bash
# Editar server/index.ts para adicionar logs
nano server/index.ts

# Adicionar na linha após configuração de sessão:
console.log('🔧 Ambiente:', process.env.NODE_ENV);
console.log('🔧 Database URL:', process.env.DATABASE_URL ? 'Configurado' : 'NÃO CONFIGURADO');
console.log('🔧 Session Secret:', process.env.SESSION_SECRET ? 'Configurado' : 'NÃO CONFIGURADO');
```

### Verificar se arquivos de correção estão aplicados
```bash
# Verificar se mudanças estão no código
grep -n "window.location.replace" client/src/hooks/use-auth.ts
grep -n "DESABILITADO para evitar loops" client/src/pages/auth.tsx
grep -n "Redirecionando para:" client/src/hooks/use-auth.ts
```

### Último recurso - Reset completo
```bash
# Backup
cp -r /var/www/afiliadosbet /var/www/backup-$(date +%H%M)

# Re-clone do repositório
cd /var/www
rm -rf afiliadosbet
git clone https://github.com/seuusuario/afiliadosbet.git
cd afiliadosbet

# Configurar
npm install
npm run build

# Configurar .env
cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://afiliadosbet:Alepoker800@localhost:5432/afiliadosbetdb
SESSION_SECRET=afiliadosbet_super_secret_key_2025
PORT=3000
HOST=0.0.0.0
EOF

# Iniciar
NODE_ENV=production pm2 start npm --name "afiliadosbet" -- start
```

## Verificação Final
✅ pm2 logs sem erros de SQLite  
✅ Login redireciona sem loop  
✅ Sessão persiste no PostgreSQL  
✅ Site acessível via https://afiliadosbet.com.br