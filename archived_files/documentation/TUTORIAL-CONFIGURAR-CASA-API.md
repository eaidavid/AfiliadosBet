# 📚 Tutorial: Como Configurar uma Casa de Apostas por API

## 🎯 Objetivo
Este tutorial ensina como adicionar uma casa de apostas que fornece dados via API ao invés de postbacks tradicionais.

---

## 🚀 Quando Usar Integração por API

Use integração por API quando:
- ✅ A casa não oferece postbacks em tempo real
- ✅ Você quer controle total sobre quando buscar dados
- ✅ Precisa de dados históricos
- ✅ A casa oferece API robusta com autenticação

---

## 📋 Informações Necessárias

Antes de começar, colete essas informações da casa de apostas:

### 1. Dados Básicos
- **Nome da casa** (ex: Betfair)
- **Logo** (URL da imagem)
- **URL de afiliação** (link que seus afiliados usarão)
- **Identificador único** (ex: betfair)

### 2. Estrutura de Comissões
- **Tipo**: CPA, RevShare ou Híbrido
- **Valores**: R$ 150 (CPA) ou 30% (RevShare)
- **Depósito mínimo**: R$ 10

### 3. Configuração da API
- **URL base**: https://api.casadeapostas.com
- **Método de autenticação**: Bearer, API Key, Basic ou Custom
- **Credenciais**: Token, usuário/senha, etc.
- **Endpoints disponíveis**: conversões, estatísticas, comissões

### 4. Formato dos Dados
- **Campo do afiliado**: affiliate_id, subid, ref_id
- **Campo do valor**: amount, value, transaction_amount
- **Campo do evento**: event_type, action, conversion_type

---

## 🛠️ Passo a Passo: Configuração

### Passo 1: Acessar o Painel Admin
1. Faça login como administrador
2. Vá para **Casas de Apostas** no menu
3. Clique em **"Nova Casa API"**

### Passo 2: Informações Básicas
Na aba **"Básico"**:

```
Nome da Casa: Betfair
Identificador: betfair
Descrição: Casa de apostas internacional com foco em exchange
URL do Logo: https://betfair.com/logo.png
URL de Afiliação: https://betfair.com/register?ref=VALUE
Parâmetro Principal: subid
Token de Segurança: token123_betfair_seguro
```

**Dica**: O campo VALUE será substituído automaticamente pelo username do afiliado.

### Passo 3: Configurar Comissões
Na aba **"Comissões"**:

#### Para CPA (Valor Fixo):
```
Tipo de Comissão: CPA (Custo Por Aquisição)
Valor CPA: 200.00
Depósito Mínimo: 25.00
```

#### Para RevShare (Percentual):
```
Tipo de Comissão: RevShare (Divisão de Receita)
Percentual RevShare: 30
Depósito Mínimo: 0
```

#### Para Híbrido:
```
Tipo de Comissão: Híbrido (CPA + RevShare)
Valor CPA: 150.00
Percentual RevShare: 25
Depósito Mínimo: 20.00
```

### Passo 4: Configurar API
Na aba **"API Config"**:

