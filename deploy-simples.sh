#!/bin/bash

# Deploy Simples - AfiliadosBet
# Execute com: chmod +x deploy-simples.sh && sudo ./deploy-simples.sh

set -e

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Iniciando deploy simples do AfiliadosBet${NC}"

# 1. Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Execute este script na pasta do projeto${NC}"
    exit 1
fi

# 2. Build da aplicação (simples e rápido)
echo -e "${YELLOW}📦 Fazendo build da aplicação...${NC}"

# Limpar dist
rm -rf dist/

# Build frontend simples
echo "Building frontend..."
cd client
npx vite build --mode production --outDir ../dist/public
cd ..

# Build backend simples
echo "Building backend..."
npx esbuild server/index.ts \
    --platform=node \
    --packages=external \
    --bundle \
    --format=esm \
    --outdir=dist \
    --minify

echo -e "${GREEN}✅ Build concluído${NC}"

# 3. Verificar arquivos gerados
if [ ! -f "dist/index.js" ] || [ ! -f "dist/public/index.html" ]; then
    echo -e "${RED}❌ Erro no build - arquivos não foram gerados${NC}"
    exit 1
fi

# 4. Instalar PM2 se não estiver instalado
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Instalando PM2...${NC}"
    npm install -g pm2
fi

# 5. Parar aplicação se estiver rodando
pm2 stop afiliadosbet 2>/dev/null || true
pm2 delete afiliadosbet 2>/dev/null || true

# 6. Iniciar aplicação
echo -e "${YELLOW}🚀 Iniciando aplicação...${NC}"

pm2 start dist/index.js \
    --name "afiliadosbet" \
    --env production \
    --max-memory-restart 1G

# 7. Salvar configuração PM2
pm2 save
pm2 startup

echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}📊 Status da aplicação:${NC}"
pm2 status afiliadosbet

echo -e "${YELLOW}📝 Comandos úteis:${NC}"
echo "  pm2 logs afiliadosbet     # Ver logs"
echo "  pm2 restart afiliadosbet  # Reiniciar"
echo "  pm2 stop afiliadosbet     # Parar"
echo "  pm2 monit                 # Monitor"

echo -e "${GREEN}🌐 Aplicação disponível em: http://localhost:5000${NC}"