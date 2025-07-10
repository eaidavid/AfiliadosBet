# 🚨 CORREÇÃO URGENTE - PROBLEMA DE LOGIN EM PRODUÇÃO

## Execute estes comandos no seu servidor VPS:

### 1. Conectar ao servidor
```bash
ssh root@seu-servidor
cd /var/www/afiliadosbet
```

### 2. Fazer download do script de correção
```bash
curl -O https://raw.githubusercontent.com/seu-usuario/afiliadosbet/main/fix-postgresql-production.sh
chmod +x fix-postgresql-production.sh
```

### 3. Executar a correção
```bash
./fix-postgresql-production.sh
```

## Ou use o script que já está no projeto:
```bash
# Se você já tem o repositório atualizado
./fix-postgresql-production.sh
```

## OU execute manualmente:

### 1. Parar a aplicação
```bash
pm2 stop afiliadosbet
```

### 2. Fazer backup
```bash
cp server/index.ts server/index.ts.backup
```

### 3. Editar o arquivo
```bash
vim server/index.ts
```

### 4. Encontrar as linhas 12-33 que têm:
```typescript
// Session configuration with PostgreSQL store in production
import connectPgSimple from 'connect-pg-simple';
```

### 5. Substituir por (configuração PostgreSQL correta):
```typescript
// Session configuration with PostgreSQL store in production
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';

const PgSession = connectPgSimple(session);

// Create PostgreSQL pool for sessions
const sessionPool = process.env.NODE_ENV === 'production' && process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: false // Set to true if using SSL
    })
  : null;

app.use(session({
  store: sessionPool 
    ? new PgSession({
        pool: sessionPool,
        tableName: 'sessions',
        createTableIfMissing: true
      })
    : undefined, // Use memory store in development
  secret: process.env.SESSION_SECRET || "fallback-secret-for-dev-only-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));
```

### 6. Fazer rebuild
```bash
npm run build
```

### 7. Reiniciar
```bash
pm2 restart afiliadosbet
```

### 8. Verificar
```bash
pm2 logs afiliadosbet
```

## 🎯 Resultado esperado:
- Não deve mais aparecer o erro "SASL: SCRAM-SERVER-FIRST-MESSAGE"
- Login deve funcionar normalmente
- Logs devem mostrar "Server listening on port 3000"

## 📞 Se der problema:
- Restaurar backup: `cp server/index.ts.backup server/index.ts`
- Fazer rebuild: `npm run build`
- Reiniciar: `pm2 restart afiliadosbet`