#### URL e Autenticação:
```
URL Base da API: https://api.betfair.com/v1
Tipo de Autenticação: Bearer Token
Bearer Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Endpoints:
```
Endpoint de Conversões: /affiliate/conversions
Endpoint de Estatísticas: /affiliate/stats
Endpoint de Comissões: /affiliate/commissions
```

### Passo 5: Mapeamento de Dados
Na aba **"Mapeamento"**:

```
Campo do SubID: affiliate_id
Campo do Valor: transaction_amount
Campo do Evento: event_type
Frequência de Sincronização: A cada Hora
```

### Passo 6: Testar Conexão
1. Clique em **"Testar Conexão"**
2. Aguarde o resultado
3. Se bem-sucedido, verá: ✅ "Conexão bem-sucedida"
4. Se houver erro, ajuste as configurações

### Passo 7: Salvar e Ativar
1. Clique em **"Criar Casa"**
2. A casa será salva e ativada automaticamente
3. Primeira sincronização será executada

---

## 🔄 Testando a Integração

### Teste Manual de Sincronização
1. Na lista de casas, encontre sua casa API
2. Clique no botão **"Sync"**
3. Aguarde o processamento
4. Verifique se as conversões aparecem no sistema

### Verificando Logs
As sincronizações são registradas automaticamente. Para problemas:
1. Verifique se a API retorna dados no formato esperado
2. Confirme se o mapeamento de campos está correto
3. Teste as credenciais de autenticação

---

## 📊 Exemplos Práticos

### Exemplo 1: Betfair (Bearer Token)
```json
{
  "name": "Betfair",
  "apiBaseUrl": "https://api.betfair.com/exchange/betting/rest/v1.0",
  "authType": "bearer",
  "authToken": "seu_token_betfair_aqui",
  "conversionsEndpoint": "/listMarketBook",
  "subidField": "customerRef",
  "amountField": "totalMatched",
  "eventField": "status"
}
```

### Exemplo 2: Bet365 (API Key)
```json
{
  "name": "Bet365",
  "apiBaseUrl": "https://api.bet365.com/v2",
  "authType": "apikey",
  "authApiKey": "ak_live_1234567890abcdef",
  "conversionsEndpoint": "/affiliate/conversions",
  "subidField": "affiliate_id",
  "amountField": "amount",
  "eventField": "event_type"
}
```

### Exemplo 3: 1xBet (Basic Auth)
```json
{
  "name": "1xBet",
  "apiBaseUrl": "https://api.1xbet.com/affiliate",
  "authType": "basic",
  "authUsername": "affiliate_user",
  "authPassword": "senha_secreta",
  "conversionsEndpoint": "/statistics",
  "subidField": "tag",
  "amountField": "sum",
  "eventField": "type"
}
```

---

## ⚠️ Problemas Comuns e Soluções

### 1. Erro 401 - Unauthorized
**Problema**: Credenciais inválidas
**Solução**: 
- Verificar token/API key
- Confirmar formato da autenticação
- Testar credenciais diretamente na API da casa

### 2. Afiliado Não Encontrado
**Problema**: Campo do subid incorreto
**Solução**:
- Verificar documentação da API
- Ajustar campo "SubID" no mapeamento
- Confirmar formato do username no sistema

### 3. Dados Não Sincronizando
**Problema**: Endpoint ou mapeamento incorreto
**Solução**:
- Testar endpoint manualmente (Postman/curl)
- Verificar formato da resposta da API
- Ajustar mapeamento de campos

### 4. Comissões Incorretas
**Problema**: Cálculo errado das comissões
**Solução**:
- Revisar tipo de comissão (CPA/RevShare/Híbrido)
- Verificar valores configurados
- Confirmar eventos que geram comissão

---

## 🔧 Comandos de Teste

### Testando API Manualmente
```bash
# Bearer Token
curl -H "Authorization: Bearer SEU_TOKEN" \
     -H "Content-Type: application/json" \
     https://api.casa.com/conversions

# API Key
curl -H "X-API-Key: SUA_API_KEY" \
     -H "Content-Type: application/json" \
     https://api.casa.com/conversions

# Basic Auth
curl -u usuario:senha \
     -H "Content-Type: application/json" \
     https://api.casa.com/conversions
```

### Sincronização Manual via API
```bash
POST /api/admin/houses/123/sync
Content-Type: application/json

{
  "dateFrom": "2024-01-01",
  "dateTo": "2024-01-31"
}
```

---

## 📈 Monitoramento e Manutenção

### Verificações Regulares
- ✅ Testa conexão semanalmente
- ✅ Monitora logs de sincronização
- ✅ Verifica se comissões estão sendo calculadas
- ✅ Confirma que não há conversões duplicadas

### Sincronização Automática
O sistema executa sincronização baseada na frequência configurada:
- **Tempo Real**: Busca contínua (use com cuidado)
- **Horária**: Recomendado para a maioria dos casos
- **Diária**: Para casas com poucos dados

### Logs e Relatórios
Todos os eventos são registrados:
- Tentativas de sincronização
- Conversões processadas
- Erros de API
- Comissões calculadas

---

## 📞 Checklist Final

Antes de ativar uma casa API, confirme:

- [ ] **Dados básicos** preenchidos corretamente
- [ ] **Estrutura de comissão** definida (CPA/RevShare/Híbrido)
- [ ] **Credenciais de API** válidas e testadas
- [ ] **Endpoints** corretos e acessíveis
- [ ] **Mapeamento de dados** configurado adequadamente
- [ ] **Teste de conexão** bem-sucedido
- [ ] **Primeira sincronização** executada
- [ ] **Conversões aparecendo** no sistema
- [ ] **Comissões sendo calculadas** corretamente

---

## 🎯 Resumo

A integração por API oferece:
- **Controle total** sobre sincronização de dados
- **Flexibilidade** para diferentes formatos de API
- **Histórico completo** de conversões
- **Suporte a múltiplos** métodos de autenticação

Com este tutorial, você pode integrar praticamente qualquer casa de apostas que ofereça API, expandindo significativamente suas opções de parceria no sistema de afiliados AfiliadosBet.

**Tempo estimado de configuração**: 15-30 minutos por casa (dependendo da complexidade da API).