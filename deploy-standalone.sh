#!/bin/bash

# AfiliadosBet - Deploy Standalone Automatizado
# Execute: bash deploy-standalone.sh

set -e

echo "🚀 AfiliadosBet - Deploy Standalone Iniciado"
echo "=========================================="

# Detectar sistema operacional
OS=""
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if command -v apt-get &> /dev/null; then
        OS="ubuntu"
    elif command -v yum &> /dev/null; then
        OS="centos"
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
fi

echo "💻 Sistema detectado: $OS"

# Função para instalar dependências
install_dependencies() {
    echo "📦 Instalando dependências..."
    
    case $OS in
        ubuntu)
            sudo apt update
            sudo apt install -y curl wget git nginx postgresql postgresql-contrib
            
            # Node.js 20
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        centos)
            sudo yum update -y
            sudo yum install -y curl wget git nginx postgresql postgresql-server
            
            # Node.js 20
            curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
            sudo yum install -y nodejs
            ;;
        macos)
            # Verificar se Homebrew está instalado
            if ! command -v brew &> /dev/null; then
                echo "❌ Homebrew não encontrado. Instale em: https://brew.sh"
                exit 1
            fi
            
            brew install node postgresql nginx
            ;;
        *)
            echo "❌ Sistema operacional não suportado"
            exit 1
            ;;
    esac
    
    # PM2 global
    sudo npm install -g pm2
    
    echo "✅ Dependências instaladas"
}

# Função para configurar PostgreSQL
setup_database() {
    echo "🗄️ Configurando banco de dados..."
    
    # Gerar senha aleatória
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    case $OS in
        ubuntu|centos)
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
            
            # Criar usuário e banco
            sudo -u postgres psql <<EOF
CREATE USER afiliados WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE afiliados_db OWNER afiliados;
GRANT ALL PRIVILEGES ON DATABASE afiliados_db TO afiliados;
\q
EOF
            ;;
        macos)
            brew services start postgresql
            
            createuser -s afiliados
            createdb afiliados_db -O afiliados
            psql -d afiliados_db -c "ALTER USER afiliados WITH PASSWORD '$DB_PASSWORD';"
            ;;
    esac
    
    echo "✅ Banco configurado - Senha: $DB_PASSWORD"
    echo "$DB_PASSWORD" > .db_password
}

# Função para preparar aplicação
setup_application() {
    echo "⚙️ Preparando aplicação..."
    
    # Criar diretório de produção
    DEPLOY_DIR="/var/www/afiliados"
    
    if [[ "$OS" == "macos" ]]; then
        DEPLOY_DIR="$HOME/afiliados-production"
    fi
    
    sudo mkdir -p $DEPLOY_DIR
    sudo chown -R $USER:$USER $DEPLOY_DIR
    
    # Copiar arquivos
    cp -r . $DEPLOY_DIR/
    cd $DEPLOY_DIR
    
    # Instalar dependências de produção
    npm ci --production
    
    # Gerar chave de sessão
    SESSION_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    
    # Criar .env.production
    DB_PASSWORD=$(cat .db_password)
    cat > .env.production <<EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://afiliados:$DB_PASSWORD@localhost:5432/afiliados_db
SESSION_SECRET=$SESSION_SECRET
DOMAIN=localhost
EOF
    
    # Build da aplicação
    npm run build
    
    # Executar migrações
    npm run db:push
    
    echo "✅ Aplicação preparada em: $DEPLOY_DIR"
}

# Função para configurar PM2
setup_pm2() {
    echo "🔧 Configurando PM2..."
    
    # Criar configuração do PM2
    cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'afiliados-bet',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    merge_logs: true,
    time: true,
    max_memory_restart: '1G'
  }]
};
EOF
    
    # Criar diretório de logs
    mkdir -p logs
    
    # Iniciar aplicação
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    echo "✅ PM2 configurado"
}

