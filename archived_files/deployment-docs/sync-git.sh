#!/bin/bash

# Sincronizar Git - Replit para Servidor
# Execute este script no seu servidor após fazer git push aqui

echo "🔄 Sincronizando código do GitHub para servidor..."

# Verificar se está em um repositório Git
if [ ! -d ".git" ]; then
    echo "❌ Não é um repositório Git"
    echo "Execute: git clone SEU_REPOSITORIO_URL ."
    exit 1
fi

# Parar aplicação antes de atualizar
echo "⏹️ Parando aplicação..."
pm2 stop afiliadosbet 2>/dev/null || true
pkill -f "node.*afiliadosbet" 2>/dev/null || true

# Fazer backup do .env se existir
if [ -f ".env" ]; then
    cp .env .env.backup
    echo "💾 Backup do .env criado"
fi

# Buscar atualizações
echo "📥 Baixando atualizações..."
git fetch origin

# Verificar se há atualizações
UPDATES=$(git rev-list HEAD...origin/main --count 2>/dev/null || git rev-list HEAD...origin/master --count 2>/dev/null || echo "0")

if [ "$UPDATES" -eq 0 ]; then
    echo "✅ Código já está atualizado"
else
    echo "📦 Aplicando $UPDATES atualizações..."
    
    # Salvar mudanças locais se houver
    git stash 2>/dev/null || true
    
    # Puxar atualizações
    git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || {
        echo "❌ Erro ao fazer pull. Tentando reset..."
        git reset --hard origin/main 2>/dev/null || git reset --hard origin/master
    }
    
    # Restaurar mudanças locais
    git stash pop 2>/dev/null || true
fi

# Restaurar .env se foi feito backup
if [ -f ".env.backup" ]; then
    mv .env.backup .env
    echo "🔄 .env restaurado"
fi

# Verificar se pasta client existe agora
if [ ! -d "client" ]; then
    echo "❌ Pasta client ainda não encontrada após sync"
    echo "Verificando o que foi baixado..."
    ls -la
    exit 1
fi

echo "✅ Client encontrado!"

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Build e deploy
echo "🚀 Fazendo deploy..."
rm -rf dist/

# Build frontend
cd client
npx vite build --outDir ../dist/public
cd ..

# Build backend
npx esbuild server/index.ts --bundle --platform=node --outdir=dist --format=esm

# Verificar build
if [ ! -f "dist/index.js" ] || [ ! -f "dist/public/index.html" ]; then
    echo "❌ Build falhou"
    exit 1
fi

# Iniciar aplicação
echo "▶️ Iniciando aplicação..."
cd dist
NODE_ENV=production PORT=5000 pm2 start index.js --name afiliadosbet 2>/dev/null || \
NODE_ENV=production PORT=5000 nohup node index.js > app.log 2>&1 &

sleep 3

# Testar
if curl -s http://localhost:5000 > /dev/null; then
    echo "✅ Aplicação rodando com sucesso!"
    echo "🌐 Acesse: http://$(hostname -I | awk '{print $1}'):5000"
else
    echo "⚠️ Aplicação pode não estar respondendo"
    echo "Verificando logs..."
    tail -20 app.log 2>/dev/null || pm2 logs afiliadosbet --lines 10
fi

echo "🎉 Sincronização concluída!"