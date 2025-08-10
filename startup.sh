#!/bin/bash

# Script de inicialização robusta para AfiliadosBet
# Garante que a aplicação sempre esteja rodando

echo "🚀 Iniciando AfiliadosBet..."

# Criar diretório de logs se não existir
mkdir -p logs

# Verificar se o processo já está rodando
if pgrep -f "tsx server/index.ts" > /dev/null; then
    echo "⚠️ Aplicação já está rodando. Parando processo anterior..."
    pkill -f "tsx server/index.ts"
    sleep 3
fi

# Verificar se a porta está em uso
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null; then
    echo "⚠️ Porta 5000 em uso. Liberando..."
    lsof -ti:5000 | xargs kill -9
    sleep 2
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Inicializar banco de dados
echo "🗄️ Verificando banco de dados..."
npm run db:push

# Iniciar aplicação em desenvolvimento
echo "🔥 Iniciando servidor de desenvolvimento..."
export NODE_ENV=development
export PORT=5000
export HOST=0.0.0.0

npm run dev

echo "✅ Script de inicialização concluído"