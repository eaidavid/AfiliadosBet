#!/bin/bash

echo "🔧 Corrigindo banco de desenvolvimento..."

# 1. Backup do banco atual se existir
if [ -f "data/database.sqlite" ]; then
    echo "Fazendo backup do banco atual..."
    cp data/database.sqlite "data/database.sqlite.backup.$(date +%s)"
fi

# 2. Deletar banco atual
rm -f data/database.sqlite

# 3. Recriar diretório se necessário
mkdir -p data

echo "✅ Banco de desenvolvimento será recriado na próxima inicialização"
echo "Execute: npm run dev"