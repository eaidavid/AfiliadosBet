#!/bin/bash

# Fix SSL and Domain Issues - AfiliadosBet
# Execute this to fix the domain/SSL issue

echo "🔧 Corrigindo configuração de domínio e SSL..."

# Configurar Nginx para HTTP primeiro (sem SSL)
tee /etc/nginx/sites-available/afiliadosbet << 'EOF'
server {
    listen 80;
    server_name afiliadosbet.com.br www.afiliadosbet.com.br 69.62.65.24;
    
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
EOF

# Recarregar Nginx
nginx -t && systemctl reload nginx

echo "✅ Nginx configurado para HTTP"

# Atualizar .env para usar HTTP temporariamente
cd /var/www/afiliadosbet

cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://afiliadosbet:Alepoker@800@localhost:5432/afiliadosbet
SESSION_SECRET=afiliadosbet_secret_key_2024
DOMAIN=http://afiliadosbet.com.br
FRONTEND_URL=http://afiliadosbet.com.br
BACKEND_URL=http://afiliadosbet.com.br
EOF

# Reiniciar aplicação
pm2 restart afiliadosbet

echo "✅ Aplicação configurada"

# Verificar status
echo "📊 Status dos serviços:"
pm2 status afiliadosbet
systemctl status nginx --no-pager -l

# Testar conectividade
echo "🔍 Testando conectividade:"
echo "Local: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 || echo "ERRO")"
echo "IP: $(curl -s -o /dev/null -w "%{http_code}" http://69.62.65.24 || echo "ERRO")"

echo ""
echo "🌐 ACESSOS DISPONÍVEIS:"
echo "Por IP: http://69.62.65.24"
echo "Por domínio: http://afiliadosbet.com.br (se DNS estiver configurado)"
echo ""
echo "📝 PRÓXIMOS PASSOS:"
echo "1. Configure o DNS do domínio afiliadosbet.com.br para apontar para 69.62.65.24"
echo "2. Aguarde propagação do DNS (pode levar até 48h)"
echo "3. Execute: certbot --nginx -d afiliadosbet.com.br -d www.afiliadosbet.com.br"
echo ""
echo "💡 TESTE IMEDIATO:"
echo "Acesse: http://69.62.65.24"