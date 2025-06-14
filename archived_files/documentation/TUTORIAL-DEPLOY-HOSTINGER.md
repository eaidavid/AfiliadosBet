# Tutorial: Deploy AfiliadosBet no Hostinger VPS

## Visão Geral

Este tutorial completo te ajudará a fazer deploy do sistema AfiliadosBet em um servidor VPS da Hostinger, garantindo total independência de plataformas e facilidade para futuras atualizações.

## Pré-requisitos

### 1. Hostinger VPS
- VPS Ubuntu 20.04 ou superior
- Mínimo: 2GB RAM, 40GB SSD
- Acesso SSH configurado

### 2. Domínio
- Domínio próprio (exemplo: afiliadosbet.com)
- DNS configurado para apontar para o IP do VPS

## Preparação do Servidor

### 1. Conectar ao VPS

```bash
ssh root@SEU_IP_VPS
```

### 2. Atualizar Sistema

```bash
apt update && apt upgrade -y
```

### 3. Instalar Dependências Essenciais

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# PostgreSQL
apt install postgresql postgresql-contrib -y

# Nginx
apt install nginx -y

# PM2 (Gerenciador de processos)
npm install pm2 -g

# Git
apt install git -y

# Certbot (SSL)
apt install certbot python3-certbot-nginx -y
```

## Configuração do Banco de Dados

### 1. Configurar PostgreSQL

```bash
# Entrar no PostgreSQL
sudo -u postgres psql

# Criar banco e usuário
CREATE DATABASE afiliadosbet;
CREATE USER afiliadosuser WITH PASSWORD 'senha_super_segura_123';
GRANT ALL PRIVILEGES ON DATABASE afiliadosbet TO afiliadosuser;
\q
```

### 2. Configurar Acesso Remoto (se necessário)

```bash
# Editar configuração PostgreSQL
nano /etc/postgresql/14/main/postgresql.conf

# Adicionar linha:
listen_addresses = 'localhost'

# Editar pg_hba.conf
nano /etc/postgresql/14/main/pg_hba.conf

# Adicionar linha:
local   all             afiliadosuser                           md5
```

```bash
# Reiniciar PostgreSQL
systemctl restart postgresql
```

## Deploy da Aplicação

### 1. Clonar o Projeto

```bash
# Criar diretório para aplicação
mkdir /var/www
cd /var/www

# Clonar seu repositório (substitua pela URL do seu repo)
git clone https://github.com/SEU_USUARIO/afiliadosbet.git
cd afiliadosbet
```

### 2. Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
nano .env
```

Conteúdo do arquivo `.env`:

```env
# Database
DATABASE_URL=postgresql://afiliadosuser:senha_super_segura_123@localhost:5432/afiliadosbet

# Server
NODE_ENV=production
PORT=5000

# Session Secret
SESSION_SECRET=sua_chave_super_secreta_aqui_123456789

# Domain (seu domínio real)
DOMAIN=https://afiliadosbet.com

# Admin Config
ADMIN_EMAIL=admin@afiliadosbet.com
ADMIN_PASSWORD=admin123

# Optional: External APIs
# OPENAI_API_KEY=sk-...
# STRIPE_SECRET_KEY=sk_...
```

### 3. Instalar Dependências e Build

```bash
# Instalar dependências
npm install

# Build do frontend
npm run build

# Executar migrações do banco
npm run db:push
```

### 4. Configurar PM2

```bash
# Criar arquivo de configuração PM2
nano ecosystem.config.js
```

Conteúdo do `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'afiliadosbet',
    script: 'server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pm2/afiliadosbet-error.log',
    out_file: '/var/log/pm2/afiliadosbet-out.log',
    log_file: '/var/log/pm2/afiliadosbet-combined.log'
  }]
};
```

### 5. Iniciar Aplicação

```bash
# Criar diretório de logs
mkdir -p /var/log/pm2

# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração PM2
pm2 save

# Configurar PM2 para iniciar automaticamente
pm2 startup
```

## Configuração do Nginx

### 1. Criar Configuração do Site

