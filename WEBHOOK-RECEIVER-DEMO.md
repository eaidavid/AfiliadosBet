# AfiliadosBet - Sistema Receptor de Dados

## IMPORTANTE: REFORMULAÇÃO COMPLETA

O sistema foi **reformulado** para funcionar como **RECEPTOR** de dados das casas de apostas, não como enviador.

## Como Funciona

### Fluxo de Dados:
1. **Casas de Apostas** enviam dados PARA nosso sistema
2. **Nosso Sistema** recebe e processa os dados automaticamente
3. **Afiliados** visualizam comissões calculadas automaticamente

### Endpoints de Recebimento:

#### 🔥 WEBHOOK PRINCIPAL - Receber Conversões
```
POST /webhook/conversions
Headers: X-API-Key: [chave_da_casa]
```

**Exemplo de dados que a casa envia:**
```json
{
  "event_type": "deposit",
  "customer_id": "cliente_123",
  "subid": "afiliado1",
  "amount": "150.00", 
  "commission": "45.00",
  "metadata": {
    "currency": "BRL",
    "payment_method": "pix"
  }
}
```

#### 📊 WEBHOOK - Receber Cliques
```
POST /webhook/clicks
Headers: X-API-Key: [chave_da_casa]
```

**Exemplo:**
```json
{
  "subid": "afiliado1",
  "customer_id": "visitor_456",
  "ip_address": "192.168.1.100",
  "landing_page": "/promocao"
}
```

#### 🏓 TESTE DE CONECTIVIDADE
```
GET /webhook/ping
Headers: X-API-Key: [chave_da_casa]
```

## Demonstração Prática

### Como Casas de Apostas Enviam Dados:

```bash
# Registrar um depósito
curl -X POST "http://localhost:5000/webhook/conversions" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: casa_demo_123" \
  -d '{
    "event_type": "deposit",
    "customer_id": "cliente_789",
    "subid": "afiliado1", 
    "amount": "200.00",
    "commission": "60.00"
  }'

# Registrar um novo cliente
curl -X POST "http://localhost:5000/webhook/conversions" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: casa_demo_123" \
  -d '{
    "event_type": "registration",
    "customer_id": "novo_cliente_456",
    "subid": "afiliado2"
  }'

# Rastrear clique
curl -X POST "http://localhost:5000/webhook/clicks" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: casa_demo_123" \
  -d '{
    "subid": "afiliado1",
    "ip_address": "192.168.1.100"
  }'
```

## Vantagens do Sistema Receptor

✅ **Automático** - Dados chegam em tempo real
✅ **Seguro** - API Keys únicas por casa
✅ **Rastreável** - Logs de todas as requisições
✅ **Escalável** - Suporta múltiplas casas simultaneamente
✅ **Confiável** - Validação e processamento robusto

## Configuração para Casas Reais

### 1. Criar API Key no Admin:
- Acesse: `/admin/api-management`
- Crie uma nova API Key para a casa
- Forneça a chave para a casa de apostas

### 2. Casa Configura Webhooks:
- URL: `https://seudominio.com/webhook/conversions`
- Método: POST
- Header: `X-API-Key: [chave_fornecida]`

### 3. Tipos de Eventos Suportados:
- `click` - Clique em link de afiliado
- `registration` - Novo cliente registrado  
- `deposit` - Depósito realizado
- `profit` - Lucro gerado pelo cliente

## Monitoramento

- **Logs em Tempo Real**: `/admin/postback-logs`
- **Estatísticas**: Painel do afiliado atualizado automaticamente
- **Alertas**: Sistema detecta problemas automaticamente

## Diferencial Competitivo

Este sistema permite que as casas de apostas integrem facilmente através de webhooks simples, eliminando a complexidade de APIs bidirecionais e garantindo recebimento instantâneo de dados de conversão.