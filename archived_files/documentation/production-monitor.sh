#!/bin/bash

# Script de Monitoramento - AfiliadosBet Produção
# Execute com: ./production-monitor.sh

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para verificar status de serviço
check_service() {
    local service=$1
    local name=$2
    
    if systemctl is-active --quiet $service; then
        echo -e "${GREEN}✅ $name: Ativo${NC}"
    else
        echo -e "${RED}❌ $name: Inativo${NC}"
    fi
}

# Função para verificar porta
check_port() {
    local port=$1
    local name=$2
    
    if netstat -tuln | grep -q ":$port "; then
        echo -e "${GREEN}✅ $name (porta $port): Ativo${NC}"
    else
        echo -e "${RED}❌ $name (porta $port): Inativo${NC}"
    fi
}

clear
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}📊 Monitor AfiliadosBet Produção${NC}"
echo -e "${BLUE}================================${NC}"
echo

# 1. Status dos Serviços
echo -e "${YELLOW}🔧 Status dos Serviços:${NC}"
check_service nginx "Nginx"
check_service postgresql "PostgreSQL"
echo

# 2. Status PM2
echo -e "${YELLOW}⚡ Status PM2:${NC}"
if command -v pm2 > /dev/null; then
    pm2 status
else
    echo -e "${RED}❌ PM2 não instalado${NC}"
fi
echo

# 3. Status das Portas
echo -e "${YELLOW}🌐 Status das Portas:${NC}"
check_port 80 "HTTP"
check_port 443 "HTTPS"
check_port 5432 "PostgreSQL"
check_port 5000 "Aplicação"
echo

# 4. Teste de Conectividade
echo -e "${YELLOW}🔍 Teste de Conectividade:${NC}"
if curl -f -s http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Aplicação respondendo${NC}"
else
    echo -e "${RED}❌ Aplicação não responde${NC}"
fi

if curl -f -s http://localhost > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Nginx respondendo${NC}"
else
    echo -e "${RED}❌ Nginx não responde${NC}"
fi
echo

# 5. Uso de Recursos
echo -e "${YELLOW}💻 Uso de Recursos:${NC}"
echo -e "${BLUE}CPU:${NC}"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 | awk '{printf "  Uso: %.1f%%\n", $1}'

echo -e "${BLUE}Memória:${NC}"
free -h | awk 'NR==2{printf "  Usado: %s/%s (%.1f%%)\n", $3,$2,$3*100/$2 }'

echo -e "${BLUE}Disco:${NC}"
df -h / | awk 'NR==2{printf "  Usado: %s/%s (%s)\n", $3,$2,$5}'
echo

# 6. Espaço em Disco por Diretório
echo -e "${YELLOW}💿 Uso de Disco por Diretório:${NC}"
if [ -d "/var/www/afiliadosbet" ]; then
    echo -e "${BLUE}Aplicação:${NC} $(du -sh /var/www/afiliadosbet 2>/dev/null | cut -f1)"
fi
if [ -d "/var/backups/afiliadosbet" ]; then
    echo -e "${BLUE}Backups:${NC} $(du -sh /var/backups/afiliadosbet 2>/dev/null | cut -f1)"
fi
if [ -d "/var/log" ]; then
    echo -e "${BLUE}Logs:${NC} $(du -sh /var/log 2>/dev/null | cut -f1)"
fi
echo

# 7. Últimos Logs da Aplicação
echo -e "${YELLOW}📋 Últimos Logs da Aplicação:${NC}"
if command -v pm2 > /dev/null; then
    pm2 logs afiliadosbet --lines 5 --nostream 2>/dev/null || echo "Nenhum log disponível"
else
    echo "PM2 não disponível"
fi
echo

# 8. Estatísticas do Banco
echo -e "${YELLOW}🗄️ Estatísticas do Banco:${NC}"
if systemctl is-active --quiet postgresql; then
    CONN_COUNT=$(sudo -u postgres psql -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | xargs)
    DB_SIZE=$(sudo -u postgres psql -t -c "SELECT pg_size_pretty(pg_database_size('afiliadosbet'));" 2>/dev/null | xargs)
    echo -e "${BLUE}Conexões ativas:${NC} $CONN_COUNT"
    echo -e "${BLUE}Tamanho do banco:${NC} $DB_SIZE"
else
    echo -e "${RED}PostgreSQL não está rodando${NC}"
fi
echo

# 9. Informações de SSL
echo -e "${YELLOW}🔒 Status SSL:${NC}"
if [ -f "/etc/letsencrypt/live/afiliadosbet.com/cert.pem" ]; then
    EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/afiliadosbet.com/cert.pem 2>/dev/null | cut -d= -f2)
    if [ -n "$EXPIRY" ]; then
        echo -e "${BLUE}Certificado expira em:${NC} $EXPIRY"
    else
        echo -e "${YELLOW}⚠️ Erro ao ler certificado${NC}"
    fi
else
    echo -e "${RED}❌ Certificado SSL não encontrado${NC}"
fi
echo

# 10. Uptime do Sistema
echo -e "${YELLOW}⏰ Uptime do Sistema:${NC}"
uptime
echo

# 11. Verificação de Atualizações
echo -e "${YELLOW}📦 Verificação de Atualizações:${NC}"
if [ -d "/var/www/afiliadosbet/.git" ]; then
    cd /var/www/afiliadosbet
    git fetch origin 2>/dev/null
    BEHIND=$(git rev-list HEAD...origin/main --count 2>/dev/null)
    if [ "$BEHIND" -gt 0 ]; then
        echo -e "${YELLOW}⚠️ $BEHIND atualizações disponíveis${NC}"
    else
        echo -e "${GREEN}✅ Código atualizado${NC}"
    fi
else
    echo -e "${RED}❌ Repositório Git não encontrado${NC}"
fi
echo

# 12. Comandos Úteis
echo -e "${YELLOW}🛠️ Comandos Úteis:${NC}"
echo -e "${BLUE}Deploy:${NC} ./production-deploy.sh"
echo -e "${BLUE}Logs da aplicação:${NC} pm2 logs afiliadosbet"
echo -e "${BLUE}Restart da aplicação:${NC} pm2 restart afiliadosbet"
echo -e "${BLUE}Status detalhado:${NC} pm2 monit"
echo -e "${BLUE}Logs do Nginx:${NC} tail -f /var/log/nginx/afiliadosbet_error.log"
echo -e "${BLUE}Backup manual:${NC} ./production-backup.sh"
echo

echo -e "${GREEN}✅ Monitoramento concluído em $(date)${NC}"