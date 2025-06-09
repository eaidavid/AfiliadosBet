# Solicitação Final - API Lotogreen

## Para: Gerente da Lotogreen

Consegui identificar sua estrutura de API, mas preciso dos endpoints corretos para dados de conversão.

### Descoberto:
- Dashboard: `https://admin.aff.lotogreen.com/524277#/`
- API Base: `https://api.aff.lotogreen.com` 
- Health Check: ✅ Funcionando
- API Key: `a5d6e4d4-42fe-11f0-b046-027e66b7665d-524277` ✅ Autenticada

### Problema:
Os endpoints de dados retornam HTML ao invés de JSON:
- `/conversions` → Página web (não dados)
- `/api/conversions` → Página web (não dados)
- `/stats` → Página web (não dados)

### Preciso saber:
1. **Qual endpoint usar para buscar conversões/leads?**
   - Exemplo: `/api/v1/affiliate/conversions`
   - Ou: `/api/leads`, `/data/conversions`, etc.

2. **Há parâmetros obrigatórios?**
   - Filtros de data específicos?
   - Headers adicionais necessários?

3. **Formato esperado da requisição?**
   - GET com query parameters?
   - POST com body JSON?

### Teste rápido:
Se puder fornecer um exemplo de URL que funciona, posso testar imediatamente:
```
curl -X GET "https://api.aff.lotogreen.com/[ENDPOINT_CORRETO]" \
  -H "X-API-Key: a5d6e4d4-42fe-11f0-b046-027e66b7665d-524277"
```

A conexão está estabelecida, só falta o endpoint correto para finalizar a integração.