# Comandos Rápidos - AfiliadosBet no Hostinger

## Conexão SSH

```bash
# Conectar ao servidor
ssh root@SEU_IP_VPS

# Ou com usuário não-root
ssh usuario@SEU_IP_VPS
```

## Administração da Aplicação

### Deploy e Atualizações
```bash
# Deploy completo
cd /var/www/afiliadosbet
./production-deploy.sh

# Atualização manual rápida
git pull origin main
npm install
npm run build
pm2 restart afiliadosbet
```

### Monitoramento
```bash
# Status completo do sistema
./production-monitor.sh

# Status PM2
pm2 status
pm2 monit

# Logs da aplicação
pm2 logs afiliadosbet
pm2 logs afiliadosbet --lines 50
```

### Backup
```bash
# Backup completo
./production-backup.sh

# Backup manual do banco
sudo -u postgres pg_dump afiliadosbet > backup_$(date +%Y%m%d).sql
```

## Gerenciamento de Serviços

### PM2 (Aplicação Node.js)
```bash
# Iniciar aplicação
pm2 start production-ecosystem.config.js

# Parar aplicação
pm2 stop afiliadosbet

# Reiniciar aplicação
pm2 restart afiliadosbet

# Recarregar aplicação (zero downtime)
pm2 reload afiliadosbet

# Ver logs em tempo real
pm2 logs afiliadosbet --follow

# Salvar configuração
pm2 save

# Startup automático
pm2 startup
```

### Nginx
```bash
# Testar configuração
nginx -t

# Recarregar configuração
systemctl reload nginx

# Reiniciar Nginx
systemctl restart nginx

# Status do Nginx
systemctl status nginx

# Logs do Nginx
tail -f /var/log/nginx/afiliadosbet_access.log
tail -f /var/log/nginx/afiliadosbet_error.log
```

### PostgreSQL
```bash
# Status do PostgreSQL
systemctl status postgresql

# Reiniciar PostgreSQL
systemctl restart postgresql

# Conectar ao banco
sudo -u postgres psql afiliadosbet

# Backup do banco
sudo -u postgres pg_dump afiliadosbet > backup.sql

# Restaurar banco
sudo -u postgres psql afiliadosbet < backup.sql
```

## SSL/HTTPS

### Certificados Let's Encrypt
```bash
# Renovar certificados
certbot renew

# Renovar forçadamente
certbot renew --force-renewal

# Verificar certificados
certbot certificates

# Testar renovação
certbot renew --dry-run
```

## Monitoramento do Sistema

### Recursos do Sistema
```bash
# Uso de CPU e memória
htop
top

# Uso de disco
df -h
du -sh /var/www/afiliadosbet/

# Uso de memória
free -h

# Processos ativos
ps aux | grep node
ps aux | grep nginx
```

### Rede
```bash
# Portas abertas
netstat -tlnp
ss -tlnp

# Testar conectividade
curl -I http://localhost:5000
curl -I https://afiliadosbet.com

# Verificar DNS
nslookup afiliadosbet.com
dig afiliadosbet.com
```

## Logs e Debugging

### Logs da Aplicação
```bash
# Logs PM2
pm2 logs afiliadosbet
pm2 logs afiliadosbet --err
pm2 logs afiliadosbet --out

# Logs do sistema
journalctl -u nginx -f
journalctl -u postgresql -f

# Logs de acesso
tail -f /var/log/nginx/afiliadosbet_access.log

# Logs de erro
tail -f /var/log/nginx/afiliadosbet_error.log
```

### Debugging
```bash
# Verificar se aplicação está respondendo
curl http://localhost:5000/health

# Testar banco de dados
sudo -u postgres psql -c "SELECT 1;" afiliadosbet

# Verificar configuração do Nginx
nginx -t

# Verificar portas em uso
lsof -i :5000
lsof -i :80
lsof -i :443
```

## Firewall (UFW)

