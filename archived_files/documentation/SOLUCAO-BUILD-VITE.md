# Solução para Problemas de Build Vite - AfiliadosBet

## Diagnóstico do Problema

O Vite está configurado corretamente e encontra o arquivo `client/index.html` como entry point. O problema não é de configuração, mas sim de **performance do build** devido ao grande número de dependências, especialmente os ícones do Lucide React.

## Estrutura Atual (Correta)

```
client/
├── index.html          ✅ Entry point correto
├── src/
│   ├── main.tsx        ✅ Ponto de entrada React
│   └── ...
└── public/
```

## Soluções para Build Lento

### 1. Script de Build Otimizado

Use o script `build-optimized.js` criado na raiz do projeto:

```bash
# Build otimizado com melhor performance
node build-optimized.js

# Ou use o build fast sem source maps
GENERATE_SOURCEMAP=false npm run build
```

### 2. Configuração do Browserslist

Arquivo `.browserslistrc` criado para resolver warnings:

```
last 2 versions
> 1%
not dead
not ie 11
```

### 3. Variáveis de Ambiente para Performance

```bash
# Build mais rápido desabilitando source maps
export GENERATE_SOURCEMAP=false

# Build com menos verificações
export NODE_ENV=production
export VITE_NODE_ENV=production
```

### 4. Build em Etapas para Debug

Se o build falhar, teste em etapas:

```bash
# 1. Verificar configuração
npx vite build --mode development

# 2. Build apenas frontend
cd client && npx vite build

# 3. Build apenas backend
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

## Otimizações de Performance

### Reduzir Tamanho do Bundle

1. **Tree Shaking de Ícones Lucide**:
   ```typescript
   // Ao invés de importar tudo:
   import { ChevronDown, User, Settings } from 'lucide-react';
   
   // Use imports específicos quando possível:
   import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
   ```

2. **Lazy Loading de Componentes**:
   ```typescript
   const AdminPanel = lazy(() => import('./pages/AdminPanel'));
   const Dashboard = lazy(() => import('./pages/Dashboard'));
   ```

### Cache de Dependências

```bash
# Limpar cache se necessário
rm -rf node_modules/.vite
rm -rf dist

# Reinstalar dependências
npm ci
```

## Resolução de Problemas Específicos

### Erro: "Cannot find entry point"

1. Verificar se `client/index.html` existe:
   ```bash
   ls -la client/index.html
   ```

2. Verificar conteúdo do arquivo:
   ```bash
   head -20 client/index.html
   ```

3. Verificar se `src/main.tsx` está referenciado:
   ```html
   <script type="module" src="/src/main.tsx"></script>
   ```

### Build Infinito/Lento

1. **Usar timeout no build**:
   ```bash
   timeout 300s npm run build  # 5 minutos max
   ```

2. **Build incremental**:
   ```bash
   # Build apenas se houver mudanças
   npx vite build --mode production --no-deps
   ```

3. **Verificar uso de memória**:
   ```bash
   # Aumentar limite de memória Node.js
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

### Erro de Dependências Circulares

Se houver imports circulares:

```bash
# Analisar dependências
npx madge --circular client/src/

# Verificar bundle
npx vite-bundle-analyzer dist/public
```

## Build para Produção (Hostinger)

### Script Completo de Deploy

```bash
#!/bin/bash
# build-production.sh

set -e

echo "🚀 Iniciando build para produção..."

# 1. Limpeza
rm -rf dist/
rm -rf node_modules/.vite/

# 2. Atualizar browserslist
npx update-browserslist-db@latest

# 3. Build otimizado
export NODE_ENV=production
export GENERATE_SOURCEMAP=false
export NODE_OPTIONS="--max-old-space-size=2048"

# 4. Build com timeout
timeout 600s npm run build || {
    echo "❌ Build timeout - usando build alternativo"
    
    # Build alternativo mais simples
    cd client
    npx vite build --mode production --no-deps
    cd ..
    
    npx esbuild server/index.ts \
        --platform=node \
        --packages=external \
        --bundle \
        --format=esm \
        --outdir=dist \
        --minify
}

echo "✅ Build concluído"

# 5. Verificar arquivos gerados
ls -la dist/
ls -la dist/public/

echo "📦 Pronto para deploy!"
```

### Configuração PM2 para Produção

```javascript
// production-ecosystem.config.js
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
    node_args: '--max-old-space-size=1024'
  }]
};
```

## Monitoramento do Build

### Tempo de Build

```bash
# Medir tempo de build
time npm run build

# Build com logs detalhados
DEBUG=vite:* npm run build
```

### Análise do Bundle

```bash
# Analisar tamanho do bundle
npx vite-bundle-analyzer dist/public

# Verificar dependências pesadas
npm ls --depth=0 | grep -E "(MB|KB)"
```

## Alternativas de Build

### 1. Build Simples (Fallback)

```bash
# Se o build normal falhar
cd client
npx vite build --mode production
cd ..
npx esbuild server/index.ts --bundle --platform=node --outdir=dist --format=esm
```

### 2. Build Docker (Para VPS)

```dockerfile
# Dockerfile para build consistente
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
```

### 3. Build Local + Upload

```bash
# Build local e upload via SFTP
npm run build
tar -czf build.tar.gz dist/

# Upload para servidor
scp build.tar.gz user@servidor:/var/www/afiliadosbet/
ssh user@servidor "cd /var/www/afiliadosbet && tar -xzf build.tar.gz"
```

## Comandos de Emergência

### Reset Completo

```bash
# Se tudo falhar, reset completo
rm -rf node_modules/ dist/ .vite/
npm cache clean --force
npm install
npm run build
```

### Build de Desenvolvimento

```bash
# Build mais rápido para teste
NODE_ENV=development npm run build
```

### Verificação Final

```bash
# Testar se aplicação inicia
node dist/index.js

# Verificar se frontend foi gerado
ls -la dist/public/index.html
ls -la dist/public/assets/
```

## Dicas de Performance

1. **Use build incremental** quando possível
2. **Desabilite source maps** em produção
3. **Aumente memória Node.js** se necessário
4. **Use cache** do npm/node_modules
5. **Implemente lazy loading** para componentes grandes
6. **Otimize imports** de bibliotecas grandes como Lucide

O build está funcionando corretamente, apenas precisa de otimizações para melhor performance.