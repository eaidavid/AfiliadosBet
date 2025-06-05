# Guia de Deploy para Produção - AfiliadosBet

## Arquivos Essenciais para Upload

Você precisa fazer upload dos seguintes arquivos para `/var/www/afiliadosbet/`:

### 1. Estrutura de Pastas
```
/var/www/afiliadosbet/
├── server/
├── client/
├── shared/
├── .env
├── package.json
├── ecosystem.config.js
├── fix-admin.mjs
└── dist/ (será criado após build)
```

### 2. Configuração do Banco (.env)
```
DATABASE_URL=postgresql://afiliadosbet:AfiliadosBet1001@localhost:5432/afiliadosbet
SESSION_SECRET=sua_chave_secreta_muito_segura_aqui_2024
NODE_ENV=production
PORT=3000
```

### 3. Comandos de Instalação no Servidor

```bash
# 1. Entrar na pasta do projeto
cd /var/www/afiliadosbet

# 2. Instalar dependências
npm install

# 3. Configurar banco de dados
npm run db:push

# 4. Criar usuário admin
node fix-admin.mjs

# 5. Compilar para produção
npm run build

# 6. Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
```

## Credenciais do Admin

Após executar o script fix-admin.mjs:
- **Email:** admin@admin.com
- **Senha:** admin123

## Verificação

1. Acesse: http://afiliadosbet.com.br
2. Clique em "Entrar" 
3. Use as credenciais acima
4. Deve funcionar perfeitamente

## Solução de Problemas

Se houver erro de conexão com banco:
```bash
sudo -u postgres psql
CREATE USER afiliadosbet WITH PASSWORD 'AfiliadosBet1001';
ALTER USER afiliadosbet WITH SUPERUSER;
CREATE DATABASE afiliadosbet OWNER afiliadosbet;
\q
```

## Status do Nginx

Verifique se o Nginx está configurado corretamente:
```bash
sudo nginx -t
sudo systemctl reload nginx
```