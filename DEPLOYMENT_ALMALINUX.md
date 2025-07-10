# Guia de Deployment - AfiliadosBet no AlmaLinux com Webmin

## Visão Geral
Este guia fornece instruções completas para instalar e configurar o sistema AfiliadosBet em um servidor AlmaLinux usando o painel de controle Webmin para gerenciamento.

## Pré-requisitos
- Servidor AlmaLinux 8/9 (mínimo 2GB RAM, 20GB SSD)
- Acesso root via SSH
- Domínio configurado (ex: afiliadosbet.com.br)
- Repositório GitHub com o projeto

## 1. Preparação do Servidor

### 1.1 Atualização do Sistema
```bash
# Conectar via SSH como root
ssh root@seu-servidor.com

# Atualizar o sistema
dnf update -y

# Instalar pacotes essenciais
dnf install -y curl wget git vim unzip
```

### 1.2 Configuração de Firewall
```bash
# Verificar status do firewall
systemctl status firewalld

# Abrir portas necessárias
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --permanent --add-port=10000/tcp  # Webmin
firewall-cmd --permanent --add-port=3000/tcp   # Node.js (temporário)
firewall-cmd --reload
```

## 2. Instalação do Webmin

### 2.1 Adicionar Repositório e Instalar
```bash
# Criar arquivo de repositório
cat > /etc/yum.repos.d/webmin.repo << EOF
[Webmin]
name=Webmin Distribution Neutral
baseurl=https://download.webmin.com/download/yum/
enabled=1
gpgcheck=1
gpgkey=http://www.webmin.com/jcameron-key.asc
EOF

# Instalar Webmin
dnf install -y webmin

# Iniciar e habilitar Webmin
systemctl start webmin
systemctl enable webmin
```

### 2.2 Configurar Webmin
```bash
# Alterar porta padrão (opcional)
sed -i 's/port=10000/port=10000/' /etc/webmin/miniserv.conf

# Reiniciar Webmin
systemctl restart webmin
```

**Acesso:** https://seu-servidor.com:10000
**Login:** root / sua-senha-root

## 3. Instalação do Node.js e Dependências

### 3.1 Instalar Node.js 20
```bash
# Adicionar repositório NodeSource
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -

# Instalar Node.js
dnf install -y nodejs

# Verificar versões
node --version
npm --version
```

### 3.2 Instalar PM2 (Gerenciador de Processos)
```bash
npm install -g pm2

# Configurar PM2 para iniciar com o sistema
pm2 startup systemd
# Execute o comando que aparece na tela
```

## 4. Instalação do PostgreSQL

### 4.1 Instalar PostgreSQL 15
```bash
# Instalar repositório PostgreSQL
dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm

# Instalar PostgreSQL
dnf install -y postgresql15-server postgresql15

# Inicializar base de dados
/usr/pgsql-15/bin/postgresql-15-setup initdb

# Iniciar e habilitar PostgreSQL
systemctl start postgresql-15
systemctl enable postgresql-15
```

### 4.2 Configurar PostgreSQL
```bash
# Entrar como usuário postgres
sudo -u postgres psql

-- Dentro do psql:
CREATE DATABASE afiliadosbet;
CREATE USER afiliadosbet WITH ENCRYPTED PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE afiliadosbet TO afiliadosbet;
\q

# Configurar autenticação
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /var/lib/pgsql/15/data/postgresql.conf
```

### 4.3 Editar pg_hba.conf
```bash
vim /var/lib/pgsql/15/data/pg_hba.conf

# Adicionar linha para autenticação local:
local   afiliadosbet    afiliadosbet                            md5

# Reiniciar PostgreSQL
systemctl restart postgresql-15
```

## 5. Instalação do Nginx

### 5.1 Instalar e Configurar Nginx
```bash
# Instalar Nginx
dnf install -y nginx

# Iniciar e habilitar
systemctl start nginx
systemctl enable nginx
```

