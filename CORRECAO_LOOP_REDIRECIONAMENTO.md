# 🔧 CORREÇÃO ESPECÍFICA - LOOP DE REDIRECIONAMENTO

## PROBLEMA IDENTIFICADO NOS LOGS
```
✅ Login successful for: admin@afiliadosbet.com.br Role: admin
🔑 Session ID: 9IqKePKXsxGtiYVR6nX61o3OatVcdTo0

🔍 Checking auth - Session ID: ygykQrgh9KB5qf5cCnPQ0sYS8MW5DIys  <- DIFERENTE!
🔍 Authenticated: false
```

**CAUSA**: Cookie de sessão não está sendo persistido. Cada requisição gera novo Session ID.

## CORREÇÕES APLICADAS

### 1. Configuração de Cookie Corrigida
- **REMOVIDO**: `secure: true` (VPS sem HTTPS adequado)
- **ADICIONADO**: `name: 'afiliadosbet.sid'` (nome customizado)
- **MANTIDO**: `sameSite: 'lax'` para compatibilidade

### 2. Salvamento Forçado de Sessão
- **ADICIONADO**: `req.session.save()` após login
- **VERIFICAÇÃO**: Log "💾 Session saved successfully"

## APLICAR CORREÇÃO NO VPS

### 1. Atualizar arquivos
```bash
git pull origin main
```

### 2. Script de correção rápida
```bash
./fix-session-production.sh
```

### 3. OU aplicação manual
```bash
# Parar aplicação
pm2 stop afiliadosbet
pm2 delete afiliadosbet

# Verificar se PostgreSQL está funcionando
psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "SELECT 1;"

# Se falhar, configurar PostgreSQL
systemctl restart postgresql-15
sudo -u postgres psql -c "ALTER USER afiliadosbet PASSWORD 'Alepoker800';"

# Limpar sessões antigas
psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "
DROP TABLE IF EXISTS sessions;
CREATE TABLE sessions (
  sid varchar PRIMARY KEY,
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);"

# Build e iniciar
npm run build
NODE_ENV=production pm2 start npm --name "afiliadosbet" -- start
```

## LOGS ESPERADOS APÓS CORREÇÃO

### No login:
```
✅ Login successful for: admin@afiliadosbet.com.br Role: admin
🔑 Session ID: ABC123...
💾 Session saved successfully
```

### Na verificação de auth:
```
🔍 Checking auth - Session ID: ABC123...  <- MESMO ID!
🔍 Authenticated: true
🔍 User in session: YES
✅ User is authenticated: admin@afiliadosbet.com.br
```

## TESTE NO NAVEGADOR

### 1. DevTools (F12) → Application → Cookies
- Deve aparecer: `afiliadosbet.sid` 
- Valor deve persistir entre requisições

### 2. DevTools (F12) → Console
```
🔐 Tentando login...
✅ Login successful
🎉 Login onSuccess
🔄 Redirecionando para: /admin
🚀 Executando redirecionamento...
```

### 3. Verificação manual
```bash
# Terminal 1: Logs em tempo real
pm2 logs afiliadosbet | grep -E "(Session ID|authenticated|Login successful)"

# Terminal 2: Teste API
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@afiliadosbet.com.br","password":"admin123"}'

# Verificar se cookie foi salvo
cat cookies.txt

# Teste auth com mesmo cookie
curl -b cookies.txt http://localhost:3000/api/auth/me
```

## SE AINDA FALHAR

### Verificação avançada:
```bash
# 1. Ver sessões no PostgreSQL
psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "
SELECT sid, 
       (sess->>'passport'->'user')::int as user_id,
       expire 
FROM sessions 
ORDER BY expire DESC 
LIMIT 5;"

# 2. Verificar conectividade PostgreSQL
ping localhost
telnet localhost 5432

# 3. Debug completo de sessão
NODE_ENV=production DEBUG=express-session,connect:* pm2 start npm --name "afiliadosbet" -- start
```

### Reset extremo:
```bash
# Backup
cp -r /var/www/afiliadosbet /var/www/backup-emergency

# Fresh start
cd /var/www
rm -rf afiliadosbet
git clone https://github.com/eaidavid/AfiliadosBet.git afiliadosbet
cd afiliadosbet

# Configurar do zero
npm install
npm run build

cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://afiliadosbet:Alepoker800@localhost:5432/afiliadosbetdb
SESSION_SECRET=afiliadosbet_super_secret_$(date +%s)
PORT=3000
HOST=0.0.0.0
EOF

NODE_ENV=production pm2 start npm --name "afiliadosbet" -- start
```