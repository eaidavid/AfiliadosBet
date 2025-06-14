# Deploy Automático - 1 Comando

## Como o Replit Deploy funciona:
1. Clica no botão
2. Aguarda 2 minutos
3. Site funcionando

## Seu VPS - Método idêntico:

### COMANDO ÚNICO:
```bash
wget -qO- https://raw.githubusercontent.com/eaidavid/AfiliadosBet/main/deploy-zero.sh | bash
```

### OU copie e cole direto:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && apt-get update && apt-get install -y nodejs postgresql postgresql-contrib nginx ufw && npm install -g pm2 && systemctl start postgresql && systemctl enable postgresql && sudo -u postgres psql -c "CREATE DATABASE afiliadosbet; CREATE USER afiliadosapp WITH ENCRYPTED PASSWORD 'app123'; GRANT ALL PRIVILEGES ON DATABASE afiliadosbet TO afiliadosapp;" && cd /var/www && rm -rf afiliadosbet && git clone https://github.com/eaidavid/AfiliadosBet.git afiliadosbet && cd afiliadosbet && npm install && npm run build && echo "NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://afiliadosapp:app123@localhost:5432/afiliadosbet
SESSION_SECRET=afiliadosbet_secret_2024" > .env && npm run db:push && pm2 start dist/index.js --name afiliadosbet && pm2 startup && pm2 save && cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80 default_server;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF
nginx -t && systemctl restart nginx && ufw allow ssh && ufw allow 'Nginx Full' && ufw --force enable && echo "Deploy concluído! Acesse pelo IP do servidor"
```

## Resultado:
- ✅ Site funcionando em http://SEU-IP
- ✅ Zero configuração manual
- ✅ Igual ao botão Deploy

## Gerenciar (igual Replit):
```bash
pm2 status           # Ver se está rodando
pm2 logs afiliadosbet # Ver logs
pm2 restart afiliadosbet # Reiniciar
```

## Atualizar:
```bash
cd /var/www/afiliadosbet && git pull && npm run build && pm2 restart afiliadosbet
```

**Simples assim - igual ao Replit Deploy!**