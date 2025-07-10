# 🚨 CORREÇÃO URGENTE - PROBLEMA DE LOGIN EM PRODUÇÃO

## Execute estes comandos no seu servidor VPS:

### 1. Conectar ao servidor
```bash
ssh root@seu-servidor
cd /var/www/afiliadosbet
```

### 2. Fazer download do script de correção
```bash
curl -O https://raw.githubusercontent.com/seu-usuario/afiliadosbet/main/fix-session-production.sh
chmod +x fix-session-production.sh
```

### 3. Executar a correção
```bash
./fix-session-production.sh
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

### 5. Substituir por:
```typescript
// Session configuration with memory store (simpler for this project)
import MemoryStore from 'memorystore';
const memoryStore = MemoryStore(session);

app.use(session({
  store: new memoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
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