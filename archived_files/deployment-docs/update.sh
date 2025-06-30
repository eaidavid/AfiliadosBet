#!/bin/bash

# Atualização Rápida - AfiliadosBet
# Execute: bash update.sh

echo "Atualizando AfiliadosBet..."

# Parar aplicação
pm2 stop afiliadosbet 2>/dev/null

# Atualizar código
git pull origin main

# Instalar dependências se necessário
npm install --production

# Compilar
npm run build

# Atualizar banco
npm run db:push

# Reiniciar
pm2 restart afiliadosbet || pm2 start dist/index.js --name afiliadosbet

echo "Atualização concluída!"
echo "Status: pm2 status"