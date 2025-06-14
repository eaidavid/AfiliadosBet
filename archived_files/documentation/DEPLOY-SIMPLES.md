# Deploy Ultra Simples - 3 Métodos

## Método 1: Docker (MAIS FÁCIL)
**Funciona em qualquer servidor com Docker**

```bash
# 1. Baixar seu código no servidor
git clone seu-repositorio.git
cd afiliados-bet

# 2. Executar um comando
docker-compose up -d

# PRONTO! Sistema funcionando em http://localhost
```

**Custo:** $5-15/mês (DigitalOcean, Vultr, AWS)

---

## Método 2: Script Automático
**Para Ubuntu/CentOS**

```bash
# 1. Baixar seu código
git clone seu-repositorio.git
cd afiliados-bet

# 2. Executar script
chmod +x deploy-easy.sh
./deploy-easy.sh

# PRONTO! Sistema funcionando
```

---

## Método 3: Vercel/Netlify (GRATUITO)
**Para teste rápido**

1. Fazer push do código para GitHub
2. Conectar GitHub no Vercel
3. Deploy automático

**Limitação:** Banco de dados separado necessário

---

## Recomendação Final

**Para produção séria:** Use Método 1 (Docker)
- Mais estável
- Backups automáticos
- Fácil de migrar
- Independente de plataforma

**Provedores recomendados:**
- DigitalOcean: $6/mês
- Vultr: $5/mês  
- AWS Lightsail: $5/mês

**Setup completo em 5 minutos com Docker**