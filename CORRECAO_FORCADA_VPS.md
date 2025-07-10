# 🚨 CORREÇÃO FORÇADA VPS - PostgreSQL

## PROBLEMA CRÍTICO
```
[ERRO] PostgreSQL não conectou
Verifique: systemctl status postgresql-15
```

## SOLUÇÃO AUTOMÁTICA

### Execute o script de correção completa:
```bash
cd /var/www/afiliadosbet
./fix-postgresql-production.sh
```

Este script fará automaticamente:
1. ✅ Diagnóstico completo do PostgreSQL
2. ✅ Reinstalação se necessário  
3. ✅ Configuração de porta e autenticação
4. ✅ Criação do usuário e banco
5. ✅ Configuração da tabela de sessões
6. ✅ Teste de conectividade
7. ✅ Reinício da aplicação
8. ✅ Verificação final

## SE SCRIPT FALHAR

### Correção manual passo a passo:

#### 1. Reinstalar PostgreSQL
```bash
dnf remove -y postgresql15*
dnf install -y postgresql15-server postgresql15
postgresql-setup --initdb
systemctl enable postgresql-15
systemctl start postgresql-15
```

#### 2. Configurar PostgreSQL
```bash
# Editar configuração
nano /var/lib/pgsql/15/data/postgresql.conf
# Adicionar:
listen_addresses = '*'
port = 5432

# Editar autenticação  
nano /var/lib/pgsql/15/data/pg_hba.conf
# Adicionar no final:
local   afiliadosbetdb  afiliadosbet                    md5
host    afiliadosbetdb  afiliadosbet    127.0.0.1/32    md5

systemctl restart postgresql-15
```

#### 3. Criar usuário e banco
```bash
sudo -u postgres psql
```
```sql
CREATE USER afiliadosbet WITH PASSWORD 'Alepoker800';
ALTER USER afiliadosbet CREATEDB;
CREATE DATABASE afiliadosbetdb OWNER afiliadosbet;
\q
```

#### 4. Testar conexão
```bash
PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "SELECT 1;"
```

#### 5. Se ainda falhar - alternativa extrema
```bash
# Parar tudo
systemctl stop postgresql-15
pm2 kill

# Limpar dados PostgreSQL completamente
rm -rf /var/lib/pgsql/15/data/*

# Recriar do zero
postgresql-setup --initdb
systemctl start postgresql-15

# Repetir passos 2, 3, 4
```

## VERIFICAÇÃO FINAL

### Após correção, testar:
```bash
# 1. PostgreSQL rodando
systemctl status postgresql-15

# 2. Porta aberta
netstat -tlnp | grep 5432

# 3. Conexão funcionando
PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "SELECT NOW();"

# 4. Aplicação rodando
pm2 status afiliadosbet

# 5. Site acessível
curl -I http://localhost:3000
```

## LOGS PARA DEBUG

### Se continuar com erro:
```bash
# Logs PostgreSQL
journalctl -u postgresql-15 -f

# Logs aplicação
pm2 logs afiliadosbet

# Status geral
systemctl status postgresql-15
ps aux | grep postgres
```

## CONTATOS DE EMERGÊNCIA

Se nada funcionar, documentar:
1. Versão do AlmaLinux: `cat /etc/redhat-release`
2. Espaço em disco: `df -h`
3. Memória: `free -h`  
4. Logs completos: `journalctl -u postgresql-15 --no-pager`

O problema pode ser:
- Falta de espaço em disco
- Problema de permissões
- Configuração de firewall
- Processo PostgreSQL travado