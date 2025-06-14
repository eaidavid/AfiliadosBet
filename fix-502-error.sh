#!/bin/bash

# Fix 502 Bad Gateway Error - AfiliadosBet

echo "🔧 Diagnosticando erro 502..."

# Verificar se aplicação está respondendo na porta 5000
echo "1. Testando aplicação na porta 5000:"
curl -v http://localhost:5000 2>&1 | head -20

echo -e "\n2. Verificando portas em uso:"
netstat -tlnp | grep 5000

echo -e "\n3. Verificando logs PM2:"
pm2 logs afiliadosbet --lines 20 --nostream

echo -e "\n4. Verificando processo Node.js:"
ps aux | grep node

echo -e "\n5. Verificando logs do Nginx:"
tail -20 /var/log/nginx/error.log

echo -e "\n6. Parando aplicação e reiniciando..."
pm2 stop afiliadosbet
pm2 delete afiliadosbet

# Ir para diretório da aplicação
cd /var/www/afiliadosbet

# Verificar se dist existe e tem os arquivos
echo -e "\n7. Verificando build:"
ls -la dist/
ls -la dist/index.js 2>/dev/null || echo "index.js não encontrado"

# Refazer build se necessário
if [ ! -f "dist/index.js" ]; then
    echo "8. Refazendo build..."
    npm run build || {
        echo "Build padrão falhou, usando método alternativo..."
        rm -rf dist/
        mkdir -p dist/public
        cd client && npx vite build --outDir ../dist/public && cd ..
        npx esbuild server/index.ts --bundle --platform=node --outdir=dist --format=esm
    }
fi

# Testar aplicação diretamente
echo -e "\n9. Testando aplicação diretamente:"
cd dist
timeout 10s node index.js &
APP_PID=$!
sleep 3
curl -s http://localhost:5000 | head -10 || echo "Aplicação não responde"
kill $APP_PID 2>/dev/null

# Reiniciar com PM2
echo -e "\n10. Reiniciando com PM2:"
pm2 start index.js --name afiliadosbet
pm2 logs afiliadosbet --lines 10 --nostream

# Aguardar e testar
sleep 5
echo -e "\n11. Teste final:"
curl -I http://localhost:5000

echo -e "\n12. Status final:"
pm2 status
netstat -tlnp | grep 5000