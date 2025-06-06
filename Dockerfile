FROM node:20-alpine

# Instalar dependências do sistema
RUN apk add --no-cache postgresql-client

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código da aplicação
COPY . .

# Build da aplicação
RUN npm run build

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S afiliados -u 1001

# Mudar propriedade dos arquivos
RUN chown -R afiliados:nodejs /app
USER afiliados

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["node", "server/index.js"]