# Guia Simples VPS - AfiliadosBet

## Para Iniciantes (sem conhecimento técnico)

### Dados da sua VPS:
- **IP:** 69.62.65.24
- **Usuário:** afiliadosbet
- **Senha:** Alepoker@800
- **Site:** afiliadosbet.com.br

## Passo 1: Conectar no servidor

1. Abra o terminal/prompt de comando
2. Digite: `ssh afiliadosbet@69.62.65.24`
3. Digite a senha: `Alepoker@800`

## Passo 2: Instalar tudo automaticamente

Cole este comando e pressione Enter:

```bash
sudo apt update && curl -fsSL https://raw.githubusercontent.com/eaidavid/AfiliadosBet/main/install-vps.sh | sudo bash
```

**OU se não funcionar, use a instalação manual:**

```bash
sudo apt update && sudo apt upgrade -y && sudo apt install -y nginx postgresql postgresql-contrib nodejs npm git curl ufw certbot python3-certbot-nginx && curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs && npm install -g pm2 && sudo -u postgres psql -c "CREATE DATABASE afiliadosbet; CREATE USER afiliadosbet WITH ENCRYPTED PASSWORD 'Alepoker@800'; GRANT ALL PRIVILEGES ON DATABASE afiliadosbet TO afiliadosbet; ALTER USER afiliadosbet CREATEDB;" && cd /var/www && sudo git clone https://github.com/eaidavid/AfiliadosBet.git afiliadosbet && cd afiliadosbet && sudo chown -R $USER:$USER . && cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://afiliadosbet:Alepoker@800@localhost:5432/afiliadosbet
SESSION_SECRET=afiliadosbet_secret_key_2024
DOMAIN=https://afiliadosbet.com.br
FRONTEND_URL=https://afiliadosbet.com.br
BACKEND_URL=https://afiliadosbet.com.br
EOF
&& npm install && npm run build && npm run db:push && pm2 start dist/index.js --name afiliadosbet && pm2 save && pm2 startup && sudo tee /etc/nginx/sites-available/afiliadosbet << 'EOFNGINX'
server {
    listen 80;
    server_name afiliadosbet.com.br www.afiliadosbet.com.br;
    location / {
        proxy_pass http://127.0.0.1:5000;
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
EOFNGINX
&& sudo ln -sf /etc/nginx/sites-available/afiliadosbet /etc/nginx/sites-enabled/ && sudo rm -f /etc/nginx/sites-enabled/default && sudo nginx -t && sudo systemctl restart nginx && sudo certbot --nginx -d afiliadosbet.com.br -d www.afiliadosbet.com.br --non-interactive --agree-tos -m admin@afiliadosbet.com.br && sudo ufw allow ssh && sudo ufw allow 'Nginx Full' && sudo ufw --force enable && echo "✅ INSTALAÇÃO CONCLUÍDA! Acesse: https://afiliadosbet.com.br"
```

## Aguarde a instalação terminar

A instalação demora cerca de 5-10 minutos. Você verá mensagens no terminal.

## Passo 3: Verificar se funcionou

Teste estes comandos:

```bash
pm2 status
curl http://localhost:5000
```

## Passo 4: Acessar o site

Abra o navegador e acesse:
- **http://afiliadosbet.com.br**
- **https://afiliadosbet.com.br**

## Para atualizar o sistema (futuro)

Quando quiser atualizar o código:

```bash
cd /var/www/afiliadosbet
git pull origin main
npm install
npm run build
pm2 restart afiliadosbet
```

## Comandos úteis para o dia a dia

### Ver se está funcionando:
```bash
pm2 status
```

### Ver logs (para debug):
```bash
pm2 logs afiliadosbet
```

### Reiniciar aplicação:
```bash
pm2 restart afiliadosbet
```

### Parar aplicação:
```bash
pm2 stop afiliadosbet
```

### Iniciar aplicação:
```bash
pm2 start afiliadosbet
```

## Se algo der errado

### 1. Aplicação não funciona:
```bash
pm2 logs afiliadosbet --err
```

### 2. Site não abre:
```bash
sudo systemctl status nginx
sudo nginx -t
```

### 3. Reiniciar tudo:
```bash
pm2 restart afiliadosbet
sudo systemctl restart nginx
```

### 4. Ver se portas estão ocupadas:
```bash
netstat -tlnp | grep 5000
```

## Backup automático

O sistema cria backups automaticamente todo dia às 2h da manhã.

Para fazer backup manual:
```bash
pg_dump -U afiliadosbet afiliadosbet > backup_$(date +%Y%m%d).sql
```

## Informações importantes

- **Usuário do banco:** afiliadosbet
- **Senha do banco:** Alepoker@800
- **Porta da aplicação:** 5000
- **Diretório da aplicação:** /var/www/afiliadosbet
- **Logs:** `pm2 logs afiliadosbet`

## Contatos de emergência

Se precisar de ajuda, tenha em mãos:
- IP do servidor: 69.62.65.24
- Usuário: afiliadosbet
- Versão do erro (use `pm2 logs afiliadosbet`)

## Resumo final

Após a instalação, seu sistema:
- ✅ Roda automaticamente
- ✅ Reinicia sozinho se cair
- ✅ Tem SSL/HTTPS automático
- ✅ Faz backup automaticamente
- ✅ Pode ser atualizado facilmente