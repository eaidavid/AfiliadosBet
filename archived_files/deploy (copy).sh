#!/bin/bash

echo "🚀 Iniciando deploy do AfiliadosBet..."

# 1. Compilar o projeto
echo "📦 Compilando projeto..."
npm run build

# 2. Criar pasta de deploy
echo "📁 Preparando arquivos..."
rm -rf deploy
mkdir -p deploy

# 3. Copiar arquivos necessários
cp -r dist/ deploy/
cp package.json deploy/
cp ecosystem.config.js deploy/
cp .env.production deploy/.env
cp -r node_modules/ deploy/ 2>/dev/null || echo "⚠️  node_modules não copiado - será instalado no servidor"

echo "✅ Arquivos preparados na pasta 'deploy/'"
echo ""
echo "📋 Próximos passos no servidor:"
echo "1. Envie a pasta 'deploy/' para /var/www/site/"
echo "2. No servidor, execute:"
echo "   cd /var/www/site"
echo "   npm install --production"
echo "   npm run db:push"
echo "   pm2 delete afiliadosbet 2>/dev/null || true"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo ""
echo "🌐 O site estará disponível na porta 3000"