```bash
nano /etc/nginx/sites-available/afiliadosbet
```

Conteúdo da configuração:

```nginx
server {
    listen 80;
    server_name afiliadosbet.com www.afiliadosbet.com;

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name afiliadosbet.com www.afiliadosbet.com;

    # SSL certificates (serão criados pelo Certbot)
    ssl_certificate /etc/letsencrypt/live/afiliadosbet.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/afiliadosbet.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Client upload limit
    client_max_body_size 10M;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security - hide sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ \.(env|md|txt|json)$ {
        deny all;
    }
}
```

### 2. Ativar Site

```bash
# Criar link simbólico
ln -s /etc/nginx/sites-available/afiliadosbet /etc/nginx/sites-enabled/

# Remover site padrão
rm /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

## Configuração SSL (HTTPS)

### 1. Obter Certificado SSL

```bash
# Parar Nginx temporariamente
systemctl stop nginx

# Obter certificado
certbot certonly --standalone -d afiliadosbet.com -d www.afiliadosbet.com

# Iniciar Nginx novamente
systemctl start nginx
```

### 2. Configurar Renovação Automática

```bash
# Testar renovação
certbot renew --dry-run

# Adicionar cron job para renovação automática
crontab -e

# Adicionar linha (renovar todo dia 3 da manhã):
0 3 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

## Configuração de Firewall

```bash
# Instalar UFW se não estiver instalado
apt install ufw -y

# Configurar regras básicas
ufw default deny incoming
ufw default allow outgoing

# Permitir SSH, HTTP e HTTPS
ufw allow ssh
ufw allow 80
ufw allow 443

# Ativar firewall
ufw enable

# Verificar status
ufw status
```

## Scripts de Atualização

### 1. Criar Script de Deploy

```bash
nano /var/www/afiliadosbet/deploy.sh
chmod +x /var/www/afiliadosbet/deploy.sh
```

Conteúdo do `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Iniciando deploy do AfiliadosBet..."

# Ir para diretório da aplicação
cd /var/www/afiliadosbet

# Fazer backup do banco (opcional)
echo "📦 Fazendo backup do banco..."
pg_dump -U afiliadosuser -h localhost afiliadosbet > backup_$(date +%Y%m%d_%H%M%S).sql

# Atualizar código
echo "⬇️ Baixando atualizações..."
git pull origin main

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build da aplicação
echo "🔨 Fazendo build..."
npm run build

# Executar migrações
echo "🗄️ Executando migrações..."
npm run db:push

# Reiniciar aplicação
echo "🔄 Reiniciando aplicação..."
pm2 restart afiliadosbet

echo "✅ Deploy concluído com sucesso!"
echo "🌐 Site: https://afiliadosbet.com"

# Verificar status
pm2 status
```

### 2. Criar Script de Monitoramento

```bash
nano /var/www/afiliadosbet/monitor.sh
chmod +x /var/www/afiliadosbet/monitor.sh
```

Conteúdo do `monitor.sh`:

```bash
#!/bin/bash

echo "📊 Status do Sistema AfiliadosBet"
echo "================================="

# Status PM2
echo "🟢 Status da Aplicação:"
pm2 status

# Status do banco
echo -e "\n🗄️ Status PostgreSQL:"
systemctl status postgresql --no-pager -l

# Status Nginx
echo -e "\n🌐 Status Nginx:"
systemctl status nginx --no-pager -l

# Uso de memória
echo -e "\n💾 Uso de Memória:"
free -h

# Espaço em disco
echo -e "\n💿 Espaço em Disco:"
df -h

# Últimos logs da aplicação
echo -e "\n📋 Últimos Logs:"
pm2 logs afiliadosbet --lines 10
```

## Configuração de Backup Automático

### 1. Script de Backup

```bash
nano /var/www/afiliadosbet/backup.sh
chmod +x /var/www/afiliadosbet/backup.sh
```

