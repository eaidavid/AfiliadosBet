#!/bin/bash

# AfiliadosBet Universal Deployment Script
# Works on Ubuntu, CentOS, Debian, and other Linux distributions

set -e

echo "🚀 Starting AfiliadosBet deployment..."

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Detect OS
if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
else
    echo "Cannot detect OS. Exiting."
    exit 1
fi

echo "Detected OS: $OS $VER"

# Install Node.js 20
install_nodejs() {
    echo "📦 Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
}

# Install PostgreSQL
install_postgresql() {
    echo "🗄️ Installing PostgreSQL..."
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
}

# Install PM2
install_pm2() {
    echo "⚙️ Installing PM2..."
    sudo npm install -g pm2
}

# Install Nginx
install_nginx() {
    echo "🌐 Installing Nginx..."
    sudo apt-get install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
}

# Setup database
setup_database() {
    echo "🔧 Setting up database..."
    sudo -u postgres createdb afiliadosbet 2>/dev/null || echo "Database already exists"
    sudo -u postgres psql -c "CREATE USER afiliadosbet WITH PASSWORD 'secure_password_123';" 2>/dev/null || echo "User already exists"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE afiliadosbet TO afiliadosbet;" 2>/dev/null || echo "Permissions already granted"
}

# Clone and setup application
setup_application() {
    echo "📱 Setting up application..."
    
    # Create app directory
    sudo mkdir -p /var/www/afiliadosbet
    sudo chown $USER:$USER /var/www/afiliadosbet
    
    # Copy current directory to /var/www/afiliadosbet
    cp -r . /var/www/afiliadosbet/
    cd /var/www/afiliadosbet
    
    # Install dependencies
    npm install --production
    
    # Build application
    npm run build
    
    # Create environment file
    cat > .env << EOF
NODE_ENV=production
DATABASE_URL=postgresql://afiliadosbet:secure_password_123@localhost:5432/afiliadosbet
SESSION_SECRET=$(openssl rand -base64 32)
PORT=3000
HOST=0.0.0.0
EOF
    
    # Setup database schema
    npm run db:push
    
    echo "✅ Application setup complete"
}

# Configure PM2
configure_pm2() {
    echo "🔄 Configuring PM2..."
    cd /var/www/afiliadosbet
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'afiliadosbet',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/afiliadosbet/error.log',
    out_file: '/var/log/afiliadosbet/out.log',
    log_file: '/var/log/afiliadosbet/combined.log',
    time: true
  }]
}
EOF
    
    # Create log directory
    sudo mkdir -p /var/log/afiliadosbet
    sudo chown $USER:$USER /var/log/afiliadosbet
    
    # Start application with PM2
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    echo "✅ PM2 configuration complete"
}

# Configure Nginx
configure_nginx() {
    echo "🌐 Configuring Nginx..."
    
    sudo tee /etc/nginx/sites-available/afiliadosbet << EOF
server {
    listen 80;
    server_name _;
    
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
        proxy_read_timeout 86400;
    }
    
    location /api/health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/afiliadosbet /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    sudo nginx -t
    sudo systemctl reload nginx
    
    echo "✅ Nginx configuration complete"
}

# Setup firewall
setup_firewall() {
    echo "🔒 Configuring firewall..."
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    sudo ufw --force enable
    echo "✅ Firewall configured"
}

# Main deployment function
main() {
    echo "Starting deployment for $OS..."
    
    # Update system
    sudo apt-get update
    
    # Install components
    install_nodejs
    install_postgresql
    install_pm2
    install_nginx
    
    # Setup services
    setup_database
    setup_application
    configure_pm2
    configure_nginx
    setup_firewall
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📊 Application Status:"
    pm2 status
    echo ""
    echo "🌐 Your application is now running at:"
    echo "   http://$(curl -s ifconfig.me)"
    echo "   http://localhost"
    echo ""
    echo "📋 Management Commands:"
    echo "   pm2 status              - Check application status"
    echo "   pm2 logs afiliadosbet   - View application logs"
    echo "   pm2 restart afiliadosbet - Restart application"
    echo "   pm2 stop afiliadosbet   - Stop application"
    echo ""
    echo "🔧 Configuration files:"
    echo "   /var/www/afiliadosbet/.env - Environment variables"
    echo "   /etc/nginx/sites-available/afiliadosbet - Nginx configuration"
    echo ""
}

# Run main function
main