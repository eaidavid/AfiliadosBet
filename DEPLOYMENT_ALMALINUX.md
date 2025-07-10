# Guia de Deployment - AfiliadosBet no AlmaLinux com Webmin

## Visão Geral
Este guia fornece instruções separadas para terminal SSH e painel Webmin para instalar e configurar o sistema AfiliadosBet em um servidor AlmaLinux.

## Pré-requisitos
- Servidor AlmaLinux 8/9 (mínimo 2GB RAM, 20GB SSD)
- Acesso root via SSH
- Domínio configurado (ex: afiliadosbet.com.br)
- Repositório GitHub com o projeto

---

# PARTE 1: COMANDOS DO TERMINAL SSH

Execute todos estes comandos conectado via SSH como root:

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
CREATE DATABASE afiliadosbetdb;
CREATE USER afiliadosbet WITH ENCRYPTED PASSWORD 'Alepoker800';
GRANT ALL PRIVILEGES ON DATABASE afiliadosbetdb TO afiliadosbet;
\q

# Configurar autenticação
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /var/lib/pgsql/15/data/postgresql.conf
```

### 4.3 Editar pg_hba.conf
```bash
vim /var/lib/pgsql/15/data/pg_hba.conf

# Adicionar linha para autenticação local:
local   afiliadosbetdb    afiliadosbet                            md5

# Reiniciar PostgreSQL
systemctl restart postgresql-15
```

### 4.4 Criar Diretório SQLite (Fallback)
```bash
# Criar diretório para banco SQLite (fallback em desenvolvimento)
mkdir -p /var/www/afiliadosbet/data
chown -R nginx:nginx /var/www/afiliadosbet/data
chmod 755 /var/www/afiliadosbet/data
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
DATABASE_URL=postgresql://afiliadosbet:Alepoker800@localhost:5432/afiliadosbetdb

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

---

# PARTE 2: CONFIGURAÇÃO VIA PAINEL WEBMIN

## 8. Acessar o Painel Webmin

### 8.1 Como Acessar
1. Abra seu navegador
2. Digite: `https://seu-servidor.com:10000`
3. Faça login com: **usuário:** root / **senha:** sua-senha-root
4. Aceite o certificado SSL (temporário)

### 8.2 Configurações Iniciais no Painel

#### A) Configurar Idioma (Opcional)
1. Clique em **"Webmin Configuration"**
2. Clique em **"Language and Locale"**
3. Selecione **"Portuguese (Brazil)"** se preferir
4. Clique **"Save"**

#### B) Configurar Timezone
1. Vá em **"Hardware" → "System Time"**
2. Selecione o timezone correto (America/Sao_Paulo)
3. Clique **"Save"**

### 8.3 Monitoramento do Sistema

#### A) Visualizar Processos
1. Vá em **"System" → "Running Processes"**
2. Procure por:
   - `nginx` (servidor web)
   - `postgres` (banco de dados)
   - `PM2` (gerenciador Node.js)

#### B) Monitorar Logs
1. Vá em **"System" → "System Logs"**
2. Visualize logs importantes:
   - `/var/log/messages` (sistema)
   - `/var/log/nginx/access.log` (acessos web)
   - `/var/log/nginx/error.log` (erros web)

#### C) Gerenciar Arquivos
1. Vá em **"Others" → "File Manager"**
2. Navegue até `/var/www/afiliadosbet`
3. Aqui você pode:
   - Editar arquivos de configuração
   - Fazer upload de arquivos
   - Fazer backup manual

### 8.4 Configurar Backup via Painel

#### A) Agendar Backup Automático
1. Vá em **"System" → "Scheduled Cron Jobs"**
2. Clique **"Create a new scheduled cron job"**
3. Configure:
   - **Execute:** `/usr/local/bin/backup-afiliadosbet.sh`
   - **Times:** `Special time: Daily (at midnight)`
   - **User:** `root`
4. Clique **"Create"**

#### B) Configurar Notificações de Backup
1. Vá em **"System" → "Scheduled Cron Jobs"**
2. Edite o job criado
3. Em **"Email output to"** digite seu email
4. Clique **"Save"**

### 8.5 Gerenciar Banco de Dados

#### A) Acessar PostgreSQL
1. Vá em **"Servers" → "PostgreSQL Database Server"**
2. Se aparecer erro, clique **"Module Config"**
3. Configure:
   - **PostgreSQL executable:** `/usr/pgsql-15/bin/psql`
   - **Start server command:** `systemctl start postgresql-15`
4. Clique **"Save"**

#### B) Gerenciar Database
1. No módulo PostgreSQL, clique **"Login to database"**
2. Use: **Database:** `afiliadosbet` / **User:** `afiliadosbet`
3. Aqui você pode:
   - Ver tabelas
   - Fazer backup do banco
   - Executar queries

### 8.6 Gerenciar Servidor Web

#### A) Configurar Nginx
1. Vá em **"Servers" → "Nginx Webserver"**
2. Se não aparecer, instale o módulo via **"Un-used Modules"**
3. Aqui você pode:
   - Ver configurações
   - Testar configuração
   - Reiniciar servidor

