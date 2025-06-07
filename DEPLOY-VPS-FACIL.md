# 🚀 Guia de Deploy VPS - AfiliadosBet

## 📋 Pré-requisitos
- VPS com Ubuntu 20.04/22.04 (recomendado)
- Acesso root ou sudo
- Domínio apontado para o IP da VPS (opcional mas recomendado)

---

## 🎯 OPÇÃO 1: Deploy Automático com Docker (MAIS FÁCIL)

### Passo 1: Conectar na VPS
```bash
ssh root@SEU_IP_VPS
```

### Passo 2: Instalar Docker
```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### Passo 3: Configurar o Projeto
```bash
# Criar diretório
mkdir /opt/afiliados-bet
cd /opt/afiliados-bet

# Fazer upload dos arquivos do projeto (use scp ou git)
# Se usar git:
git clone SEU_REPOSITORIO .

# Ou se usar scp do seu computador:
# scp -r ./projeto/* root@SEU_IP:/opt/afiliados-bet/
```

### Passo 4: Configurar Variáveis
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar variáveis (use nano ou vim)
nano .env
```

**Configure essas variáveis no .env:**
```env
DATABASE_URL=postgresql://postgres:minhasenha123@postgres:5432/afiliados_db
NODE_ENV=production
PORT=3000
SESSION_SECRET=sua_chave_secreta_aqui_muito_longa_e_segura
PGUSER=postgres
PGPASSWORD=minhasenha123
PGDATABASE=afiliados_db
PGHOST=postgres
PGPORT=5432
```

### Passo 5: Subir a Aplicação
```bash
# Subir com Docker Compose
docker-compose up -d

# Verificar se está funcionando
docker-compose ps
docker-compose logs -f
```

### Passo 6: Configurar Nginx (Proxy Reverso)
```bash
# Instalar Nginx
apt install nginx -y

# Criar configuração
cat > /etc/nginx/sites-available/afiliados-bet << 'EOF'
server {
    listen 80;
    server_name SEU_DOMINIO.com www.SEU_DOMINIO.com;
    
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
EOF

# Ativar site
ln -s /etc/nginx/sites-available/afiliados-bet /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Passo 7: SSL com Certbot (HTTPS)
```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
certbot --nginx -d SEU_DOMINIO.com -d www.SEU_DOMINIO.com
```

---

## 🔧 OPÇÃO 2: Deploy Manual com PM2 (CONTROLE TOTAL)

### Passo 1: Instalar Node.js
```bash
# Conectar na VPS
ssh root@SEU_IP_VPS

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### Passo 2: Instalar PostgreSQL
```bash
# Instalar PostgreSQL
apt update
apt install postgresql postgresql-contrib -y

# Configurar PostgreSQL
sudo -u postgres psql

# Dentro do PostgreSQL:
CREATE DATABASE afiliados_db;
CREATE USER afiliados_user WITH PASSWORD 'suasenha123';
GRANT ALL PRIVILEGES ON DATABASE afiliados_db TO afiliados_user;
\q
```

### Passo 3: Configurar Projeto
```bash
# Criar diretório
mkdir /opt/afiliados-bet
cd /opt/afiliados-bet

# Fazer upload do projeto
# Use git clone ou scp

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env
nano .env
```

**Variáveis para .env:**
```env
DATABASE_URL=postgresql://afiliados_user:suasenha123@localhost:5432/afiliados_db
NODE_ENV=production
PORT=3000
SESSION_SECRET=sua_chave_secreta_muito_longa_e_segura
```

### Passo 4: Preparar Banco de Dados
```bash
# Executar migrações
npm run db:push

# Ou se houver seed:
# npm run db:seed
```

### Passo 5: Instalar PM2
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
pm2 start ecosystem.config.js

# Configurar para iniciar no boot
pm2 startup
pm2 save
```

### Passo 6: Nginx e SSL (igual Opção 1)
```bash
# Seguir passos 6 e 7 da Opção 1
```

---

## 🛠️ OPÇÃO 3: Deploy com Scripts Automatizados

### Script de Deploy Completo
Crie um arquivo `deploy-auto.sh`:

```bash
#!/bin/bash

echo "🚀 Iniciando deploy automático do AfiliadosBet..."

# Atualizar sistema
apt update && apt upgrade -y

# Instalar dependências
apt install -y curl wget git nginx postgresql postgresql-contrib

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Instalar PM2
npm install -g pm2

# Configurar PostgreSQL
sudo -u postgres psql -c "CREATE DATABASE afiliados_db;"
sudo -u postgres psql -c "CREATE USER afiliados_user WITH PASSWORD 'senha123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE afiliados_db TO afiliados_user;"

# Criar diretório do projeto
mkdir -p /opt/afiliados-bet
cd /opt/afiliados-bet

echo "📁 Faça upload do seu projeto para /opt/afiliados-bet"
echo "🔧 Configure o arquivo .env"
echo "🚀 Execute: npm install && npm run db:push && pm2 start ecosystem.config.js"

echo "✅ Sistema base configurado!"
```

Para usar:
```bash
chmod +x deploy-auto.sh
./deploy-auto.sh
```

---

## 📊 Comandos Úteis

### Monitoramento
```bash
# Ver logs da aplicação
pm2 logs

# Status dos processos
pm2 status

# Monitorar recursos
pm2 monit

# Restart da aplicação
pm2 restart all
```

### Backup do Banco
```bash
# Fazer backup
pg_dump -U afiliados_user -h localhost afiliados_db > backup.sql

# Restaurar backup
psql -U afiliados_user -h localhost afiliados_db < backup.sql
```

### Firewall
```bash
# Configurar firewall básico
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

---

## 🔍 Solução de Problemas

### Se a aplicação não iniciar:
```bash
# Verificar logs
pm2 logs
journalctl -u nginx
tail -f /var/log/nginx/error.log
```

### Se o banco não conectar:
```bash
# Verificar se PostgreSQL está rodando
systemctl status postgresql

# Testar conexão
psql -U afiliados_user -h localhost -d afiliados_db
```

### Se Nginx der erro:
```bash
# Testar configuração
nginx -t

# Verificar portas em uso
netstat -tulpn | grep :80
```

---

## 📝 Checklist Final

- [ ] VPS conectada e atualizada
- [ ] Node.js instalado
- [ ] PostgreSQL configurado
- [ ] Projeto copiado para /opt/afiliados-bet
- [ ] Arquivo .env configurado
- [ ] Dependências instaladas (npm install)
- [ ] Banco migrado (npm run db:push)
- [ ] PM2 iniciado
- [ ] Nginx configurado
- [ ] SSL configurado (opcional)
- [ ] Firewall configurado

**Seu sistema estará disponível em: http://SEU_IP ou https://SEU_DOMINIO.com**