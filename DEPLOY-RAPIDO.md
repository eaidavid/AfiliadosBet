# Deploy Rápido - AfiliadosBet

## Comando Único de Deploy

Cole este comando no terminal e execute:

```bash
cd /var/www/afiliadosbet && rm -rf dist/ && mkdir -p dist/public && cd client && npx vite build --outDir ../dist/public && cd .. && npx esbuild server/index.ts --bundle --platform=node --outdir=dist --format=esm && npm install -g pm2 && pm2 delete afiliadosbet 2>/dev/null || true && PORT=5000 NODE_ENV=production pm2 start dist/index.js --name afiliadosbet && pm2 save && echo "✅ Deploy concluído! Acesse: http://$(hostname -I | awk '{print $1}'):5000"
```

## Ou Execute Passo a Passo:

### 1. Vá para a pasta do projeto
```bash
cd /var/www/afiliadosbet
```

### 2. Limpe arquivos antigos
```bash
rm -rf dist/
mkdir -p dist/public
```

### 3. Build do frontend
```bash
cd client
npx vite build --outDir ../dist/public
cd ..
```

### 4. Build do backend
```bash
npx esbuild server/index.ts --bundle --platform=node --outdir=dist --format=esm
```

### 5. Instalar PM2
```bash
npm install -g pm2
```

### 6. Iniciar aplicação
```bash
pm2 delete afiliadosbet 2>/dev/null || true
PORT=5000 NODE_ENV=production pm2 start dist/index.js --name afiliadosbet
pm2 save
```

### 7. Verificar se funcionou
```bash
pm2 list
pm2 logs afiliadosbet --lines 10
```

## Se Der Erro de Permissão:

```bash
sudo npm install -g pm2
sudo pm2 delete afiliadosbet 2>/dev/null || true
sudo PORT=5000 NODE_ENV=production pm2 start dist/index.js --name afiliadosbet
sudo pm2 save
```

## Testar se Funcionou:

```bash
curl http://localhost:5000
# Ou acesse no navegador: http://SEU_IP:5000
```

## Comandos Úteis Após Deploy:

```bash
# Ver logs
pm2 logs afiliadosbet

# Reiniciar
pm2 restart afiliadosbet

# Status
pm2 status

# Monitor
pm2 monit
```

## Se Não Funcionar:

1. **Verificar se build foi criado:**
   ```bash
   ls -la dist/
   ls -la dist/public/
   ```

2. **Testar build manualmente:**
   ```bash
   cd dist
   node index.js
   ```

3. **Verificar porta:**
   ```bash
   netstat -tlnp | grep 5000
   ```

4. **Ver erros detalhados:**
   ```bash
   pm2 logs afiliadosbet --err
   ```