```bash
# Status do firewall
ufw status

# Permitir porta
ufw allow 22
ufw allow 80
ufw allow 443

# Negar porta
ufw deny 3000

# Ativar/desativar
ufw enable
ufw disable

# Resetar regras
ufw --force reset
```

## Atualizações do Sistema

```bash
# Atualizar pacotes
apt update
apt upgrade

# Atualizar Node.js
npm install -g n
n stable

# Atualizar PM2
npm install -g pm2@latest
```

## Manutenção de Arquivos

### Limpeza de Logs
```bash
# Limpar logs antigos
find /var/log -name "*.log" -mtime +30 -delete
journalctl --vacuum-time=30d

# Limpar cache do NPM
npm cache clean --force

# Limpar backups antigos
find /var/backups/afiliadosbet -mtime +7 -delete
```

### Permissões
```bash
# Corrigir permissões da aplicação
chown -R www-data:www-data /var/www/afiliadosbet
chmod -R 755 /var/www/afiliadosbet

# Tornar scripts executáveis
chmod +x /var/www/afiliadosbet/*.sh
```

## Resolução de Problemas Comuns

### Aplicação não responde
```bash
# 1. Verificar se está rodando
pm2 status

# 2. Ver logs de erro
pm2 logs afiliadosbet --err

# 3. Reiniciar aplicação
pm2 restart afiliadosbet

# 4. Se não resolver, matar e iniciar
pm2 kill
pm2 start production-ecosystem.config.js
```

### Erro 502 Bad Gateway
```bash
# 1. Verificar se aplicação está rodando
pm2 status
curl http://localhost:5000

# 2. Verificar logs do Nginx
tail /var/log/nginx/afiliadosbet_error.log

# 3. Testar configuração do Nginx
nginx -t

# 4. Reiniciar serviços
pm2 restart afiliadosbet
systemctl reload nginx
```

### Banco de dados inacessível
```bash
# 1. Verificar status
systemctl status postgresql

# 2. Tentar conectar
sudo -u postgres psql

# 3. Verificar logs
tail /var/log/postgresql/postgresql-*-main.log

# 4. Reiniciar se necessário
systemctl restart postgresql
```

### Certificado SSL expirado
```bash
# 1. Verificar status
certbot certificates

# 2. Renovar
certbot renew

# 3. Recarregar Nginx
systemctl reload nginx
```

## Configurações de Emergência

### Modo de Manutenção
```bash
# Criar página de manutenção
echo "Site em manutenção" > /var/www/html/maintenance.html

# Configurar Nginx para mostrar página de manutenção
# (editar /etc/nginx/sites-available/afiliadosbet)
```

### Rollback Rápido
```bash
# 1. Ir para diretório
cd /var/www/afiliadosbet

# 2. Ver commits recentes
git log --oneline -5

# 3. Voltar para commit anterior
git reset --hard HEAD~1

# 4. Reinstalar dependências
npm install

# 5. Rebuild
npm run build

# 6. Reiniciar
pm2 restart afiliadosbet
```

## Comandos de Informação

```bash
# Informações do servidor
hostnamectl
uname -a
lsb_release -a

# Informações da aplicação
cd /var/www/afiliadosbet
git log -1
npm list --depth=0

# Estatísticas de uso
df -h
free -h
uptime
```

## Automatização com Cron

```bash
# Editar crontab
crontab -e

# Exemplos de tarefas automáticas:
# Backup diário às 2h
0 2 * * * /var/www/afiliadosbet/production-backup.sh

# Renovação SSL mensal
0 3 1 * * certbot renew --quiet

# Limpeza de logs semanal
0 1 * * 0 find /var/log -name "*.log" -mtime +30 -delete
```

## Monitoramento Externo

### Configurar Uptime Robot
1. Acesse uptimerobot.com
2. Adicione monitor HTTP(S)
3. URL: https://afiliadosbet.com
4. Configure alertas por email

### Configurar Cloudflare (Opcional)
1. Adicionar domínio no Cloudflare
2. Alterar nameservers no Hostinger
3. Configurar SSL/TLS como "Full"
4. Ativar "Always Use HTTPS"