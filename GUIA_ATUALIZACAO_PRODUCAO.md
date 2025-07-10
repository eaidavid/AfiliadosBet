# 📘 GUIA DE BOLSO - ATUALIZAÇÃO EM PRODUÇÃO

## 🚀 Comandos Rápidos para Atualizar o Servidor

### OPÇÃO 1: Script Automático (RECOMENDADO)
```bash
ssh root@seu-servidor-ip
cd /var/www/afiliadosbet

# Script completo (corrige tudo)
./fix-postgresql-production.sh

# OU script apenas para sessão
./fix-session-production.sh
```

### OPÇÃO 2: Manual

### 1. Conectar ao Servidor
```bash
ssh root@seu-servidor-ip
cd /var/www/afiliadosbet
```

### 2. Fazer Backup (Sempre!)
```bash
# Backup completo
cp -r . ../backup-$(date +%Y%m%d-%H%M)

# Backup apenas dos arquivos principais
cp server/index.ts server/index.ts.backup
cp package.json package.json.backup
```

### 3. Puxar Atualizações do Repositório
```bash
# Se usando Git
git pull origin main

# OU fazer upload manual dos arquivos alterados
# scp arquivo.js root@servidor:/var/www/afiliadosbet/
```

### 4. Instalar Dependências (se necessário)
```bash
npm install
```

### 5. Limpar cache e fazer Build completo
```bash
# Limpar cache para evitar problemas
rm -rf node_modules dist .vite
npm cache clean --force
npm install
npm run build
```

### 6. Verificar ambiente de produção
```bash
# Garantir que está em modo produção
echo "NODE_ENV=production" > .env.temp
echo "DATABASE_URL=postgresql://afiliadosbet:Alepoker800@localhost:5432/afiliadosbetdb" >> .env.temp
echo "SESSION_SECRET=afiliadosbet_super_secret_key_2025" >> .env.temp
echo "PORT=3000" >> .env.temp
echo "HOST=0.0.0.0" >> .env.temp
mv .env.temp .env
```

### 7. Reiniciar Aplicação
```bash
pm2 stop afiliadosbet
pm2 delete afiliadosbet
NODE_ENV=production pm2 start npm --name "afiliadosbet" -- start
```

### 7. Verificar se Funcionou
```bash
# Ver logs
pm2 logs afiliadosbet --lines 20

# Ver status
pm2 status

# Testar site
curl -I https://seudominio.com
```

---

## 🔧 Atualizações Específicas Comuns

### Quando Alterar server/index.ts
```bash
cd /var/www/afiliadosbet
pm2 stop afiliadosbet
cp server/index.ts server/index.ts.backup
# [COLAR NOVO CÓDIGO AQUI]
npm run build
pm2 restart afiliadosbet
pm2 logs afiliadosbet
```

### Quando Alterar Frontend (React/client)
```bash
cd /var/www/afiliadosbet
# [ATUALIZAR ARQUIVOS client/src/...]
npm run build
pm2 restart afiliadosbet
```

### Quando Alterar package.json
```bash
cd /var/www/afiliadosbet
pm2 stop afiliadosbet
# [ATUALIZAR package.json]
npm install
npm run build
pm2 restart afiliadosbet
```

---

## 🚨 Troubleshooting Rápido

### Se o site não carregar:
```bash
# Verificar se PM2 está rodando
pm2 status

# Reiniciar tudo
pm2 restart all

# Ver logs de erro
pm2 logs afiliadosbet --lines 50
```

### Se login não funcionar:
```bash
# Verificar logs específicos de login
pm2 logs afiliadosbet | grep -i "login\|error\|sasl"

# Verificar banco PostgreSQL
psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "SELECT 1;"
```

### Se PostgreSQL não conectar:
```bash
# Verificar se está rodando
systemctl status postgresql-15

# Reiniciar PostgreSQL
systemctl restart postgresql-15

# Verificar configuração
cat .env | grep DATABASE_URL
```

---

## 📝 Checklist de Atualização

- [ ] Conectei ao servidor
- [ ] Fiz backup dos arquivos importantes
- [ ] Atualizei os arquivos necessários
- [ ] Executei `npm run build`
- [ ] Reiniciei com `pm2 restart afiliadosbet`
- [ ] Verifiquei logs com `pm2 logs afiliadosbet`
- [ ] Testei o site no navegador
- [ ] Login funciona corretamente

---

## 🔑 Credenciais de Teste
```
Admin: admin@afiliadosbet.com.br / admin123
Afiliado: afiliado@afiliadosbet.com.br / admin123
```

---

## 📞 Comandos de Emergência

### Restaurar Backup
```bash
cd /var/www/afiliadosbet
pm2 stop afiliadosbet
cp server/index.ts.backup server/index.ts
npm run build
pm2 restart afiliadosbet
```

### Resetar Completamente
```bash
cd /var/www/afiliadosbet
pm2 stop afiliadosbet
git reset --hard HEAD  # Se usando Git
npm install
npm run build
pm2 restart afiliadosbet
```

### Ver Status Completo do Sistema
```bash
# PM2
pm2 status
pm2 logs afiliadosbet --lines 10

# PostgreSQL
systemctl status postgresql-15

# Nginx
systemctl status nginx

# Espaço em disco
df -h

# Memória
free -h
```

---

## 💡 Dicas Importantes

1. **SEMPRE fazer backup antes de atualizar**
2. **Testar em ambiente local primeiro quando possível**
3. **Verificar logs após cada atualização**
4. **Manter um backup da versão funcionando anterior**
5. **Anotar as mudanças feitas para reverter se necessário**

---

Este guia contém os comandos essenciais para manter o servidor atualizado sem complicações!