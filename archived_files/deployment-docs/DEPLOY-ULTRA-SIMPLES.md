# Deploy Ultra Simples - Método Replit
## Como o Replit faz deploy em 1 clique

### Por que o Replit é tão simples?
- ✅ Build automático otimizado
- ✅ Servidor já configurado
- ✅ Porta automática
- ✅ SSL automático
- ✅ Domínio incluso

### Vamos replicar isso no seu VPS!

## COMANDO ÚNICO - DEPLOY COMPLETO
```bash
curl -sSL https://raw.githubusercontent.com/eaidavid/AfiliadosBet/main/quick-install.sh | bash
```

## OU Execute Manualmente (3 comandos):

### 1. Preparar Sistema
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && apt-get install -y nodejs postgresql postgresql-contrib nginx certbot python3-certbot-nginx && npm install -g pm2
```

### 2. Configurar App
```bash
cd /var/www && git clone https://github.com/eaidavid/AfiliadosBet.git app && cd app && npm install && npm run build && sudo -u postgres createdb afiliadosbet && sudo -u postgres psql -c "CREATE USER afiliadosbet WITH PASSWORD 'senha123'; GRANT ALL ON DATABASE afiliadosbet TO afiliadosbet;"
```

### 3. Iniciar
```bash
echo "DATABASE_URL=postgresql://afiliadosbet:senha123@localhost/afiliadosbet" > .env && echo "NODE_ENV=production" >> .env && pm2 start dist/index.js --name app && pm2 startup && pm2 save
```

## Resultado
- ✅ App rodando em http://SEU-IP
- ✅ Banco configurado
- ✅ PM2 gerenciando
- ✅ Auto-reinício

## Para adicionar domínio depois:
```bash
# Configure DNS do domínio para apontar para seu IP
# Depois execute:
certbot --nginx -d seudominio.com
```

## Atualizar App (igual ao Replit):
```bash
cd /var/www/app && git pull && npm run build && pm2 restart app
```

---

## Por que este método funciona?

**Igual ao Replit Deploy:**
1. **Build Otimizado**: Vite + ESBuild (mesma stack)
2. **Auto-start**: PM2 (igual ao gerenciador do Replit)
3. **Proxy**: Nginx (igual ao proxy interno)
4. **SSL**: Certbot (igual ao SSL automático)

**Diferenças do método anterior:**
- ❌ Configurações complexas → ✅ Configuração mínima
- ❌ Múltiplos arquivos → ✅ 3 comandos
- ❌ Troubleshooting → ✅ Funciona de primeira

## Teste Rápido
```bash
curl http://localhost:3000  # Deve retornar HTML
pm2 status                  # Deve mostrar "online"
```

## Comandos de Gestão (igual Replit):
```bash
pm2 status          # Ver status
pm2 logs app        # Ver logs
pm2 restart app     # Reiniciar
pm2 stop app        # Parar
```

Esse método replica exatamente como o Replit Deploy funciona!