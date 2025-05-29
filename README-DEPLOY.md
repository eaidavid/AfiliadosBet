# Guia de Deploy - AfiliadosBet

## Passo 1: Preparar o projeto localmente

1. Baixe todos os arquivos do projeto
2. Execute: `npm run build`
3. Os arquivos compilados estarão na pasta `dist/`

## Passo 2: Acessar o VPS da Hostinger

1. Entre no painel da Hostinger (hpanel.hostinger.com)
2. Vá em "VPS" no menu lateral
3. Clique no seu VPS
4. Clique em "SSH Access" ou "Conectar via SSH"
5. Use as credenciais fornecidas pela Hostinger

## Passo 3: Preparar o servidor

Execute estes comandos no terminal SSH:

```bash
# Atualizar o sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Criar pasta para o projeto
sudo mkdir -p /var/www/afiliadosbet
sudo chown $USER:$USER /var/www/afiliadosbet
```

## Passo 4: Configurar banco de dados

```bash
# Configurar PostgreSQL
sudo -u postgres createuser --interactive --pwprompt
# Quando perguntar: nome = "afiliadosbet", senha = "sua_senha"

sudo -u postgres createdb afiliadosbet
```

## Passo 5: Enviar arquivos

Use FileZilla ou WinSCP para enviar:
- Pasta `dist/` → `/var/www/afiliadosbet/`
- Arquivo `package.json` → `/var/www/afiliadosbet/`
- Arquivo `ecosystem.config.js` → `/var/www/afiliadosbet/`

## Passo 6: Configurar variáveis

```bash
cd /var/www/afiliadosbet
nano .env
```

Adicione:
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://afiliadosbet:sua_senha@localhost:5432/afiliadosbet
SESSION_SECRET=chave_super_secreta_aqui
```

## Passo 7: Instalar dependências e iniciar

```bash
cd /var/www/afiliadosbet
npm install --production
npx drizzle-kit push
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

## Passo 8: Configurar Nginx

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/afiliadosbet
```

Adicione:
```nginx
server {
    listen 80;
    server_name SEU_DOMINIO.com www.SEU_DOMINIO.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/afiliadosbet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Agora seu site estará funcionando!