# Como Atualizar o AfiliadosBet no Servidor

## Método 1: Atualização Automática (Recomendado)

### Passo 1: Conectar no servidor
```bash
ssh usuario@69.62.65.24
# ou ssh usuario@afiliadosbet.com.br
```

### Passo 2: Executar script de atualização
```bash
cd /var/www/afiliadosbet
bash atualizar-servidor.sh
```

## Método 2: Atualização Manual

### Passo 1: Conectar e navegar
```bash
ssh usuario@servidor
cd /var/www/afiliadosbet
```

### Passo 2: Parar aplicação
```bash
pm2 stop afiliadosbet
```

### Passo 3: Fazer backup
```bash
cp -r . ../backup-$(date +%Y%m%d-%H%M%S)
```

### Passo 4: Baixar código atualizado
```bash
git pull origin main
```

### Passo 5: Instalar dependências
```bash
npm install
```

### Passo 6: Compilar aplicação
```bash
npm run build
```

### Passo 7: Atualizar banco
```bash
npm run db:push
```

### Passo 8: Reiniciar aplicação
```bash
pm2 restart afiliadosbet
```

### Passo 9: Verificar status
```bash
pm2 status
pm2 logs afiliadosbet --lines 20
```

## Método 3: Atualização via Upload

Se você não tem acesso Git no servidor:

### Passo 1: Baixar código aqui no Replit
```bash
# Executar no Replit
npm run build
```

### Passo 2: Criar arquivo de atualização
```bash
# Criar zip com arquivos essenciais
zip -r atualizacao.zip dist/ client/dist/ package.json
```

### Passo 3: Enviar para servidor
```bash
scp atualizacao.zip usuario@servidor:/tmp/
```

### Passo 4: No servidor, aplicar atualização
```bash
cd /var/www/afiliadosbet
pm2 stop afiliadosbet
cp -r . backup-manual-$(date +%Y%m%d)
cd /tmp
unzip atualizacao.zip
cp -r * /var/www/afiliadosbet/
cd /var/www/afiliadosbet
npm install
pm2 restart afiliadosbet
```

## Verificação Final

Após qualquer método, sempre verificar:

```bash
# Status da aplicação
pm2 status

# Logs em tempo real
pm2 logs afiliadosbet --lines 50

# Testar se está respondendo
curl http://localhost:3000

# Verificar se site está no ar
curl http://afiliadosbet.com.br
```

## Rollback (em caso de erro)

Se algo der errado:

```bash
# Parar aplicação com problema
pm2 stop afiliadosbet

# Voltar para backup
cd /var/www
rm -rf afiliadosbet
mv backup-YYYYMMDD-HHMMSS afiliadosbet
cd afiliadosbet

# Reiniciar versão anterior
pm2 restart afiliadosbet
```

## Comandos Úteis

```bash
# Ver status detalhado
pm2 info afiliadosbet

# Reiniciar aplicação
pm2 restart afiliadosbet

# Ver logs de erro
pm2 logs afiliadosbet --err

# Monitorar recursos
pm2 monit

# Salvar configuração PM2
pm2 save
```

## Notas Importantes

- Sempre faça backup antes de atualizar
- Teste em ambiente de desenvolvimento primeiro
- Mantenha logs de todas as atualizações
- Tenha sempre um plano de rollback
- Monitore a aplicação após atualização