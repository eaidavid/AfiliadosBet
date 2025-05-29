#!/bin/bash

echo "Preparando projeto para produção..."

# Fazer build
npm run build

# Criar pasta de produção
mkdir -p production

# Copiar arquivos necessários
cp -r dist/ production/
cp package.json production/
cp ecosystem.config.js production/
cp drizzle.config.ts production/
cp -r shared/ production/

# Criar arquivo .env de exemplo
cat > production/.env << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://afiliadosbet:SUA_SENHA_AQUI@localhost:5432/afiliadosbet
SESSION_SECRET=SUA_CHAVE_SECRETA_MUITO_LONGA_E_SEGURA_AQUI
EOF

echo "Pronto! Pasta 'production' criada com todos os arquivos necessários."
echo "Agora você pode compactar essa pasta e enviar para o VPS."