#### B) Monitorar SSL
1. No módulo Nginx, vá em **"Global Configuration"**
2. Verifique certificados SSL
3. Configure renovação automática

### 8.7 Configurar Alertas e Monitoramento

#### A) Configurar Alertas de Sistema
1. Vá em **"System" → "System and Server Status"**
2. Clique **"Edit Monitored Services"**
3. Adicione monitoramento para:
   - **HTTP Server (port 80)**
   - **HTTPS Server (port 443)**
   - **PostgreSQL Server**
   - **Node.js Application (port 3000)**

#### B) Configurar Notificações por Email
1. No módulo de Status, clique **"Email Settings"**
2. Configure seu servidor de email
3. Teste o envio

### 8.8 Configurar Backup Automático
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

# OBSERVAÇÃO: O agendamento via cron já foi configurado no terminal
```

---

# PARTE 3: COMANDOS ADICIONAIS DO TERMINAL

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

---

# PARTE 4: MONITORAMENTO (TERMINAL + PAINEL)

## 10. Monitoramento via Terminal

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

## 10.3 Monitoramento via Painel Webmin

### A) Dashboard Principal
1. Acesse **"System Information"** na página inicial
2. Monitore:
   - **CPU Usage** (uso do processador)
   - **Memory Usage** (uso de memória)
   - **Disk Usage** (uso do disco)
   - **Network Traffic** (tráfego de rede)

### B) Monitoramento em Tempo Real
1. Vá em **"System" → "Running Processes"**
2. Clique **"Refresh"** para atualizar
3. Ordene por **"CPU"** para ver processos que mais consomem

### C) Verificar Logs via Painel
1. **"System" → "System Logs"**
2. Selecione o log desejado
3. Use **"Search"** para procurar erros específicos

### D) Alertas Automáticos
1. **"System" → "System and Server Status"**
2. Configure limites para:
   - CPU acima de 80%
   - Memória acima de 90%
   - Disco acima de 85%

---

# PARTE 5: COMANDOS DE SEGURANÇA (TERMINAL)

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

---

# PARTE 6: VERIFICAÇÃO E MANUTENÇÃO

## 12. Verificação Final (Terminal)

### 12.1 Teste de Funcionamento
1. Acesse https://afiliadosbet.com.br
2. Teste login: admin@afiliadosbet.com.br / admin123
3. Verifique todas as funcionalidades
4. Teste de carga com algumas requisições

### 12.2 URLs de Acesso
- **Site Principal**: https://afiliadosbet.com.br
- **Webmin**: https://afiliadosbet.com.br:10000
- **Logs PM2**: `pm2 logs afiliadosbet`

## 12.3 Verificação via Painel Webmin

### A) Testar Acesso ao Site
1. **"System" → "System and Server Status"**
2. Verifique se todos os serviços estão **"Up"**
3. Teste conectividade HTTP/HTTPS

### B) Verificar Banco de Dados
1. **"Servers" → "PostgreSQL Database Server"**
2. **"Login to database"**
3. Execute query teste: `SELECT count(*) FROM users;`

### C) Monitorar Performance
1. **"System Information"** (página inicial)
2. Verifique gráficos de uso
3. Se algo estiver alto, investigue via **"Running Processes"**

---

# PARTE 7: SOLUÇÃO DE PROBLEMAS

## Resolução via Terminal

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

## Resolução via Painel Webmin

### Problema: Site não carrega
1. **"System" → "System and Server Status"**
2. Verifique status dos serviços
3. Se algum estiver **"Down"**, clique **"Start"**

### Problema: Erro de banco
1. **"Servers" → "PostgreSQL Database Server"**
2. Verifique se o serviço está rodando
3. Use **"Start Server"** se necessário

### Problema: Logs com erros
1. **"System" → "System Logs"**
2. Procure por erros recentes
3. Use **"Search"** para filtrar por palavra-chave

### Problema: Alto uso de recursos
1. **"System" → "Running Processes"**
2. Identifique processo problemático
3. Use **"Kill Process"** se necessário (cuidado!)

---

# RESUMO RÁPIDO

## No Terminal SSH (como root):
```bash
# Deploy inicial
bash deploy-almalinux.sh

# Configurar SSL depois
certbot --nginx -d seudominio.com

# Comandos úteis
pm2 status                    # Ver aplicação
systemctl status nginx        # Ver servidor web
systemctl status postgresql-15 # Ver banco
```

## No Painel Webmin:
1. **Acesso:** https://seuservidor.com:10000
2. **Monitoramento:** System Information + Running Processes
3. **Logs:** System → System Logs
4. **Backup:** System → Scheduled Cron Jobs
5. **Banco:** Servers → PostgreSQL Database Server

## Contatos e Suporte

Para suporte técnico ou dúvidas sobre o deployment, entre em contato através do GitHub do projeto.

---

**Versão do Documento**: 1.0  
**Data**: Julho 2025  
**Sistema**: AfiliadosBet v1.0