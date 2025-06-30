#!/bin/bash

# Script de Sincronização Simples - AfiliadosBet
# Execute no servidor: bash sincronizar.sh

echo "🔄 Sincronizando mudanças do desenvolvimento..."

# Parar aplicação
echo "⏹️ Parando aplicação..."
pm2 stop afiliadosbet 2>/dev/null || echo "Aplicação não estava rodando"

# Baixar mudanças
echo "📥 Baixando código atualizado..."
git pull origin main

# Instalar dependências se necessário
echo "📦 Verificando dependências..."
npm install --production --silent

# Compilar aplicação
echo "🔨 Compilando aplicação..."
npm run build

# Atualizar banco se necessário
echo "🗄️ Atualizando banco de dados..."
npm run db:push

# Reiniciar aplicação
echo "🚀 Reiniciando aplicação..."
pm2 restart afiliadosbet || pm2 start dist/index.js --name afiliadosbet

# Verificar status
echo "✅ Verificando status..."
sleep 3
pm2 status | grep afiliadosbet

echo ""
echo "✅ Sincronização concluída!"
echo "📊 Para ver logs: pm2 logs afiliadosbet"
echo "🌐 Para testar: curl http://localhost:3000"