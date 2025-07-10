# 🔧 SOLUÇÃO COMPLETA - PROBLEMA DE LOGIN VPS

## SITUAÇÃO ATUAL
- Arquivos locais modificados bloqueando o git pull
- Script sem permissão de execução
- Loop de redirecionamento persistindo

## SOLUÇÃO PASSO A PASSO

### 1. Resolver conflito do Git
```bash
# Salvar mudanças locais
git stash

# Atualizar do repositório
git pull origin main

# Verificar se atualizou
git log --oneline -5
```

### 2. Dar permissão aos scripts
```bash
chmod +x fix-postgresql-production.sh
chmod +x fix-session-production.sh
```

### 3. Executar correção
```bash
./fix-session-production.sh
```

### 4. SE O SCRIPT FALHAR - Correção Manual
```bash
# Parar aplicação
pm2 stop afiliadosbet
pm2 delete afiliadosbet

# Verificar se correções estão aplicadas
grep -n "Você já está logado" client/src/App.tsx
grep -n "window.location.href = targetPath" client/src/hooks/use-auth.ts

# Se não aparecer, force update
git reset --hard origin/main
npm install

# Configurar ambiente
cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://afiliadosbet:Alepoker800@localhost:5432/afiliadosbetdb
SESSION_SECRET=afiliadosbet_super_secret_key_2025
PORT=3000
HOST=0.0.0.0
EOF

# Limpar sessões PostgreSQL
psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "DROP TABLE IF EXISTS sessions;"
psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "
CREATE TABLE sessions (
  sid varchar PRIMARY KEY,
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);
"

# Build e iniciar
npm run build
NODE_ENV=production pm2 start npm --name "afiliadosbet" -- start
```

### 5. Verificar funcionamento
```bash
# Ver logs
pm2 logs afiliadosbet --lines 20

# Testar API
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@afiliadosbet.com.br","password":"admin123"}'

# Ver resposta
curl -b cookies.txt http://localhost:3000/api/auth/me
```

## TESTE NO NAVEGADOR

### 1. Acesse: `https://afiliadosbet.com.br/auth`
### 2. Faça login com: `admin@afiliadosbet.com.br` / `admin123`
### 3. Aguarde 0.5 segundos
### 4. Deve redirecionar automaticamente para `/admin`

## SE AINDA NÃO FUNCIONAR

### Opção A: Reset completo
```bash
# Backup
cp -r /var/www/afiliadosbet /var/www/backup-$(date +%H%M)

# Fresh clone
cd /var/www
rm -rf afiliadosbet
git clone https://github.com/eaidavid/AfiliadosBet.git afiliadosbet
cd afiliadosbet

# Configurar
npm install
npm run build

# .env
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

### Opção B: Debug avançado
```bash
# Ver logs específicos de autenticação
pm2 logs afiliadosbet | grep -E "(Login|auth|session|redirect)" --line-buffered

# Ver status de sessões no PostgreSQL
psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "SELECT COUNT(*) FROM sessions;"

# Verificar variáveis de ambiente
pm2 show afiliadosbet
```

## ARQUIVOS ALTERADOS NA CORREÇÃO

### client/src/App.tsx - AuthenticatedAuth()
- REMOVIDO: redirecionamento automático useEffect
- ADICIONADO: mensagem "Você já está logado" com link manual

### client/src/hooks/use-auth.ts - useLogin()
- ALTERADO: setTimeout de 500ms antes do redirecionamento
- ALTERADO: window.location.href em vez de window.location.replace

### client/src/App.tsx - AuthenticatedAdminDashboard()
- ALTERADO: window.location.href="/auth" em vez de setLocation("/login")

## CREDENCIAIS DE TESTE
- **Admin**: admin@afiliadosbet.com.br / admin123
- **Afiliado**: afiliado@afiliadosbet.com.br / admin123

## COMANDOS DE EMERGÊNCIA
```bash
# Restaurar backup
cp -r /var/www/backup-HHMM/* /var/www/afiliadosbet/
pm2 restart afiliadosbet

# Ver todos os logs
pm2 logs afiliadosbet --lines 50

# Reiniciar PostgreSQL
systemctl restart postgresql-15
```