### 5.2 Configurar Virtual Host
```bash
# Criar configuração do site
cat > /etc/nginx/conf.d/afiliadosbet.conf << EOF
server {
    listen 80;
    server_name afiliadosbet.com.br www.afiliadosbet.com.br;

    # Redirecionar para HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name afiliadosbet.com.br www.afiliadosbet.com.br;

    # Certificados SSL (configurar depois)
    ssl_certificate /etc/ssl/certs/afiliadosbet.crt;
    ssl_certificate_key /etc/ssl/private/afiliadosbet.key;

    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Diretório do projeto
    root /var/www/afiliadosbet/dist/public;
    index index.html;

    # Logs
    access_log /var/log/nginx/afiliadosbet_access.log;
    error_log /var/log/nginx/afiliadosbet_error.log;

    # Servir arquivos estáticos
    location / {
        try_files \$uri \$uri/ @nodejs;
    }

    # Proxy para Node.js
    location @nodejs {
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

    # API routes
    location /api/ {
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

# Testar configuração
nginx -t

# Recarregar Nginx
systemctl reload nginx
```

## 6. Configuração SSL com Let's Encrypt

### 6.1 Instalar Certbot
```bash
# Instalar certbot
dnf install -y certbot python3-certbot-nginx

# Obter certificado SSL
certbot --nginx -d afiliadosbet.com.br -d www.afiliadosbet.com.br

# Configurar renovação automática
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

## 7. Deploy da Aplicação

### 7.1 Criar Diretório e Clonar Projeto
```bash
# Criar diretório
mkdir -p /var/www/afiliadosbet
cd /var/www/afiliadosbet

# Clonar projeto do GitHub
git clone https://github.com/seu-usuario/afiliadosbet.git .

# Configurar permissões
chown -R nginx:nginx /var/www/afiliadosbet
chmod -R 755 /var/www/afiliadosbet
```

### 7.2 Configurar Variáveis de Ambiente
```bash
# Criar arquivo .env
cat > /var/www/afiliadosbet/.env << EOF
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://afiliadosbet:sua_senha_segura@localhost:5432/afiliadosbet

# Session
SESSION_SECRET=gere_uma_chave_secreta_muito_forte_aqui

# Outros
DOMAIN=afiliadosbet.com.br
EOF

# Configurar permissões
chmod 600 /var/www/afiliadosbet/.env
chown nginx:nginx /var/www/afiliadosbet/.env
```

### 7.3 Instalar Dependências e Build
```bash
cd /var/www/afiliadosbet

# Instalar dependências
npm ci --production

# Fazer build da aplicação
npm run build

# Executar migrations do banco
npm run db:push
```

### 7.4 Configurar PM2
```bash
# Criar arquivo de configuração PM2
cat > /var/www/afiliadosbet/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'afiliadosbet',
    script: './dist/index.js',
    cwd: '/var/www/afiliadosbet',
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
};
EOF

# Criar diretório de logs
mkdir -p /var/log/afiliadosbet
chown nginx:nginx /var/log/afiliadosbet

# Iniciar aplicação
pm2 start ecosystem.config.js
pm2 save
```

## 8. Configuração via Webmin

### 8.1 Acesso ao Webmin
1. Abra https://seu-servidor.com:10000
2. Faça login com root
3. Configure os seguintes módulos:

### 8.2 Módulos Importantes no Webmin
- **System Logs**: Monitorar logs do sistema
- **Running Processes**: Gerenciar processos
- **Nginx Webserver**: Gerenciar Nginx
- **PostgreSQL Database Server**: Gerenciar banco
- **File Manager**: Gerenciar arquivos
- **Cron Jobs**: Agendar tarefas

### 8.3 Configurar Backup Automático
```bash
# Criar script de backup
cat > /usr/local/bin/backup-afiliadosbet.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/afiliadosbet"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do banco de dados
pg_dump -U afiliadosbet -h localhost afiliadosbet > $BACKUP_DIR/db_$DATE.sql

