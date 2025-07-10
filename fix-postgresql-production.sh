#!/bin/bash

# 🔧 Script de Correção PostgreSQL - AfiliadosBet
# Diagnóstica e corrige problemas do PostgreSQL em produção

echo "🔍 Diagnosticando PostgreSQL..."

# Função para log com timestamp
log() {
    echo "[$(date '+%H:%M:%S')] $1"
}

error() {
    echo "[ERRO] $1"
}

success() {
    echo "✅ $1"
}

warning() {
    echo "⚠️ $1"
}

# 1. Verificar status do PostgreSQL
log "1. Verificando status do PostgreSQL..."
if systemctl is-active --quiet postgresql-15; then
    success "PostgreSQL está rodando"
else
    warning "PostgreSQL não está rodando"
    
    log "Tentando iniciar PostgreSQL..."
    systemctl start postgresql-15
    sleep 3
    
    if systemctl is-active --quiet postgresql-15; then
        success "PostgreSQL iniciado com sucesso"
    else
        error "Falha ao iniciar PostgreSQL"
        log "Verificando logs de erro..."
        journalctl -u postgresql-15 --no-pager -n 20
        
        log "Tentando reinstalar PostgreSQL..."
        dnf reinstall -y postgresql15-server postgresql15
        
        log "Inicializando banco de dados..."
        postgresql-setup --initdb
        
        log "Habilitando e iniciando serviço..."
        systemctl enable postgresql-15
        systemctl start postgresql-15
    fi
fi

# 2. Verificar se está escutando na porta correta
log "2. Verificando porta 5432..."
if netstat -tlnp | grep -q ":5432"; then
    success "PostgreSQL escutando na porta 5432"
else
    warning "PostgreSQL não está na porta 5432"
    
    log "Verificando configuração..."
    PGDATA="/var/lib/pgsql/15/data"
    if [ -f "$PGDATA/postgresql.conf" ]; then
        log "Editando postgresql.conf..."
        sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PGDATA/postgresql.conf"
        sed -i "s/#port = 5432/port = 5432/" "$PGDATA/postgresql.conf"
        
        log "Reiniciando PostgreSQL..."
        systemctl restart postgresql-15
    fi
fi

# 3. Verificar usuário afiliadosbet
log "3. Verificando usuário do banco..."
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='afiliadosbet'" | grep -q 1; then
    success "Usuário afiliadosbet existe"
else
    warning "Criando usuário afiliadosbet..."
    sudo -u postgres psql -c "CREATE USER afiliadosbet WITH PASSWORD 'Alepoker800';"
    sudo -u postgres psql -c "ALTER USER afiliadosbet CREATEDB;"
fi

# 4. Verificar banco de dados
log "4. Verificando banco afiliadosbetdb..."
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw afiliadosbetdb; then
    success "Banco afiliadosbetdb existe"
else
    warning "Criando banco afiliadosbetdb..."
    sudo -u postgres psql -c "CREATE DATABASE afiliadosbetdb OWNER afiliadosbet;"
fi

# 5. Configurar permissões no pg_hba.conf
log "5. Configurando autenticação..."
PGDATA="/var/lib/pgsql/15/data"
if [ -f "$PGDATA/pg_hba.conf" ]; then
    # Backup do arquivo original
    cp "$PGDATA/pg_hba.conf" "$PGDATA/pg_hba.conf.backup.$(date +%s)"
    
    # Adicionar linha para o usuário afiliadosbet se não existir
    if ! grep -q "local.*afiliadosbetdb.*afiliadosbet.*md5" "$PGDATA/pg_hba.conf"; then
        echo "local   afiliadosbetdb  afiliadosbet                    md5" >> "$PGDATA/pg_hba.conf"
    fi
    
    if ! grep -q "host.*afiliadosbetdb.*afiliadosbet.*127.0.0.1/32.*md5" "$PGDATA/pg_hba.conf"; then
        echo "host    afiliadosbetdb  afiliadosbet    127.0.0.1/32    md5" >> "$PGDATA/pg_hba.conf"
    fi
    
    if ! grep -q "host.*afiliadosbetdb.*afiliadosbet.*::1/128.*md5" "$PGDATA/pg_hba.conf"; then
        echo "host    afiliadosbetdb  afiliadosbet    ::1/128         md5" >> "$PGDATA/pg_hba.conf"
    fi
    
    log "Recarregando configuração PostgreSQL..."
    systemctl reload postgresql-15
fi

# 6. Testar conexão
log "6. Testando conexão..."
if PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "SELECT 1;" >/dev/null 2>&1; then
    success "Conexão PostgreSQL funcionando"
else
    error "Conexão PostgreSQL falhando"
    
    # Diagnóstico avançado
    log "Diagnóstico avançado..."
    echo "Status do serviço:"
    systemctl status postgresql-15 --no-pager -l
    
    echo ""
    echo "Processos PostgreSQL:"
    ps aux | grep postgres
    
    echo ""
    echo "Portas escutando:"
    netstat -tlnp | grep postgres
    
    echo ""
    echo "Logs recentes:"
    journalctl -u postgresql-15 --no-pager -n 10
    
    echo ""
    echo "Arquivo de configuração principal:"
    ls -la /var/lib/pgsql/15/data/postgresql.conf
    
    echo ""
    echo "Espaço em disco:"
    df -h /var/lib/pgsql/
    
    exit 1
fi

# 7. Configurar tabela de sessões
log "7. Configurando tabelas de sessão..."
PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb << 'EOF'
-- Dropar tabela de sessões existente se houver
DROP TABLE IF EXISTS sessions;

-- Criar tabela de sessões
CREATE TABLE sessions (
  sid varchar PRIMARY KEY,
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

-- Verificar se criou corretamente
\dt sessions
EOF

if [ $? -eq 0 ]; then
    success "Tabela de sessões configurada"
else
    error "Erro ao configurar tabela de sessões"
fi

# 8. Teste final
log "8. Teste final de conexão..."
if PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "SELECT COUNT(*) FROM sessions;" >/dev/null 2>&1; then
    success "PostgreSQL totalmente funcional"
    
    # 9. Reiniciar aplicação
    log "9. Reiniciando aplicação..."
    pm2 stop afiliadosbet 2>/dev/null || true
    pm2 delete afiliadosbet 2>/dev/null || true
    
    # Build da aplicação
    npm run build
    
    # Iniciar em modo produção
    NODE_ENV=production pm2 start npm --name "afiliadosbet" -- start
    
    log "Aguardando aplicação inicializar..."
    sleep 5
    
    if pm2 list | grep -q "afiliadosbet.*online"; then
        success "Aplicação funcionando"
        
        log "Testando rota de login..."
        if curl -s http://localhost:3000/api/auth/me | grep -q "authenticated"; then
            success "Sistema totalmente funcional"
        else
            warning "Sistema rodando mas API pode ter problemas"
        fi
    else
        error "Problema ao iniciar aplicação"
        pm2 logs afiliadosbet --lines 20
    fi
else
    error "PostgreSQL ainda com problemas"
    exit 1
fi

echo ""
success "Correção PostgreSQL completa!"
echo "🌐 Site: https://afiliadosbet.com.br"
echo "📊 Admin: https://afiliadosbet.com.br/admin"
echo "🔍 Logs: pm2 logs afiliadosbet"