# Tutorial: Como Sincronizar Mudanças do Replit para o Servidor VPS

## Fluxo de Desenvolvimento

1. **Fazer alterações aqui no Replit**
2. **Testar as mudanças**
3. **Enviar para o servidor VPS**

---

## Método 1: Sincronização via Git (Recomendado)

### Configuração Inicial (Fazer uma vez)

1. **Conectar repositório Git ao Replit:**
   - Na aba lateral esquerda, clique em "Version Control"
   - Conecte com seu GitHub/GitLab
   - Configure o repositório

2. **No servidor VPS, clonar o repositório:**
```bash
ssh usuario@69.62.65.24
cd /var/www
git clone https://github.com/seu-usuario/afiliadosbet.git
cd afiliadosbet
```

### Fluxo Diário de Trabalho

#### Aqui no Replit:

1. **Fazer suas alterações normalmente**
2. **Testar se está funcionando**
3. **Fazer commit das mudanças:**
   - Na aba "Version Control"
   - Escrever descrição da mudança
   - Clicar "Commit & Push"

#### No Servidor VPS:

```bash
# Conectar no servidor
ssh usuario@69.62.65.24
cd /var/www/afiliadosbet

# Aplicar mudanças automaticamente
bash sincronizar.sh
```

**Arquivo `sincronizar.sh` (criar no servidor):**
```bash
#!/bin/bash
echo "🔄 Sincronizando mudanças..."

# Parar aplicação
pm2 stop afiliadosbet

# Baixar mudanças
git pull origin main

# Instalar dependências (se houver)
npm install --production

# Compilar
npm run build

# Atualizar banco (se necessário)
npm run db:push

# Reiniciar
pm2 restart afiliadosbet

echo "✅ Sincronização concluída!"
pm2 status
```

---

## Método 2: Upload Manual de Arquivos

### Para mudanças pequenas (como CSS):

1. **Baixar arquivo específico do Replit**
2. **Enviar via SCP para o servidor**
3. **Aplicar no servidor**

**Exemplo para arquivo CSS:**

```bash
# Baixar arquivo do Replit
curl -o index.css https://replit.com/@seu-usuario/projeto/raw/main/client/src/index.css

# Enviar para servidor
scp index.css usuario@69.62.65.24:/var/www/afiliadosbet/client/src/

# No servidor, aplicar
ssh usuario@69.62.65.24
cd /var/www/afiliadosbet
pm2 stop afiliadosbet
npm run build
pm2 restart afiliadosbet
```

---

## Método 3: Exportar e Importar Projeto Completo

### Quando há muitas mudanças:

1. **Exportar projeto do Replit:**
   - Menu → Download as ZIP

2. **Enviar para servidor:**
```bash
# Descompactar e enviar
unzip projeto.zip
scp -r projeto/* usuario@69.62.65.24:/var/www/afiliadosbet/
```

3. **No servidor, aplicar:**
```bash
cd /var/www/afiliadosbet
pm2 stop afiliadosbet
npm install
npm run build
pm2 restart afiliadosbet
```

---

## Scripts Úteis para o Servidor

### 1. Script de Sincronização Completa (`sincronizar-completo.sh`):
```bash
#!/bin/bash
cd /var/www/afiliadosbet
pm2 stop afiliadosbet
git pull origin main
npm install
npm run build
npm run db:push
pm2 restart afiliadosbet
pm2 logs afiliadosbet --lines 10
```

### 2. Script de Backup antes da Sincronização (`backup-sync.sh`):
```bash
#!/bin/bash
cd /var/www
DATE=$(date +%Y%m%d_%H%M%S)
cp -r afiliadosbet backup_$DATE
cd afiliadosbet
git pull origin main
npm run build
pm2 restart afiliadosbet
```

### 3. Script de Rollback (`rollback.sh`):
```bash
#!/bin/bash
cd /var/www
LATEST_BACKUP=$(ls -t backup_* | head -1)
echo "Fazendo rollback para: $LATEST_BACKUP"
pm2 stop afiliadosbet
rm -rf afiliadosbet
mv $LATEST_BACKUP afiliadosbet
cd afiliadosbet
pm2 restart afiliadosbet
```

---

## Checklist de Sincronização

### Antes de enviar para produção:
- [ ] Testei as mudanças no Replit
- [ ] Fiz commit das mudanças
- [ ] Verifiquei se não quebrou nada

### No servidor:
- [ ] Fiz backup antes da atualização
- [ ] Executei script de sincronização
- [ ] Verifiquei logs de erro
- [ ] Testei se o site está funcionando

### Comandos de verificação:
```bash
# Status da aplicação
pm2 status

# Logs da aplicação
pm2 logs afiliadosbet --lines 20

# Testar se responde
curl http://localhost:3000

# Testar site público
curl http://afiliadosbet.com.br
```

---

## Solução de Problemas

### Se algo der errado:

1. **Ver logs de erro:**
```bash
pm2 logs afiliadosbet --err --lines 50
```

2. **Fazer rollback:**
```bash
bash rollback.sh
```

3. **Reiniciar do zero:**
```bash
pm2 delete afiliadosbet
pm2 start dist/index.js --name afiliadosbet
```

### Problemas comuns:

- **Erro de porta ocupada:** `pm2 delete all && pm2 start dist/index.js --name afiliadosbet`
- **Erro de dependências:** `rm -rf node_modules && npm install`
- **Erro de build:** `rm -rf dist && npm run build`
- **Erro de banco:** `npm run db:push`

---

## Automação Avançada

### Webhook para sincronização automática:

Configurar webhook no GitHub que chama o servidor sempre que há um push:

```bash
# No servidor, criar endpoint de webhook
# POST /webhook/deploy
curl -X POST http://69.62.65.24:3000/webhook/deploy
```

Isso vai executar automaticamente o script de sincronização sempre que você fizer commit no Replit.