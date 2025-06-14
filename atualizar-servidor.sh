#!/bin/bash

# Script de Atualização Simples - AfiliadosBet
# Execute no servidor: bash atualizar-servidor.sh

echo "🔄 Atualizando AfiliadosBet no servidor..."

# Navegar para o diretório da aplicação
cd /var/www/afiliadosbet || { echo "❌ Diretório não encontrado"; exit 1; }

# 1. Parar a aplicação
echo "⏹️ Parando aplicação..."
pm2 stop afiliadosbet 2>/dev/null || echo "Aplicação não estava rodando"

# 2. Fazer backup rápido
echo "💾 Criando backup..."
cp -r . ../backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || echo "Backup pulado"

# 3. Atualizar código
echo "📥 Baixando atualizações..."
git pull origin main || { echo "❌ Erro ao baixar código"; exit 1; }

# 4. Instalar dependências
echo "📦 Instalando dependências..."
npm install

# 5. Compilar aplicação
echo "🔨 Compilando aplicação..."
npm run build

# 6. Atualizar banco de dados
echo "🗄️ Atualizando banco..."
npm run db:push

# 7. Reiniciar aplicação
echo "🚀 Reiniciando aplicação..."
pm2 restart afiliadosbet || pm2 start dist/index.js --name afiliadosbet

# 8. Verificar status
echo "✅ Verificando status..."
pm2 status
pm2 logs afiliadosbet --lines 10

echo ""
echo "✅ Atualização concluída!"
echo "🌐 Acesse: http://seu-dominio.com"
echo "📊 Status: pm2 status"
echo "📝 Logs: pm2 logs afiliadosbet"