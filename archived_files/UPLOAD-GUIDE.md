# Guia Completo para Upload no Servidor

## Arquivos para Upload

Faça download e upload dos seguintes arquivos/pastas para `/var/www/afiliadosbet/`:

### Estrutura Completa:
```
/var/www/afiliadosbet/
├── server/
├── client/
├── shared/
├── package.json
├── .env
├── ecosystem.config.js
├── fix-admin.mjs
├── drizzle.config.ts
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
└── components.json
```

### Arquivo .env (criar no servidor):
```
DATABASE_URL=postgresql://afiliadosbet:AfiliadosBet1001@localhost:5432/afiliadosbet
SESSION_SECRET=afiliadosbet_super_secret_key_2024_production
NODE_ENV=production
PORT=3000
```

## Comandos no Servidor

Execute na ordem:

```bash
# 1. Ir para pasta
cd /var/www/afiliadosbet

# 2. Configurar usuário PostgreSQL
sudo -u postgres psql
CREATE USER afiliadosbet WITH PASSWORD 'AfiliadosBet1001';
ALTER USER afiliadosbet WITH SUPERUSER;
CREATE DATABASE afiliadosbet OWNER afiliadosbet;
\q

# 3. Instalar dependências
npm install

# 4. Configurar banco
npm run db:push

# 5. Criar admin
node fix-admin.mjs

# 6. Compilar
npm run build

# 7. Iniciar
pm2 start ecosystem.config.js
pm2 save
```

## Credenciais Admin
- Email: admin@admin.com
- Senha: admin123

## Teste
Acesse http://afiliadosbet.com.br e faça login com as credenciais acima.