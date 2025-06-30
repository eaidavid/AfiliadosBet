#!/bin/bash

# Deploy Completo - Garante que todos os arquivos sejam copiados
# Para usar: bash deploy-completo.sh

set -e

echo "🚀 Deploy Completo - AfiliadosBet"
echo "================================="

# 1. Verificar estrutura atual
echo "1️⃣ Verificando arquivos do projeto..."

ARQUIVOS_ESSENCIAIS=(
    "package.json"
    "client/index.html"
    "client/src/main.tsx" 
    "server/index.ts"
    "vite.config.ts"
)

for arquivo in "${ARQUIVOS_ESSENCIAIS[@]}"; do
    if [ ! -f "$arquivo" ]; then
        echo "❌ ERRO: Arquivo $arquivo não encontrado"
        echo "Certifique-se de estar na pasta correta do projeto"
        exit 1
    fi
done

echo "✅ Todos os arquivos essenciais presentes"

# 2. Verificar se é um repositório Git
if [ -d ".git" ]; then
    echo "📦 Projeto Git detectado"
    
    # Verificar se client está no repositório
    if git ls-files | grep -q "client/"; then
        echo "✅ Pasta client está no repositório"
    else
        echo "⚠️ Pasta client pode não estar commitada"
        echo "Adicionando arquivos do client ao Git..."
        git add client/ || true
    fi
else
    echo "📁 Projeto local (não Git)"
fi

# 3. Limpar build anterior
echo "2️⃣ Limpando builds anteriores..."
rm -rf dist/
mkdir -p dist/public

# 4. Verificar dependências
echo "3️⃣ Verificando dependências..."
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
else
    echo "✅ Dependências já instaladas"
fi

# 5. Build do frontend
echo "4️⃣ Fazendo build do frontend..."
echo "Entrando na pasta client..."
cd client

echo "Executando vite build..."
npx vite build --outDir ../dist/public --mode production

if [ ! -f "../dist/public/index.html" ]; then
    echo "❌ ERRO: Build do frontend falhou"
    cd ..
    exit 1
fi

cd ..
echo "✅ Frontend compilado com sucesso"

# 6. Build do backend
echo "5️⃣ Fazendo build do backend..."
npx esbuild server/index.ts \
    --bundle \
    --platform=node \
    --outdir=dist \
    --format=esm \
    --minify \
    --external:pg-native

if [ ! -f "dist/index.js" ]; then
    echo "❌ ERRO: Build do backend falhou"
    exit 1
fi

echo "✅ Backend compilado com sucesso"

# 7. Verificar builds gerados
echo "6️⃣ Verificando arquivos gerados..."
echo "Frontend:"
ls -la dist/public/ | head -10

echo "Backend:"
ls -la dist/index.js

# 8. Configurar PM2
echo "7️⃣ Configurando PM2..."

# Instalar PM2 se necessário
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    npm install -g pm2
fi

# Parar aplicação anterior
echo "Parando aplicação anterior..."
pm2 delete afiliadosbet 2>/dev/null || true

# 9. Iniciar aplicação
echo "8️⃣ Iniciando aplicação..."

# Criar arquivo de configuração PM2 temporário
cat > ecosystem.temp.config.js << EOF
module.exports = {
  apps: [{
    name: 'afiliadosbet',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    max_memory_restart: '1G',
    autorestart: true,
    watch: false
  }]
};
EOF

# Iniciar com PM2
pm2 start ecosystem.temp.config.js

# Remover arquivo temporário
rm ecosystem.temp.config.js

# 10. Salvar configuração
echo "9️⃣ Salvando configuração..."
pm2 save
pm2 startup

# 11. Verificar se está funcionando
echo "🔍 Verificando se aplicação está rodando..."
sleep 5

if pm2 list | grep -q "afiliadosbet.*online"; then
    echo "✅ Aplicação rodando com sucesso!"
else
    echo "⚠️ Aplicação pode não estar rodando corretamente"
    echo "Verificando logs..."
    pm2 logs afiliadosbet --lines 10
fi

# 12. Testar conectividade
echo "🌐 Testando conectividade..."
if curl -f -s http://localhost:5000 > /dev/null; then
    echo "✅ Servidor respondendo em http://localhost:5000"
else
    echo "⚠️ Servidor não está respondendo na porta 5000"
    echo "Verificando se a porta está em uso..."
    netstat -tlnp | grep 5000 || echo "Porta 5000 não está em uso"
fi

echo ""
echo "🎉 DEPLOY CONCLUÍDO!"
echo "==================="
echo "📊 Status da aplicação:"
pm2 list

echo ""
echo "🔧 Comandos úteis:"
echo "pm2 logs afiliadosbet     # Ver logs"
echo "pm2 restart afiliadosbet  # Reiniciar"
echo "pm2 stop afiliadosbet     # Parar"
echo "pm2 monit                 # Monitor"

echo ""
echo "🌐 Acesse sua aplicação:"
echo "http://localhost:5000"
echo "http://$(hostname -I | awk '{print $1}'):5000"