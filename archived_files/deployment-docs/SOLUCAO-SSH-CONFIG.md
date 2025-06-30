# Solução SSH Configuration - Deploy VPS

## Problema: Configuração SSH

Quando aparecer a tela roxa perguntando sobre o arquivo de configuração SSH (`sshd_config`), siga estas instruções:

## ✅ Solução

**Pressione ENTER na primeira opção (em vermelho):**
```
install the package maintainer's version
```

## Por que esta opção?

1. **Segurança**: Instala a versão mais segura e atualizada
2. **Compatibilidade**: Evita conflitos com o sistema
3. **Padrão**: Configuração testada e estável

## Após selecionar

1. O sistema continuará a instalação automaticamente
2. A configuração SSH será atualizada
3. O deploy prosseguirá normalmente

## Se aparecer novamente

- Sempre escolha a mesma opção: "install the package maintainer's version"
- Pressione ENTER para confirmar
- Continue com o processo de instalação

## Comando completo atualizado (evita o prompt)

Para evitar prompts interativos, use este comando:

```bash
export DEBIAN_FRONTEND=noninteractive && apt update && apt upgrade -y && apt install -y curl git nginx postgresql postgresql-contrib && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs && npm install -g pm2 && sudo -u postgres psql -c "CREATE DATABASE afiliadosbet; CREATE USER afiliadosbet WITH ENCRYPTED PASSWORD 'Alepoker@800'; GRANT ALL PRIVILEGES ON DATABASE afiliadosbet TO afiliadosbet; ALTER USER afiliadosbet CREATEDB;" && cd /var/www && rm -rf afiliadosbet && git clone https://github.com/eaidavid/AfiliadosBet.git afiliadosbet && cd afiliadosbet && useradd -m -s /bin/bash afiliadosbet 2>/dev/null || true && echo "afiliadosbet:Alepoker@800" | chpasswd && chown -R afiliadosbet:afiliadosbet . && cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://afiliadosbet:Alepoker@800@localhost:5432/afiliadosbet
SESSION_SECRET=afiliadosbet_secret_key_2024
DOMAIN=https://afiliadosbet.com.br
FRONTEND_URL=https://afiliadosbet.com.br
BACKEND_URL=https://afiliadosbet.com.br
EOF
npm install && npm run build && npm run db:push && pm2 delete afiliadosbet 2>/dev/null || true && pm2 start dist/index.js --name afiliadosbet && pm2 save && pm2 startup && tee /etc/nginx/sites-available/afiliadosbet << 'EOFNGINX'
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
    
    client_max_body_size 10M;
}
EOFNGINX
ln -sf /etc/nginx/sites-available/afiliadosbet /etc/nginx/sites-enabled/ && rm -f /etc/nginx/sites-enabled/default && nginx -t && systemctl restart nginx && apt install -y certbot python3-certbot-nginx && certbot --nginx -d afiliadosbet.com.br -d www.afiliadosbet.com.br --non-interactive --agree-tos -m admin@afiliadosbet.com.br && ufw allow ssh && ufw allow 'Nginx Full' && ufw --force enable && echo "🎉 DEPLOY CONCLUÍDO! Acesse: https://afiliadosbet.com.br"
```

## Resumo das ações

1. **Pressione ENTER** na primeira opção
2. **Aguarde** a instalação continuar
3. **Teste** o acesso ao site após conclusão

O prompt SSH é normal durante atualizações do sistema e não afeta o funcionamento do deploy.