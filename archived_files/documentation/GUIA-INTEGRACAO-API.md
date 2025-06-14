# 🔗 Guia de Integração API - Casas de Apostas

## 📋 Visão Geral

O sistema AfiliadosBet agora suporta duas formas de integração com casas de apostas:

1. **Postback (Webhook)** - A casa envia dados automaticamente
2. **API (Consulta Ativa)** - Nosso sistema consulta a API da casa periodicamente

---

## 🎯 Integração por API

### Vantagens
- ✅ Controle total sobre quando buscar dados
- ✅ Sincronização programada (horária, diária)
- ✅ Busca histórica de conversões
- ✅ Suporte a diferentes métodos de autenticação
- ✅ Ideal para casas que não oferecem postbacks

### Tipos de Autenticação Suportados

#### 1. Bearer Token
```http
Authorization: Bearer seu_token_aqui
```

#### 2. API Key
```http
X-API-Key: sua_api_key_aqui
```

#### 3. Basic Authentication
```http
Authorization: Basic base64(usuario:senha)
```

#### 4. Headers Customizados
```json
{
  "X-Custom-Auth": "valor",
  "Authorization": "Custom token123"
}
```

---

## 🏠 Configurando uma Casa por API

### Passo 1: Informações Básicas
- **Nome**: Nome da casa (ex: "Betfair")
- **Identificador**: ID único (ex: "betfair")
- **URL de Afiliação**: Link com placeholder VALUE
- **Logo**: URL da imagem do logo

### Passo 2: Estrutura de Comissões
- **CPA**: Valor fixo por conversão (ex: R$ 200)
- **RevShare**: Percentual da receita (ex: 25%)
- **Híbrido**: CPA + RevShare combinados

### Passo 3: Configuração da API

#### URL Base da API
```
https://api.casadeapostas.com
```

#### Endpoints Necessários
- **Conversões**: `/api/affiliate/conversions`
- **Estatísticas**: `/api/affiliate/stats`
- **Comissões**: `/api/affiliate/commissions`

#### Mapeamento de Dados
Configure como os dados da API são interpretados:

```json
{
  "subidField": "affiliate_id",
  "amountField": "transaction_amount", 
  "eventField": "event_type"
}
```

### Passo 4: Autenticação
Configure o método de autenticação usado pela casa:

**Bearer Token:**
```json
{
  "authType": "bearer",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**API Key:**
```json
{
  "authType": "apikey",
  "apiKey": "ak_live_1234567890abcdef"
}
```

**Basic Auth:**
```json
{
  "authType": "basic",
  "username": "affiliate_user",
  "password": "senha_secreta"
}
```

---

## 📊 Exemplos de Respostas da API

### Endpoint de Conversões
A API da casa deve retornar dados neste formato:

```json
{
  "conversions": [
    {
      "affiliate_id": "eadavid",
      "customer_id": "12345",
      "event_type": "registration",
      "transaction_amount": 0,
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "affiliate_id": "eadavid", 
      "customer_id": "12345",
      "event_type": "first_deposit",
      "transaction_amount": 50.00,
      "created_at": "2024-01-15T11:00:00Z"
    }
  ]
}
```

### Eventos Suportados
- `registration` - Cadastro do usuário
- `first_deposit` - Primeiro depósito
- `deposit` - Depósitos subsequentes
- `profit` - Lucro da casa (para RevShare)

---

## ⚙️ Configuração no Painel Admin

### 1. Acessar Gerenciamento de Casas
```
/admin/houses
```

### 2. Criar Nova Casa API
1. Clique em "Nova Casa"
2. Preencha dados básicos
3. Na aba "Integração", selecione "API (Consulta Ativa)"
4. Configure autenticação na aba "API Config"
5. Teste a conexão

### 3. Testar Integração
- Use o botão "Testar Conexão" 
- Verifique se os dados são retornados corretamente
- Ajuste mapeamento se necessário

### 4. Sincronização
Configure a frequência de busca:
- **Tempo Real**: Busca contínua
- **Horária**: A cada hora
- **Diária**: Uma vez por dia

---

## 🔄 Sincronização Manual

### Via Painel Admin
1. Acesse a casa configurada
2. Clique em "Sincronizar Dados"
3. Selecione período (opcional)
4. Execute sincronização

### Via API
```bash
POST /api/admin/houses/123/sync
Content-Type: application/json

{
  "dateFrom": "2024-01-01",
  "dateTo": "2024-01-31"
}
```

---

## 🛠️ Implementação Técnica

### Estrutura no Banco de Dados
```sql
ALTER TABLE betting_houses ADD COLUMN integration_type TEXT DEFAULT 'postback';
ALTER TABLE betting_houses ADD COLUMN api_config JSONB DEFAULT '{}';
```

### Exemplo de api_config
```json
{
  "baseUrl": "https://api.casa.com",
  "authType": "bearer",
  "authData": {
    "token": "token_secreto"
  },
  "endpoints": {
    "conversions": "/api/affiliate/conversions",
    "stats": "/api/affiliate/stats"
  },
  "dataMapping": {
    "subidField": "affiliate_id",
    "amountField": "amount",
    "eventField": "event_type"
  },
  "syncSchedule": "hourly"
}
```

---

## 📝 Checklist de Integração

### Informações Necessárias da Casa
- [ ] URL base da API
- [ ] Método de autenticação
- [ ] Credenciais de acesso
- [ ] Documentação dos endpoints
- [ ] Formato dos dados retornados
- [ ] Estrutura de comissões

### Configuração no Sistema
- [ ] Casa criada no painel admin
- [ ] Tipo de integração definido como "API"
- [ ] Autenticação configurada
- [ ] Endpoints mapeados
- [ ] Mapeamento de dados configurado
- [ ] Teste de conexão realizado
- [ ] Primeira sincronização executada

### Validação
- [ ] Dados sendo sincronizados corretamente
- [ ] Afiliados sendo identificados pelo username
- [ ] Comissões calculadas adequadamente
- [ ] Conversões não duplicadas
- [ ] Logs de sincronização funcionando

---

## 🔍 Troubleshooting

### Erro de Autenticação
```
Erro HTTP 401: Unauthorized
```
**Solução**: Verificar credenciais e tipo de autenticação

### Afiliado Não Encontrado
```
Afiliado não encontrado: usuario123
```
**Solução**: Verificar se o campo `subidField` está correto

### Dados Não Sincronizando
```
0 conversões processadas
```
**Soluções**:
1. Verificar se a API retorna dados no período
2. Validar mapeamento de campos
3. Conferir formato de datas

### Conversões Duplicadas
**Solução**: Sistema verifica `customer_id` automaticamente

---

## 📞 Suporte

Para configurar uma nova integração por API:

1. **Colete as informações** listadas no checklist
2. **Teste a API** manualmente com Postman/curl
3. **Configure no painel** seguindo este guia
4. **Execute testes** de sincronização
5. **Monitore logs** para identificar problemas

## 🎯 Exemplo Prático: Configurando Betfair

### 1. Informações da Betfair
```json
{
  "name": "Betfair",
  "baseUrl": "https://api.betfair.com/exchange/betting/rest/v1.0",
  "authType": "bearer",
  "token": "seu_token_betfair",
  "endpoints": {
    "conversions": "/listMarketBook",
    "stats": "/listMarketCatalogue"
  }
}
```

### 2. Configurar no Sistema
1. Criar casa "Betfair" 
2. Definir comissão (ex: RevShare 30%)
3. Configurar API com bearer token
4. Mapear campos da resposta
5. Testar e ativar sincronização

Este sistema oferece flexibilidade total para integrar com qualquer casa que ofereça API, mantendo a compatibilidade com postbacks tradicionais.