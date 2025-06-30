#!/bin/bash

# Script para verificar se todos os arquivos estão presentes no servidor

echo "🔍 Verificando estrutura do projeto..."

echo "📁 Estrutura atual:"
ls -la

echo ""
echo "📁 Conteúdo da pasta client:"
if [ -d "client" ]; then
    ls -la client/
    echo ""
    echo "📁 Conteúdo client/src:"
    ls -la client/src/ 2>/dev/null || echo "❌ client/src não encontrado"
else
    echo "❌ Pasta client não encontrada!"
fi

echo ""
echo "📁 Conteúdo da pasta server:"
if [ -d "server" ]; then
    ls -la server/
else
    echo "❌ Pasta server não encontrada!"
fi

echo ""
echo "📁 Verificando arquivos essenciais:"
echo -n "package.json: "
[ -f "package.json" ] && echo "✅" || echo "❌"

echo -n "client/index.html: "
[ -f "client/index.html" ] && echo "✅" || echo "❌"

echo -n "client/src/main.tsx: "
[ -f "client/src/main.tsx" ] && echo "✅" || echo "❌"

echo -n "server/index.ts: "
[ -f "server/index.ts" ] && echo "✅" || echo "❌"

echo -n "vite.config.ts: "
[ -f "vite.config.ts" ] && echo "✅" || echo "❌"

echo ""
echo "🔧 Verificando se pode fazer build:"
echo -n "Node.js: "
node --version 2>/dev/null || echo "❌ Não instalado"

echo -n "NPM: "
npm --version 2>/dev/null || echo "❌ Não instalado"

echo -n "Dependências instaladas: "
[ -d "node_modules" ] && echo "✅" || echo "❌"

echo ""
echo "📦 Testando build rápido..."
if [ -f "client/index.html" ] && [ -f "server/index.ts" ]; then
    echo "✅ Arquivos necessários presentes - pode prosseguir com deploy"
else
    echo "❌ Arquivos essenciais faltando - verificar repositório"
fi