# Tutorial Deploy VPS Completo - AfiliadosBet

## Informações do Servidor
- **IP:** 69.62.65.24
- **Usuário:** afiliadosbet
- **Senha:** Alepoker@800
- **Domínio:** afiliadosbet.com.br
- **Repositório:** https://github.com/eaidavid/AfiliadosBet.git

## Passo 1: Conectar no Servidor

```bash
ssh afiliadosbet@69.62.65.24
```
(Digite a senha: Alepoker@800)

## Passo 2: Preparar o Sistema

Cole este comando no terminal:

```bash
sudo apt update && sudo apt upgrade -y && sudo apt install -y nginx postgresql postgresql-contrib nodejs npm git curl ufw fail2ban certbot python3-certbot-nginx && curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs && npm install -g pm2
```

## Passo 3: Configurar PostgreSQL

```bash
# Mudar para usuário postgres
sudo -i -u postgres

# Criar banco e usuário
psql << EOF
CREATE DATABASE afiliadosbet;
CREATE USER afiliadosbet WITH ENCRYPTED PASSWORD 'Alepoker@800';
GRANT ALL PRIVILEGES ON DATABASE afiliadosbet TO afiliadosbet;
ALTER USER afiliadosbet CREATEDB;
\q
EOF

# Voltar para usuário normal
exit
```

## Passo 4: Baixar o Projeto

```bash
# Ir para diretório web
cd /var/www

# Clonar repositório
sudo git clone https://github.com/eaidavid/AfiliadosBet.git afiliadosbet

# Dar permissões
sudo chown -R afiliadosbet:afiliadosbet afiliadosbet
cd afiliadosbet
```

## Passo 5: Configurar Ambiente

```bash
# Criar arquivo .env
cat > .env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://afiliadosbet:Alepoker@800@localhost:5432/afiliadosbet
SESSION_SECRET=super_secret_key_afiliadosbet_2024_$(openssl rand -base64 32)
DOMAIN=https://afiliadosbet.com.br
FRONTEND_URL=https://afiliadosbet.com.br
BACKEND_URL=https://afiliadosbet.com.br
EOF
```

## Passo 6: Instalar e Configurar Aplicação

```bash
# Instalar dependências
npm install

# Fazer build da aplicação
npm run build

# Configurar banco de dados
npm run db:push
```

## Passo 7: Configurar PM2

```bash
# Criar arquivo de configuração PM2
cat > ecosystem.config.js << EOF
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
    autorestart: true,
    watch: false,
    error_file: '/var/log/pm2/afiliadosbet-error.log',
    out_file: '/var/log/pm2/afiliadosbet-out.log',
    log_file: '/var/log/pm2/afiliadosbet-combined.log'
  }]
};
EOF

# Criar diretório de logs
sudo mkdir -p /var/log/pm2
sudo chown -R afiliadosbet:afiliadosbet /var/log/pm2

# Iniciar aplicação
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Passo 8: Configurar Nginx

```bash
sudo tee /etc/nginx/sites-available/afiliadosbet << EOF
server {
    listen 80;
    server_name afiliadosbet.com.br www.afiliadosbet.com.br;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    client_max_body_size 10M;
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/afiliadosbet /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## Passo 9: Configurar SSL (HTTPS)

```bash
# Instalar certificado SSL
sudo certbot --nginx -d afiliadosbet.com.br -d www.afiliadosbet.com.br --non-interactive --agree-tos -m admin@afiliadosbet.com.br

# Configurar renovação automática
echo "0 3 * * * certbot renew --quiet" | sudo crontab -
```

## Passo 10: Configurar Firewall

```bash
# Configurar UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## Passo 11: Verificar Funcionamento

```bash
# Verificar status dos serviços
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# Testar aplicação
curl http://localhost:5000
curl http://afiliadosbet.com.br
```

## Script de Atualização Automática

```bash
# Criar script de atualização
cat > /home/afiliadosbet/update-app.sh << 'EOF'
#!/bin/bash
cd /var/www/afiliadosbet
git pull origin main
npm install
npm run build
pm2 restart afiliadosbet
echo "Aplicação atualizada com sucesso!"
EOF

chmod +x /home/afiliadosbet/update-app.sh
```

## Comandos Úteis para Manutenção

```bash
# Ver logs da aplicação
pm2 logs afiliadosbet

# Reiniciar aplicação
pm2 restart afiliadosbet

# Atualizar aplicação
cd /var/www/afiliadosbet && ./update-app.sh

# Ver status do sistema
sudo systemctl status nginx postgresql
pm2 status

# Backup do banco
pg_dump -U afiliadosbet afiliadosbet > backup_$(date +%Y%m%d).sql
```

## Solução de Problemas

### Se a aplicação não iniciar:
```bash
pm2 logs afiliadosbet --err
```

### Se o Nginx der erro:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Se o banco não conectar:
```bash
sudo -u postgres psql -c "\l"
```

## Acesso Final

Após completar todos os passos:
- **HTTP:** http://afiliadosbet.com.br
- **HTTPS:** https://afiliadosbet.com.br

A aplicação estará rodando de forma independente, com SSL automático e atualizações simples via Git.