# Backup dos arquivos
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/afiliadosbet

# Manter apenas os últimos 7 backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup concluído: $DATE"
EOF

# Tornar executável
chmod +x /usr/local/bin/backup-afiliadosbet.sh

# Agendar backup diário às 3h
echo "0 3 * * * /usr/local/bin/backup-afiliadosbet.sh" | crontab -
```

## 9. Script de Deploy Automático

### 9.1 Criar Script de Atualização
```bash
cat > /usr/local/bin/deploy-afiliadosbet.sh << 'EOF'
#!/bin/bash
set -e

cd /var/www/afiliadosbet

echo "Iniciando deploy..."

# Backup do banco antes da atualização
/usr/local/bin/backup-afiliadosbet.sh

# Parar aplicação
pm2 stop afiliadosbet

# Atualizar código
git pull origin main

# Instalar dependências
npm ci --production

# Fazer build
npm run build

# Executar migrations
npm run db:push

# Reiniciar aplicação
pm2 restart afiliadosbet

echo "Deploy concluído com sucesso!"
EOF

chmod +x /usr/local/bin/deploy-afiliadosbet.sh
```

## 10. Monitoramento e Manutenção

### 10.1 Status dos Serviços
```bash
# Verificar status dos serviços
systemctl status nginx
systemctl status postgresql-15
pm2 status

# Ver logs
journalctl -u nginx
journalctl -u postgresql-15
pm2 logs afiliadosbet
```

### 10.2 Comandos Úteis
```bash
# Reiniciar todos os serviços
systemctl restart nginx postgresql-15
pm2 restart afiliadosbet

# Verificar uso de recursos
htop
df -h
free -h

# Monitorar logs em tempo real
tail -f /var/log/nginx/afiliadosbet_access.log
pm2 logs afiliadosbet --lines 100
```

## 11. Segurança Adicional

### 11.1 Configurar Fail2ban
```bash
# Instalar fail2ban
dnf install -y fail2ban

# Configurar jail para SSH
cat > /etc/fail2ban/jail.local << EOF
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/secure
maxretry = 3
bantime = 3600
EOF

# Iniciar fail2ban
systemctl start fail2ban
systemctl enable fail2ban
```

### 11.2 Configurar Atualizações Automáticas
```bash
# Instalar dnf-automatic
dnf install -y dnf-automatic

# Configurar atualizações de segurança
sed -i 's/apply_updates = no/apply_updates = yes/' /etc/dnf/automatic.conf

# Habilitar atualizações automáticas
systemctl enable --now dnf-automatic.timer
```

## 12. Verificação Final

### 12.1 Teste de Funcionamento
1. Acesse https://afiliadosbet.com.br
2. Teste login: admin@afiliadosbet.com.br / admin123
3. Verifique todas as funcionalidades
4. Teste de carga com algumas requisições

### 12.2 URLs de Acesso
- **Site Principal**: https://afiliadosbet.com.br
- **Webmin**: https://afiliadosbet.com.br:10000
- **Logs PM2**: `pm2 logs afiliadosbet`

## Solução de Problemas

### Problema: Site não carrega
```bash
# Verificar status
systemctl status nginx
pm2 status

# Ver logs
journalctl -u nginx -f
pm2 logs afiliadosbet
```

### Problema: Erro de banco de dados
```bash
# Verificar PostgreSQL
systemctl status postgresql-15
sudo -u postgres psql -c "\l"

# Testar conexão
psql -U afiliadosbet -h localhost -d afiliadosbet
```

### Problema: SSL não funciona
```bash
# Renovar certificado
certbot renew
systemctl reload nginx
```

## Contatos e Suporte

Para suporte técnico ou dúvidas sobre o deployment, entre em contato através do GitHub do projeto.

---

**Versão do Documento**: 1.0  
**Data**: Julho 2025  
**Sistema**: AfiliadosBet v1.0