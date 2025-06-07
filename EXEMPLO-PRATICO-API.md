# 🎯 Exemplo Prático: Configurando Betfair via API

## Cenário Real
Você quer adicionar a Betfair ao seu sistema, mas ela não oferece postbacks. Em vez disso, fornece uma API REST para consultar conversões.

---

## 📋 Informações da Betfair

### Dados Fornecidos pela Casa:
```
Nome: Betfair Exchange
URL da API: https://api.betfair.com/exchange/betting/rest/v1.0
Autenticação: Bearer Token
Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
Endpoint de Conversões: /listMarketBook
Comissão: 25% RevShare sobre profit
Depósito Mínimo: £10
```

### Formato da Resposta da API:
```json
{
  "result": [
    {
      "marketId": "1.123456789",
      "customerRef": "eadavid",
      "totalMatched": 50.00,
      "status": "OPEN",
      "eventType": "deposit",
      "settledDate": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 🛠️ Configuração Passo a Passo

### 1. Acessar o Sistema
- Login como admin
- Ir para **Casas de Apostas**
- Clicar **"Nova Casa API"**

### 2. Aba "Básico"
```
Nome da Casa: Betfair Exchange
Identificador: betfair
Descrição: Casa de apostas internacional com sistema de exchange
URL do Logo: https://www.betfair.com/favicon.ico
URL de Afiliação: https://promotions.betfair.com/new-customer?referrer=VALUE
Parâmetro Principal: subid
Token de Segurança: betfair_token_2024_secure
```

### 3. Aba "Comissões"
```
Tipo de Comissão: RevShare (Divisão de Receita)
Percentual RevShare: 25
Depósito Mínimo: 10.00
```

### 4. Aba "API Config"
```
URL Base da API: https://api.betfair.com/exchange/betting/rest/v1.0
Tipo de Autenticação: Bearer Token
Bearer Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

Endpoint de Conversões: /listMarketBook
Endpoint de Estatísticas: /listMarketCatalogue
Endpoint de Comissões: /listMarketBook
```

### 5. Aba "Mapeamento"
```
Campo do SubID: customerRef
Campo do Valor: totalMatched  
Campo do Evento: eventType
Frequência de Sincronização: A cada Hora
```

---

## 🧪 Testando a Configuração

### 1. Teste de Conexão
- Clicar **"Testar Conexão"**
- Resultado esperado: ✅ "Conexão bem-sucedida"

### 2. Primeira Sincronização
- Clicar **"Sync"** na lista de casas
- Verificar logs de sincronização

### 3. Verificação Manual
```bash
# Teste direto na API da Betfair
curl -H "Authorization: Bearer SEU_TOKEN" \
     -H "Content-Type: application/json" \
     "https://api.betfair.com/exchange/betting/rest/v1.0/listMarketBook"
```

---

## 📊 Como Funciona na Prática

### Quando um Afiliado Gera um Link:
1. Afiliado "eadavid" quer promover Betfair
2. Sistema gera: `https://promotions.betfair.com/new-customer?referrer=eadavid`
3. Usuário clica e se cadastra na Betfair
4. Betfair registra "eadavid" como referrer

### Sincronização Automática:
1. A cada hora, sistema consulta API da Betfair
2. Busca conversões com `customerRef = "eadavid"`
3. Encontra depósito de £50
4. Calcula comissão: £50 × 25% = £12.50
5. Registra conversão no sistema

### Resultado no Painel:
```
Afiliado: eadavid
Casa: Betfair Exchange
Evento: Depósito
Valor: £50.00
Comissão: £12.50
Data: 15/01/2024 10:30
```

---

## 🔄 Fluxo Completo de Dados

### 1. Configuração Inicial
```
Sistema AfiliadosBet → Configura casa Betfair
↓
Testa conexão com API
↓
Salva configurações
```

### 2. Geração de Link
```
Afiliado solicita link → Sistema gera URL com username
↓
https://promotions.betfair.com/new-customer?referrer=eadavid
```

### 3. Conversão do Usuário
```
Usuário clica no link → Se cadastra na Betfair
↓
Faz depósito de £50
↓
Betfair registra "eadavid" como referrer
```

### 4. Sincronização
```
Sistema consulta API da Betfair a cada hora
↓
Busca conversões para "eadavid"
↓
Encontra depósito de £50
↓
Calcula comissão: £50 × 25% = £12.50
↓
Registra no banco de dados
```

---

## 🚨 Problemas Comuns

### Erro: Token Inválido
```
Resposta da API: 401 Unauthorized
Solução: Verificar se o Bearer Token está correto
```

### Erro: Afiliado Não Encontrado
```
Log: "Afiliado não encontrado: johndoe"
Problema: Username "johndoe" não existe no sistema
Solução: Verificar se afiliado está cadastrado
```

### Erro: Campo Não Encontrado
```
Log: "Campo customerRef não encontrado na resposta"
Problema: Mapeamento incorreto
Solução: Verificar estrutura da resposta da API
```

---

## 📈 Monitoramento

### Verificações Diárias:
- Sincronizações executando normalmente
- Conversões sendo registradas
- Comissões calculadas corretamente
- Sem erros de API nos logs

### Métricas Importantes:
- Taxa de sucesso da API: > 95%
- Tempo de resposta: < 2 segundos
- Conversões por hora: Variável
- Comissões totais: Crescente

---

## 💡 Dicas de Otimização

### Performance:
- Configure sincronização horária (não tempo real)
- Use filtros de data para reduzir dados
- Monitore rate limits da API

### Segurança:
- Renove tokens periodicamente
- Use HTTPS sempre
- Não exponha credenciais nos logs

### Confiabilidade:
- Implemente retry automático
- Monitore uptime da API da casa
- Tenha alertas para falhas

---

## ✅ Checklist de Sucesso

Configuração bem-sucedida quando:

- [ ] ✅ Teste de conexão passa
- [ ] ✅ Primeira sincronização retorna dados
- [ ] ✅ Afiliados conseguem gerar links
- [ ] ✅ Conversões aparecem no sistema
- [ ] ✅ Comissões são calculadas
- [ ] ✅ Não há erros nos logs
- [ ] ✅ Dados batem com relatórios da casa

**Resultado**: Sistema totalmente integrado com Betfair via API, processando conversões automaticamente e calculando comissões em tempo real.

Este exemplo mostra como uma integração API funciona na prática, desde a configuração inicial até o processamento automático de conversões e comissões.