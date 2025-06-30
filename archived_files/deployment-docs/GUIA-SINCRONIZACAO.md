# Guia Completo: Sincronizar Alterações do Replit para o Servidor

## Resumo Rápido

1. **Fazer alterações aqui no Replit**
2. **Testar se funciona**
3. **No servidor, executar: `bash sincronizar.sh`**

---

## Configuração Inicial (Fazer uma vez)

### 1. No Servidor VPS

```bash
# Conectar no servidor
ssh usuario@69.62.65.24
cd /var/www/afiliadosbet

# Baixar o script de sincronização
curl -O https://raw.githubusercontent.com/seu-repo/main/sincronizar.sh
chmod +x sincronizar.sh
```

### 2. Configurar Git (se ainda não fez)

```bash
# No servidor, configurar Git
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# Conectar ao repositório
git remote -v  # Verificar se está conectado
```

---

## Fluxo Diário de Trabalho

### Aqui no Replit:

1. **Fazer suas alterações normalmente**
   - Editar arquivos CSS, JS, páginas
   - Adicionar funcionalidades
   - Corrigir bugs

2. **Testar no ambiente de desenvolvimento**
   - Verificar se não há erros
   - Testar funcionalidades alteradas

3. **Salvar mudanças**
   - As mudanças são salvas automaticamente
   - Verificar se o projeto está funcionando

### No Servidor VPS:

```bash
# Conectar no servidor
ssh usuario@69.62.65.24
cd /var/www/afiliadosbet

# Executar sincronização
bash sincronizar.sh
```

**O script faz automaticamente:**
- Para a aplicação
- Baixa código atualizado do Git
- Instala dependências necessárias
- Compila a aplicação
- Atualiza banco de dados
- Reinicia a aplicação
- Mostra status final

---

## Comandos Úteis no Servidor

### Verificar Status
```bash
pm2 status                    # Ver se aplicação está rodando
pm2 logs afiliadosbet        # Ver logs da aplicação
curl http://localhost:3000   # Testar se responde
```

### Reiniciar Manualmente
```bash
pm2 restart afiliadosbet     # Reiniciar aplicação
pm2 stop afiliadosbet        # Parar aplicação
pm2 start afiliadosbet       # Iniciar aplicação
```

### Ver Logs de Erro
```bash
pm2 logs afiliadosbet --err  # Só erros
pm2 logs afiliadosbet -f     # Logs em tempo real
```

---

## Tipos de Alterações Comuns

### 1. Correções de CSS (como as bordas)
- Alterar arquivo CSS aqui no Replit
- Executar `bash sincronizar.sh` no servidor
- Mudanças aparecem imediatamente

### 2. Novas Funcionalidades
- Adicionar código aqui no Replit
- Testar funcionalidade
- Sincronizar no servidor
- Verificar se funciona em produção

### 3. Correções de Bugs
- Identificar e corrigir aqui
- Testar correção
- Aplicar no servidor
- Confirmar que bug foi resolvido

---

## Solução de Problemas

### Se sincronização falhar:

1. **Verificar conexão Git:**
```bash
cd /var/www/afiliadosbet
git status
git pull origin main
```

2. **Reinstalar dependências:**
```bash
rm -rf node_modules
npm install
npm run build
pm2 restart afiliadosbet
```

3. **Verificar logs de erro:**
```bash
pm2 logs afiliadosbet --err --lines 20
```

### Se aplicação não iniciar:

1. **Verificar porta:**
```bash
pm2 delete afiliadosbet
pm2 start dist/index.js --name afiliadosbet
```

2. **Verificar banco de dados:**
```bash
npm run db:push
```

---

## Backup Antes de Alterações

### Criar backup manual:
```bash
cd /var/www
cp -r afiliadosbet backup-$(date +%Y%m%d-%H%M%S)
```

### Restaurar backup se necessário:
```bash
cd /var/www
pm2 stop afiliadosbet
rm -rf afiliadosbet
mv backup-YYYYMMDD-HHMMSS afiliadosbet
cd afiliadosbet
pm2 restart afiliadosbet
```

---

## Checklist de Sincronização

Antes de sincronizar:
- [ ] Testei as mudanças no Replit
- [ ] Não há erros no console
- [ ] Funcionalidade está funcionando

Durante sincronização:
- [ ] Executei `bash sincronizar.sh`
- [ ] Aguardei conclusão do script
- [ ] Verifiquei status com `pm2 status`

Após sincronização:
- [ ] Testei o site em produção
- [ ] Verifiquei se não há erros nos logs
- [ ] Confirmei que mudanças estão aplicadas

---

## Automatização Avançada

### Script de verificação automática:
```bash
# Criar arquivo check-status.sh
#!/bin/bash
echo "Status da aplicação:"
pm2 status | grep afiliadosbet
echo "Últimos logs:"
pm2 logs afiliadosbet --lines 5 --nostream
echo "Teste de conectividade:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

### Monitoramento contínuo:
```bash
# Ver logs em tempo real
pm2 logs afiliadosbet -f

# Monitorar recursos
pm2 monit
```

---

## Contatos de Emergência

Se algo der muito errado:
1. Fazer rollback para backup
2. Verificar logs detalhadamente
3. Contactar suporte técnico se necessário

**Lembre-se:** Sempre teste aqui no Replit antes de sincronizar para produção!