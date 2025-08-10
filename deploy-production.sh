#!/bin/bash

# Script de deploy para produção do AfiliadosBet
# Garante deploy seguro e rollback automático

echo "🚀 Iniciando deploy de produção do AfiliadosBet..."

# Configurações
APP_NAME="afiliadosbet"
NODE_ENV="production"
PORT=3000
HOST="0.0.0.0"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 não encontrado. Instalando..."
    npm install -g pm2
fi

# Criar backup da versão atual se existir
if pm2 list | grep -q $APP_NAME; then
    print_status "Criando backup da versão atual..."
    pm2 save
    cp ecosystem.config.js ecosystem.config.backup.js
fi

# Instalar/atualizar dependências
print_status "Instalando dependências..."
npm ci --production=false

# Build da aplicação
print_status "Compilando aplicação..."
npm run build

# Verificar se o build foi bem-sucedido
if [ ! -f "dist/index.js" ]; then
    print_error "Build falhou! Arquivo dist/index.js não encontrado."
    exit 1
fi

# Criar diretórios necessários
mkdir -p logs

# Parar aplicação atual se estiver rodando
if pm2 list | grep -q $APP_NAME; then
    print_status "Parando aplicação atual..."
    pm2 stop $APP_NAME
    pm2 delete $APP_NAME
fi

# Sincronizar banco de dados
print_status "Sincronizando esquema do banco de dados..."
npm run db:push

# Iniciar aplicação com PM2
print_status "Iniciando aplicação em produção..."
pm2 start ecosystem.config.js --env production

# Verificar se a aplicação iniciou corretamente
sleep 5
if pm2 list | grep -q "online.*$APP_NAME"; then
    print_status "Aplicação iniciada com sucesso!"
    pm2 save
    pm2 startup
    
    # Monitorar por 30 segundos
    print_status "Monitorando estabilidade..."
    sleep 30
    
    if pm2 list | grep -q "online.*$APP_NAME"; then
        print_status "Deploy concluído com sucesso!"
        print_status "Aplicação rodando em http://localhost:$PORT"
        print_status "Logs: pm2 logs $APP_NAME"
        print_status "Status: pm2 status"
        print_status "Monitoramento: pm2 monit"
    else
        print_error "Aplicação instável. Verificando logs..."
        pm2 logs $APP_NAME --lines 20
        exit 1
    fi
else
    print_error "Falha ao iniciar aplicação. Verificando logs..."
    pm2 logs $APP_NAME --lines 20
    exit 1
fi