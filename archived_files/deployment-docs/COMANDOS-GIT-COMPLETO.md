# Comandos Git Completos - Sincronizar Replit com Servidor

## NO REPLIT (aqui):

```bash
# 1. Adicionar todos os arquivos
git add .

# 2. Commitar mudanças
git commit -m "Deploy final - todos os arquivos incluídos"

# 3. Enviar para GitHub
git push origin main
```

## NO SEU SERVIDOR VPS:

```bash
# Comando único para sincronizar tudo
cd /var/www/afiliadosbet && git pull origin main && npm install && rm -rf dist/ && cd client && npx vite build --outDir ../dist/public && cd .. && npx esbuild server/index.ts --bundle --platform=node --outdir=dist --format=esm && pm2 delete afiliadosbet 2>/dev/null || true && cd dist && NODE_ENV=production PORT=5000 pm2 start index.js --name afiliadosbet && pm2 save && echo "Deploy concluído!"
```

## Ou passo a passo no servidor:

```bash
# 1. Ir para pasta do projeto
cd /var/www/afiliadosbet

# 2. Baixar atualizações
git pull origin main

# 3. Instalar dependências
npm install

# 4. Build frontend
cd client
npx vite build --outDir ../dist/public
cd ..

# 5. Build backend
npx esbuild server/index.ts --bundle --platform=node --outdir=dist --format=esm

# 6. Parar aplicação anterior
pm2 delete afiliadosbet 2>/dev/null || true

# 7. Iniciar nova aplicação
cd dist
NODE_ENV=production PORT=5000 pm2 start index.js --name afiliadosbet

# 8. Salvar configuração
pm2 save

# 9. Verificar se funcionou
pm2 status
curl http://localhost:5000
```

## Se der erro "pasta client não encontrada":

```bash
# Verificar o que foi baixado
ls -la

# Forçar download completo
git fetch --all
git reset --hard origin/main

# Verificar se client existe agora
ls -la client/
```

## Configurar Git no servidor (primeira vez):

```bash
cd /var/www/afiliadosbet
git init
git remote add origin SEU_REPOSITORIO_URL
git pull origin main
```