Conteúdo do `backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/afiliadosbet"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do banco de dados
echo "🗄️ Fazendo backup do banco..."
pg_dump -U afiliadosuser -h localhost afiliadosbet > $BACKUP_DIR/db_backup_$DATE.sql

# Backup dos arquivos
echo "📁 Fazendo backup dos arquivos..."
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz -C /var/www afiliadosbet --exclude=node_modules

# Remover backups antigos (manter apenas 7 dias)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup concluído: $BACKUP_DIR"
```

### 2. Automatizar Backups

```bash
# Adicionar ao cron
crontab -e

# Backup diário às 2h da manhã
0 2 * * * /var/www/afiliadosbet/backup.sh
```

## Procedimento para Atualizações

### Atualizações Automáticas

```bash
# Executar script de deploy
cd /var/www/afiliadosbet
./deploy.sh
```

### Atualizações Manuais

1. **Conectar ao servidor:**
   ```bash
   ssh root@SEU_IP_VPS
   ```

2. **Navegar para o projeto:**
   ```bash
   cd /var/www/afiliadosbet
   ```

3. **Verificar status atual:**
   ```bash
   ./monitor.sh
   ```

4. **Fazer backup:**
   ```bash
   ./backup.sh
   ```

5. **Executar deploy:**
   ```bash
   ./deploy.sh
   ```

## Configuração de Domínio no Hostinger

### 1. Configurar DNS

No painel da Hostinger:

1. Vá em **Domínios** → **Gerenciar**
2. Clique em **Zona DNS**
3. Configure os registros:

```
Tipo    Nome    Valor               TTL
A       @       SEU_IP_VPS          3600
A       www     SEU_IP_VPS          3600
CNAME   api     afiliadosbet.com    3600
```

### 2. Aguardar Propagação

- Propagação DNS: 24-48 horas
- Teste com: `nslookup afiliadosbet.com`

## Monitoramento e Manutenção

### 1. Logs Importantes

```bash
# Logs da aplicação
pm2 logs afiliadosbet

# Logs do Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs do sistema
journalctl -u nginx -f
journalctl -u postgresql -f
```

### 2. Comandos Úteis

```bash
# Reiniciar serviços
pm2 restart afiliadosbet
systemctl restart nginx
systemctl restart postgresql

# Verificar status
pm2 status
systemctl status nginx
systemctl status postgresql

# Verificar processos
ps aux | grep node
netstat -tlnp | grep :5000
```

### 3. Resolução de Problemas

**Aplicação não responde:**
```bash
pm2 restart afiliadosbet
pm2 logs afiliadosbet --lines 50
```

**Erro 502 Bad Gateway:**
```bash
# Verificar se aplicação está rodando
pm2 status
# Verificar logs do Nginx
tail -f /var/log/nginx/error.log
```

**Banco de dados inacessível:**
```bash
systemctl status postgresql
sudo -u postgres psql -c "SELECT 1;"
```

## Segurança Adicional

### 1. Configurar Fail2Ban

```bash
apt install fail2ban -y

nano /etc/fail2ban/jail.local
```

Conteúdo:

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[ssh]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
```

```bash
systemctl restart fail2ban
```

### 2. Atualizar Senhas Padrão

```bash
# Alterar senha do PostgreSQL
sudo -u postgres psql
ALTER USER afiliadosuser PASSWORD 'nova_senha_super_segura_456';
\q

# Atualizar .env com nova senha
nano /var/www/afiliadosbet/.env
```

## Custos Estimados (Hostinger)

- **VPS 2GB**: ~R$ 30-50/mês
- **Domínio .com**: ~R$ 40-60/ano
- **Total mensal**: ~R$ 35-55

## Conclusão

Seguindo este tutorial, você terá:

✅ Sistema independente rodando no seu próprio servidor
✅ HTTPS configurado automaticamente
✅ Backups automáticos diários
✅ Scripts para atualizações fáceis
✅ Monitoramento completo
✅ Segurança robusta

**Próximos passos recomendados:**
1. Configurar monitoramento adicional (Uptimerobot, etc.)
2. Implementar CDN (Cloudflare)
3. Configurar alertas por email
4. Documentar procedimentos específicos da sua equipe

Este setup garante total controle sobre sua aplicação e facilita manutenções futuras.