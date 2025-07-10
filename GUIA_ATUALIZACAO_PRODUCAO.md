# 📋 GUIA DE ATUALIZAÇÃO PRODUÇÃO - AfiliadosBet

## 🚨 PROBLEMA CRÍTICO IDENTIFICADO
**A aplicação está rodando SQLite em produção em vez de PostgreSQL!**

```
❌ Erro: SqliteError: no such column: "type"
❌ PostgreSQL: relation "users" does not exist  
```

## ✅ SOLUÇÃO COMPLETA

### Execute este comando único no VPS:
```bash
cd /var/www/afiliadosbet
git pull origin main
./fix-production-database-complete.sh
```

**O script fará automaticamente:**
1. 🔄 Para a aplicação
2. 🔧 Configura .env para PostgreSQL 
3. 🗄️ Instala/configura PostgreSQL
4. 📊 Cria schema completo
5. 🔄 Migra dados do SQLite
6. 🚀 Reinicia com PostgreSQL
7. ✅ Testa funcionamento

## 📝 CHECKLIST PÓS-MIGRAÇÃO

### 1. Verificar aplicação rodando:
```bash
pm2 status afiliadosbet
pm2 logs afiliadosbet
```

### 2. Testar banco PostgreSQL:
```bash
PGPASSWORD=Alepoker800 psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "
SELECT role, COUNT(*) as total FROM users GROUP BY role;
"
```

### 3. Testar API admin:
```bash
curl -s "http://localhost:3000/api/stats/admin"
```

### 4. Verificar no navegador:
- 🌐 Site: https://afiliadosbet.com.br
- 🔐 Login: admin@afiliadosbet.com.br / admin123
- 📊 Admin Panel: Deve mostrar usuários cadastrados

## 🔍 LOGS ESPERADOS (Sucesso)

```bash
✅ PostgreSQL: Funcionando
✅ Schema: Criado  
✅ Aplicação: Rodando
🎉 MIGRAÇÃO COMPLETA!
```

## ⚠️ SE ALGO DER ERRADO

### Reset completo:
```bash
pm2 kill
systemctl stop postgresql-15
rm -rf /var/lib/pgsql/15/data/*
postgresql-setup --initdb
systemctl start postgresql-15

# Executar script novamente
./fix-production-database-complete.sh
```

### Rollback para SQLite temporário:
```bash
# APENAS se PostgreSQL falhar completamente
rm -f .env
echo "NODE_ENV=production" > .env
pm2 restart afiliadosbet
```

## 📞 SUPORTE

### Logs para diagnóstico:
```bash
# PostgreSQL
journalctl -u postgresql-15 --no-pager -n 20

# Aplicação
pm2 logs afiliadosbet --lines 50

# Sistema
df -h && free -h
```

### Comando de emergência (uma linha):
```bash
cd /var/www/afiliadosbet && git pull && ./fix-production-database-complete.sh
```

---
**⏰ Tempo estimado**: 5-10 minutos  
**🔄 Downtime**: ~2 minutos durante migração  
**💾 Backup**: SQLite movido para `backup-sqlite/`