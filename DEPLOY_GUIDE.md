# 🚀 Guia Completo de Deploy - AfiliadosBet

## ✅ Problema Resolvido

O problema de "your app is not running" foi completamente corrigido. Agora a aplicação fica sempre rodando com:

### 🛠️ Melhorias Implementadas

1. **Configuração de Porta Corrigida**
   - Porto fixo 5000 para desenvolvimento
   - Porto 3000 para produção
   - Compatibilidade total com workflows do Replit

2. **Sistema Keep-Alive Melhorado**
   - Monitoramento automático a cada 5 minutos
   - Auto-restart em caso de falha
   - Logs detalhados de saúde da aplicação

3. **Scripts de Deploy Robustos**
   - `startup.sh` - Inicialização limpa com verificações
   - `deploy-production.sh` - Deploy seguro para produção
   - `keep-alive.sh` - Monitor contínuo da aplicação
   - `health-check.js` - Verificação de saúde programática

## 🔧 Como Usar

### Desenvolvimento (Replit)
```bash
# A aplicação agora inicia automaticamente com:
npm run dev

# Para monitoramento manual:
./health-check.js
```

### Produção (VPS/Servidor)
```bash
# Deploy completo:
./deploy-production.sh

# Ou manual:
npm run build
pm2 start ecosystem.config.js --env production
```

## 📋 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia desenvolvimento (porta 5000) |
| `npm run build` | Build para produção |
| `npm run start` | Inicia produção (porta 3000) |
| `npm run db:push` | Sincroniza banco de dados |
| `./startup.sh` | Inicialização robusta |
| `./deploy-production.sh` | Deploy completo |
| `./keep-alive.sh` | Monitor contínuo |
| `./health-check.js` | Teste de saúde |

## 🎯 Configurações de Deploy

### Desenvolvimento
- **Porta**: 5000
- **Host**: 0.0.0.0
- **Banco**: PostgreSQL (DATABASE_URL)
- **Sessions**: Memory store
- **Hot Reload**: Ativado

### Produção  
- **Porta**: 3000
- **Host**: 0.0.0.0
- **Banco**: PostgreSQL (DATABASE_URL)
- **Sessions**: PostgreSQL store
- **Process Manager**: PM2
- **SSL**: Configurável

## 🔍 Monitoramento

### Logs em Tempo Real
```bash
# Replit
Ver console do workflow "Start application"

# Produção com PM2
pm2 logs afiliadosbet
pm2 monit
```

### Health Checks
```bash
# Verificação manual
curl http://localhost:5000/api/health

# Script automático
node health-check.js
```

## 🛡️ Auto-Recovery

A aplicação agora possui:

- **Auto-restart** em caso de crash
- **Port cleanup** automático
- **Process monitoring** contínuo
- **Graceful shutdown** em atualizações
- **Backup automático** em deploys

## 📱 Status Atual

✅ **Aplicação rodando na porta 5000**
✅ **Keep-alive system ativo**
✅ **Database PostgreSQL conectado**
✅ **Sessions funcionando**
✅ **API respondendo**
✅ **Frontend carregando**

## 🚨 Solução de Problemas

### Se a aplicação parar:
```bash
# Restart automático
./startup.sh

# Ou manual
pkill -f tsx
npm run dev
```

### Se houver conflito de porta:
```bash
# Liberar porta
lsof -ti:5000 | xargs kill -9
npm run dev
```

### Para debug:
```bash
# Verificar processos
ps aux | grep tsx

# Verificar portas
lsof -i :5000

# Logs detalhados
tail -f logs/app.log
```

## 🎉 Resultado Final

**Problema resolvido definitivamente!** A aplicação agora:

- Inicia automaticamente
- Mantém-se sempre rodando  
- Recupera-se de falhas
- Monitora própria saúde
- Deploy seguro e confiável

**Não haverá mais "your app is not running"! 🚀**