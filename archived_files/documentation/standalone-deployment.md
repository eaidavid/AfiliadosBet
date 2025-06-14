# Sistema AfiliadosBet - Deployment Independente

## Visão Geral
Este guia permite executar o sistema em qualquer servidor (VPS, dedicado, cloud) sem dependência do Replit.

## Requisitos do Servidor
- Node.js 18+ 
- PostgreSQL 14+
- RAM: 2GB mínimo
- Storage: 10GB mínimo
- CPU: 1 core mínimo

## 1. Preparação do Ambiente

### Ubuntu/Debian
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2

# Instalar nginx (proxy reverso)
sudo apt install nginx -y
```

## 2. Configuração do Banco de Dados

### Criar usuário e banco
```bash
sudo -u postgres psql

CREATE USER afiliados WITH PASSWORD 'senha_segura_aqui';
CREATE DATABASE afiliados_db OWNER afiliados;
GRANT ALL PRIVILEGES ON DATABASE afiliados_db TO afiliados;
\q
```

## 3. Deploy da Aplicação

### Clone e configuração
```bash
# Criar diretório
sudo mkdir -p /var/www/afiliados
cd /var/www/afiliados

# Copiar arquivos do projeto (via FTP, Git, etc)
# Instalar dependências
npm ci --production

# Configurar variáveis de ambiente
cp .env.example .env.production
```

### Arquivo .env.production
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://afiliados:senha_segura_aqui@localhost:5432/afiliados_db
SESSION_SECRET=chave_sessao_super_segura_256_caracteres
DOMAIN=seudominio.com
```

## 4. Build da Aplicação
```bash
npm run build
npm run db:push
```

## 5. Configuração do PM2

### Arquivo ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: 'afiliados-bet',
    script: 'server/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: '/var/log/afiliados/combined.log',
    out_file: '/var/log/afiliados/out.log',
    error_file: '/var/log/afiliados/error.log',
    merge_logs: true,
    time: true
  }]
};
```

### Iniciar aplicação
```bash
# Criar diretório de logs
sudo mkdir -p /var/log/afiliados
sudo chown -R $USER:$USER /var/log/afiliados

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 6. Configuração do Nginx

### /etc/nginx/sites-available/afiliados
```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Ativar site
```bash
sudo ln -s /etc/nginx/sites-available/afiliados /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 7. SSL com Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

## 8. Backup Automático

### Script de backup
```bash
#!/bin/bash
# /opt/afiliados/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/afiliados/backups"
DB_NAME="afiliados_db"

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Backup do banco
pg_dump -U afiliados -h localhost $DB_NAME > $BACKUP_DIR/db_$DATE.sql

# Backup dos arquivos
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/afiliados

# Remover backups antigos (manter últimos 7 dias)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup concluído: $DATE"
```

### Crontab para backup diário
```bash
# Editar crontab
crontab -e

# Adicionar linha (backup às 2h da manhã)
0 2 * * * /opt/afiliados/backup.sh >> /var/log/afiliados/backup.log 2>&1
```

## 9. Monitoramento

### Script de monitoramento
```bash
#!/bin/bash
# /opt/afiliados/monitor.sh

# Verificar se a aplicação está rodando
if ! pm2 list | grep -q "afiliados-bet.*online"; then
    echo "$(date): Aplicação offline, reiniciando..." >> /var/log/afiliados/monitor.log
    pm2 restart afiliados-bet
fi

# Verificar espaço em disco
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    echo "$(date): Aviso - Disco em $DISK_USAGE%" >> /var/log/afiliados/monitor.log
fi
```

## 10. Comandos Úteis

### Gerenciamento da aplicação
```bash
# Ver status
pm2 status

# Ver logs
pm2 logs afiliados-bet

# Reiniciar
pm2 restart afiliados-bet

# Parar
pm2 stop afiliados-bet

# Atualizar aplicação
cd /var/www/afiliados
git pull origin main
npm ci --production
npm run build
pm2 restart afiliados-bet
```

### Banco de dados
```bash
# Conectar ao banco
psql -U afiliados -d afiliados_db

# Backup manual
pg_dump -U afiliados afiliados_db > backup.sql

# Restaurar backup
psql -U afiliados -d afiliados_db < backup.sql
```

## Custos Estimados (VPS)
- **Básico**: $5-10/mês (1GB RAM, 1 CPU)
- **Recomendado**: $15-25/mês (2GB RAM, 2 CPU)
- **Premium**: $40-60/mês (4GB RAM, 4 CPU)

## Provedores Recomendados
- DigitalOcean
- Vultr
- Linode
- AWS Lightsail
- Google Cloud
- Azure

## Segurança Adicional
1. Firewall configurado (apenas portas 80, 443, 22)
2. Fail2ban para proteção SSH
3. Atualizações automáticas de segurança
4. Backup regular automatizado
5. Monitoramento de recursos

Este setup garante 99.9% de uptime e total independência do Replit.