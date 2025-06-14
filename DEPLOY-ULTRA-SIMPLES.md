# Deploy Ultra Simples - AfiliadosBet

## Passo 1: Copie todos os comandos abaixo

Cole este bloco completo no terminal do seu servidor:

```bash
# Ir para pasta do projeto
cd /var/www/afiliadosbet

# Parar tudo que estiver rodando
pkill -f node 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Limpar builds antigos
rm -rf dist/

# Build frontend
cd client && npx vite build --outDir ../dist/public && cd ..

# Build backend
npx esbuild server/index.ts --bundle --platform=node --outdir=dist --format=esm

# Verificar se buildou
ls -la dist/index.js dist/public/index.html

# Rodar servidor
cd dist && NODE_ENV=production PORT=5000 nohup node index.js > app.log 2>&1 &

# Verificar se subiu
sleep 3 && curl http://localhost:5000 && echo "✅ Funcionando!"
```

## Se der erro, use este método mais simples:

```bash
cd /var/www/afiliadosbet
rm -rf dist/
mkdir -p dist/public

# Copy frontend files manually
cp client/index.html dist/public/
cp -r client/public/* dist/public/ 2>/dev/null || true

# Build apenas o essencial
npx esbuild server/index.ts --bundle --platform=node --outfile=dist/server.js --format=esm

# Rodar direto
cd dist && PORT=5000 node server.js
```

## Para manter rodando permanente:

```bash
# Instalar PM2
npm install -g pm2

# Iniciar com PM2
pm2 start dist/index.js --name afiliadosbet

# Salvar
pm2 save && pm2 startup
```

## Verificar se está funcionando:

```bash
# Ver logs
pm2 logs afiliadosbet

# Ver status
pm2 status

# Testar acesso
curl http://localhost:5000
```

## IP de acesso:

- Local: http://localhost:5000
- Externo: http://SEU_IP_VPS:5000

## Se nada funcionar:

1. Verifique se tem a pasta client:
   ```bash
   ls -la client/
   ```

2. Se não tiver, baixe do GitHub:
   ```bash
   git pull origin main
   ```

3. Teste build simples:
   ```bash
   cd client
   npx vite build
   cd ..
   npx esbuild server/index.ts --bundle --platform=node --outfile=app.js
   node app.js
   ```