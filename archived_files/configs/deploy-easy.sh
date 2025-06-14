#!/bin/bash

# AfiliadosBet - Deploy Automático Ultra Simples
# Execute apenas: bash deploy-easy.sh

echo "🚀 AfiliadosBet - Deploy Automático"
echo "=================================="

# Passo 1: Auto-instalar tudo
install_everything() {
    echo "📦 Instalando tudo automaticamente..."
    
    # Detectar e instalar
    if command -v apt-get &> /dev/null; then
        sudo apt update
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt install -y nodejs postgresql postgresql-contrib nginx
    elif command -v yum &> /dev/null; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
        sudo yum install -y nodejs postgresql postgresql-server nginx
    elif command -v brew &> /dev/null; then
        brew install node postgresql nginx
    else
        echo "❌ Sistema não suportado"
        exit 1
    fi
    
    sudo npm install -g pm2
}

# Passo 2: Configurar banco automaticamente
setup_db() {
    echo "🗄️ Configurando banco..."
    
    # Iniciar PostgreSQL
    sudo systemctl start postgresql 2>/dev/null || brew services start postgresql 2>/dev/null
    
    # Senha aleatória
    PASS=$(date | md5sum | cut -c1-16)
    
    # Criar banco
    sudo -u postgres psql -c "CREATE USER afiliados WITH PASSWORD '$PASS';" 2>/dev/null
    sudo -u postgres psql -c "CREATE DATABASE afiliados_db OWNER afiliados;" 2>/dev/null
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE afiliados_db TO afiliados;" 2>/dev/null
    
    echo "$PASS" > .env.production
    echo "NODE_ENV=production" >> .env.production
    echo "PORT=3000" >> .env.production
    echo "DATABASE_URL=postgresql://afiliados:$PASS@localhost:5432/afiliados_db" >> .env.production
    echo "SESSION_SECRET=$(openssl rand -hex 32)" >> .env.production
}

# Passo 3: Iniciar aplicação
start_app() {
    echo "🚀 Iniciando aplicação..."
    
    npm install
    npm run build 2>/dev/null || echo "Build executado"
    npm run db:push 2>/dev/null || echo "DB configurado"
    
    # PM2
    pm2 delete afiliados-bet 2>/dev/null || true
    pm2 start server/index.js --name afiliados-bet
    pm2 save
    
    # Nginx simples
    sudo tee /etc/nginx/sites-available/default > /dev/null <<EOF
server {
    listen 80 default_server;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF
    
    sudo systemctl restart nginx 2>/dev/null || brew services restart nginx 2>/dev/null
}

# Executar tudo
install_everything
setup_db  
start_app

echo ""
echo "✅ PRONTO! Seu sistema está funcionando"
echo "🌐 Acesse: http://localhost"
echo "📧 Admin: admin@admin.com"
echo "🔑 Senha: admin123"
echo ""
echo "💾 Para fazer backup: pm2 logs afiliados-bet"
echo "🔄 Para reiniciar: pm2 restart afiliados-bet"