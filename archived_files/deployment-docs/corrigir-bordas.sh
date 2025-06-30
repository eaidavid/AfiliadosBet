#!/bin/bash

# Script para corrigir bordas CSS no servidor
echo "Corrigindo bordas CSS..."

# Parar aplicação
pm2 stop afiliadosbet 2>/dev/null

# Fazer backup do CSS
cp client/src/index.css client/src/index.css.backup

# Corrigir a linha problemática
sed -i 's/@apply border border-border;/@apply border-0;/g' client/src/index.css

# Recompilar
npm run build

# Reiniciar
pm2 restart afiliadosbet

echo "Correção aplicada! Bordas removidas."
echo "Backup salvo em: client/src/index.css.backup"