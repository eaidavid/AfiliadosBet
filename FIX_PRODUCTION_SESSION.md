# CORREÇÃO URGENTE - Erro de Sessão PostgreSQL em Produção

## Problema Identificado
O sistema está falhando no login em produção com erro:
```
SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string
```

## Causa Raiz
A configuração de sessão está tentando usar PostgreSQL em produção, mas:
1. As credenciais não estão sendo passadas corretamente
2. A configuração do pool PostgreSQL não está adequada para sessões

## Solução Imediata (Execute no servidor)

### 1. Parar a aplicação
```bash
pm2 stop afiliadosbet
```

### 2. Fazer backup do arquivo atual
```bash
cp /var/www/afiliadosbet/server/index.ts /var/www/afiliadosbet/server/index.ts.backup
```

### 3. Corrigir a configuração de sessão
```bash
# Editar o arquivo server/index.ts
vim /var/www/afiliadosbet/server/index.ts
```

### 4. Substituir a seção de sessão (linhas 12-33)
Remover estas linhas:
```typescript
// Session configuration with PostgreSQL store in production
import connectPgSimple from 'connect-pg-simple';
const PgSession = connectPgSimple(session);

app.use(session({
  store: process.env.NODE_ENV === 'production' 
    ? new PgSession({
        pool: require('./db').pool,
        tableName: 'sessions',
        createTableIfMissing: true
      })
    : undefined, // Use memory store in development
  secret: process.env.SESSION_SECRET || "fallback-secret-for-dev-only-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));
```

E substituir por:
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
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));
```

### 5. Fazer rebuild da aplicação
```bash
cd /var/www/afiliadosbet
npm run build
```

### 6. Reiniciar a aplicação
```bash
pm2 restart afiliadosbet
```

### 7. Verificar se está funcionando
```bash
# Ver logs
pm2 logs afiliadosbet

# Testar login
curl -X POST https://seudominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@afiliadosbet.com.br","password":"admin123"}'
```

## Alternativa: Script Automático

Execute este script para aplicar a correção automaticamente:

```bash
#!/bin/bash
cd /var/www/afiliadosbet

# Parar aplicação
pm2 stop afiliadosbet

# Fazer backup
cp server/index.ts server/index.ts.backup

# Aplicar correção
sed -i '12,33c\
// Session configuration with memory store (simpler for this project)\
import MemoryStore from '\''memorystore'\'';\
const memoryStore = MemoryStore(session);\
\
app.use(session({\
  store: new memoryStore({\
    checkPeriod: 86400000 // prune expired entries every 24h\
  }),\
  secret: process.env.SESSION_SECRET || "fallback-secret-for-dev-only-change-in-production",\
  resave: false,\
  saveUninitialized: false,\
  cookie: {\
    httpOnly: true,\
    secure: process.env.NODE_ENV === '\''production'\'', // HTTPS only in production\
    maxAge: 24 * 60 * 60 * 1000, // 24 hours\
    sameSite: '\''lax'\''\
  }\
}));' server/index.ts

# Fazer rebuild
npm run build

# Reiniciar aplicação
pm2 restart afiliadosbet

echo "Correção aplicada! Verifique os logs com: pm2 logs afiliadosbet"
```

## Observações Importantes

1. **MemoryStore vs PostgreSQL**: 
   - MemoryStore é mais simples e adequado para este projeto
   - Sessions serão perdidas em restart, mas isso é aceitável
   - PostgreSQL sessions são mais robustas mas complexas de configurar

2. **Se quiser manter PostgreSQL**:
   - Verifique se a variável DATABASE_URL está correta
   - Certifique-se de que a senha está como string
   - Configure um pool dedicado para sessões

3. **Verificação de Funcionamento**:
   ```bash
   # Logs sem erro
   pm2 logs afiliadosbet --lines 50
   
   # Teste de login
   curl -X POST https://seudominio.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@afiliadosbet.com.br","password":"admin123"}'
   ```

Esta correção resolverá o problema de login imediatamente.