# Função para configurar Nginx
setup_nginx() {
    echo "🌐 Configurando Nginx..."
    
    NGINX_CONFIG=""
    case $OS in
        ubuntu|centos)
            NGINX_CONFIG="/etc/nginx/sites-available/afiliados"
            ;;
        macos)
            NGINX_CONFIG="/usr/local/etc/nginx/servers/afiliados"
            ;;
    esac
    
    sudo tee $NGINX_CONFIG > /dev/null <<EOF
server {
    listen 80;
    server_name localhost;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    case $OS in
        ubuntu|centos)
            sudo ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/
            sudo nginx -t
            sudo systemctl reload nginx
            sudo systemctl enable nginx
            ;;
        macos)
            sudo nginx -t
            brew services restart nginx
            ;;
    esac
    
    echo "✅ Nginx configurado"
}

# Função para criar scripts de management
create_management_scripts() {
    echo "📝 Criando scripts de gerenciamento..."
    
    # Script de status
    cat > status.sh <<'EOF'
#!/bin/bash
echo "=== Status da Aplicação ==="
pm2 list
echo ""
echo "=== Status do Nginx ==="
sudo systemctl status nginx --no-pager -l
echo ""
echo "=== Status do PostgreSQL ==="
sudo systemctl status postgresql --no-pager -l
EOF
    
    # Script de restart
    cat > restart.sh <<'EOF'
#!/bin/bash
echo "🔄 Reiniciando aplicação..."
pm2 restart afiliados-bet
echo "✅ Aplicação reiniciada"
EOF
    
    # Script de logs
    cat > logs.sh <<'EOF'
#!/bin/bash
echo "📋 Logs da aplicação:"
pm2 logs afiliados-bet --lines 50
EOF
    
    # Script de backup
    cat > backup.sh <<'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

echo "💾 Criando backup..."
pg_dump -U afiliados -h localhost afiliados_db > $BACKUP_DIR/db_$DATE.sql
tar -czf $BACKUP_DIR/files_$DATE.tar.gz . --exclude=./backups

echo "✅ Backup criado: $BACKUP_DIR"
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF
    
    chmod +x *.sh
    
    echo "✅ Scripts de gerenciamento criados"
}

# Função principal
main() {
    echo "Escolha uma opção:"
    echo "1) Instalação completa (recomendado para servidor limpo)"
    echo "2) Apenas aplicação (se dependências já estão instaladas)"
    echo "3) Apenas configuração (se aplicação já está copiada)"
    
    read -p "Opção [1-3]: " choice
    
    case $choice in
        1)
            install_dependencies
            setup_database
            setup_application
            setup_pm2
            setup_nginx
            create_management_scripts
            ;;
        2)
            setup_database
            setup_application
            setup_pm2
            setup_nginx
            create_management_scripts
            ;;
        3)
            setup_pm2
            setup_nginx
            create_management_scripts
            ;;
        *)
            echo "❌ Opção inválida"
            exit 1
            ;;
    esac
    
    echo ""
    echo "🎉 Deploy concluído com sucesso!"
    echo "================================"
    echo "📍 Aplicação rodando em: http://localhost"
    echo "🗄️ Banco: afiliados_db"
    echo "👤 Usuário DB: afiliados"
    echo "🔑 Senha DB: $(cat .db_password 2>/dev/null || echo 'Ver arquivo .db_password')"
    echo ""
    echo "📋 Comandos úteis:"
    echo "   ./status.sh    - Ver status"
    echo "   ./restart.sh   - Reiniciar"
    echo "   ./logs.sh      - Ver logs"
    echo "   ./backup.sh    - Fazer backup"
    echo ""
    echo "🌐 Para usar domínio próprio:"
    echo "   1. Aponte seu domínio para este servidor"
    echo "   2. Edite /etc/nginx/sites-available/afiliados"
    echo "   3. Execute: sudo certbot --nginx -d seudominio.com"
}

# Verificar se está sendo executado como script
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi