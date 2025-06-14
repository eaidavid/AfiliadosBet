# 🔄 Guia de Postbacks Atualizados - Sistema Simplificado

## 📋 URLs dos Postbacks (Nova Versão)

O sistema agora usa rotas simplificadas para melhor compatibilidade e facilidade de configuração.

### Formato das URLs
```
https://seudominio.com/postback/{evento}?token={token}&subid={username}&customer_id={id}&value={valor}
```

---

## 🎯 Endpoints Disponíveis

### 1. Click (Rastreamento de Cliques)
```
GET /postback/click?token=SEU_TOKEN&subid=USERNAME&customer_id=12345
```
**Uso**: Registra quando alguém clica no link de afiliado
**Comissão**: R$ 0 (apenas tracking)

### 2. Registration (Cadastro)
```
GET /postback/register?token=SEU_TOKEN&subid=USERNAME&customer_id=12345
```
**Uso**: Registra quando usuário se cadastra na casa
**Comissão**: R$ 0 (apenas tracking)

### 3. Deposit (Depósito)
```
GET /postback/deposit?token=SEU_TOKEN&subid=USERNAME&customer_id=12345&value=50.00
```
**Uso**: Registra depósitos dos usuários
**Comissão**: R$ 150 (CPA) para depósitos ≥ R$ 10

### 4. Revenue (Receita)
```
GET /postback/revenue?token=SEU_TOKEN&subid=USERNAME&customer_id=12345&value=100.00
```
**Uso**: Registra receita/profit da casa
**Comissão**: 30% do valor (RevShare)

---

## 🔧 Parâmetros Obrigatórios

| Parâmetro | Descrição | Exemplo |
|-----------|-----------|---------|
| `token` | Token de segurança da casa | `token_1749225849382_9i1qbnmzj` |
| `subid` | Username do afiliado | `eadavid` |
| `customer_id` | ID único do cliente na casa | `12345` |
| `value` | Valor da transação (quando aplicável) | `50.00` |

---

## 📊 Exemplos Práticos

### Cenário: Afiliado "eadavid" promove Brazino

#### 1. Usuário clica no link
```
GET /postback/click?token=brazino_token_123&subid=eadavid&customer_id=67890
```
**Resposta**:
```json
{
  "status": "ok",
  "event": "click",
  "message": "Click registrado com sucesso",
  "affiliate": "eadavid"
}
```

#### 2. Usuário se cadastra
```
GET /postback/register?token=brazino_token_123&subid=eadavid&customer_id=67890
```

#### 3. Usuário faz depósito de R$ 25
```
GET /postback/deposit?token=brazino_token_123&subid=eadavid&customer_id=67890&value=25.00
```
**Resposta**:
```json
{
  "status": "ok",
  "event": "deposit",
  "message": "Depósito registrado com sucesso",
  "affiliate": "eadavid",
  "amount": 25.00,
  "commission": 150.00
}
```

#### 4. Casa tem lucro de R$ 80 com o cliente
```
GET /postback/revenue?token=brazino_token_123&subid=eadavid&customer_id=67890&value=80.00
```
**Resposta**:
```json
{
  "status": "ok",
  "event": "revenue", 
  "message": "Receita registrada com sucesso",
  "affiliate": "eadavid",
  "amount": 80.00,
  "commission": 24.00
}
```

---

## 🏠 Configurando uma Casa no Painel Admin

### 1. Dados Básicos
- **Nome**: Brazino
- **Identificador**: brazino
- **URL Base**: `https://brazpromo.com/promo/click/67f050c1a62ce?subid=VALUE`
- **Token de Segurança**: `brazino_token_123`

### 2. URLs de Postback Geradas
O sistema gera automaticamente:
```
Click: /postback/click?token=brazino_token_123&subid={username}&customer_id={customer_id}
Register: /postback/register?token=brazino_token_123&subid={username}&customer_id={customer_id}
Deposit: /postback/deposit?token=brazino_token_123&subid={username}&customer_id={customer_id}&value={amount}
Revenue: /postback/revenue?token=brazino_token_123&subid={username}&customer_id={customer_id}&value={amount}
```

---

## 🔍 Testando os Postbacks

### Teste Manual via Navegador
```
https://seusite.com/postback/deposit?token=test_token&subid=eadavid&customer_id=12345&value=50.00
```

### Teste via cURL
```bash
curl "https://seusite.com/postback/deposit?token=test_token&subid=eadavid&customer_id=12345&value=50.00"
```

### Resposta Esperada
```json
{
  "status": "ok",
  "event": "deposit",
  "message": "Depósito registrado com sucesso",
  "affiliate": "eadavid",
  "amount": 50,
  "commission": 150
}
```

---

## 🚨 Resolução de Problemas

### Erro 404: Page Not Found
**Problema**: Rota não existe
**Solução**: Verificar se o servidor está rodando e as rotas foram registradas

### Erro 400: Token e subid são obrigatórios
**Problema**: Parâmetros faltando
**Solução**: Adicionar `token` e `subid` na URL

### Erro 404: Afiliado não encontrado
**Problema**: Username (subid) não existe no sistema
**Solução**: Verificar se o afiliado está cadastrado com o username correto

### Erro 500: Erro interno do servidor
**Problema**: Erro no banco de dados ou lógica
**Solução**: Verificar logs do servidor

---

## 💾 Estrutura no Banco de Dados

### Tabela: conversions
```sql
INSERT INTO conversions (
  user_id,
  house_id,
  type,
  amount,
  commission,
  customer_id,
  conversion_data
) VALUES (
  4,  -- ID do afiliado "eadavid"
  1,  -- ID da casa
  'deposit',
  '50.00',
  '150.00',
  '12345',
  '{"source": "postback_deposit", "ip": "1.2.3.4", "token": "test_token"}'
);
```

---

## 📈 Monitoramento

### Logs Automáticos
Todos os postbacks são registrados:
```
🔔 POSTBACK DEPOSIT: token=test_token, subid=eadavid, customer_id=12345, value=50.00
✅ Depósito registrado para eadavid - Valor: R$ 50 - Comissão: R$ 150
```

### Verificação de Status
- **Status 200**: Postback processado com sucesso
- **Status 400**: Parâmetros faltando ou inválidos
- **Status 404**: Afiliado não encontrado
- **Status 500**: Erro interno do servidor

---

## 🔧 Configuração Técnica

### No Servidor
As rotas são registradas automaticamente em `server/routes.ts`:
```javascript
app.get("/postback/click", async (req, res) => { ... });
app.get("/postback/register", async (req, res) => { ... });
app.get("/postback/deposit", async (req, res) => { ... });
app.get("/postback/revenue", async (req, res) => { ... });
```

### No Painel Admin
O gerador de postbacks usa:
```javascript
const url = `${baseUrl}/postback/${eventType}?token=${house.securityToken}&subid=${username}&customer_id=${customer_id}&value=${amount}`;
```

---

## ✅ Checklist de Implementação

Para cada casa de apostas:

- [ ] Token de segurança configurado
- [ ] URLs de postback geradas
- [ ] Teste de cada endpoint realizado
- [ ] Comissões calculadas corretamente
- [ ] Logs funcionando
- [ ] Casa de apostas configurada com URLs corretas

Este sistema simplificado garante compatibilidade máxima e facilita a integração com qualquer casa de apostas.