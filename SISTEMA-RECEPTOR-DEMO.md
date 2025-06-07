# ✅ SISTEMA REFORMULADO - RECEPTOR DE DADOS

## FUNCIONAMENTO CORRETO

O sistema foi **reformulado** para ser um **RECEPTOR** de dados das casas de apostas:

### ➡️ FLUXO CORRETO:
1. **Casas de Apostas** → ENVIAM dados → **Nosso Sistema**
2. **Nosso Sistema** → PROCESSA automaticamente → **Credita Afiliados**
3. **Afiliados** → VISUALIZAM comissões → **No Painel**

### 🎯 ENDPOINTS RECEPTORES ATIVOS:

#### 1. Teste de Conectividade
```bash
# Casa testa se nosso receptor está funcionando
curl -X GET "http://localhost:5000/api/v1/ping" \
  -H "X-API-Key: test_demo_123"
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "API is working",
  "house": {"id": 1, "name": "Casa de Teste"}
}
```

#### 2. Casa Envia Conversão de Depósito
```bash
# Casa notifica depósito de cliente
curl -X POST "http://localhost:5000/api/v1/conversions" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test_demo_123" \
  -d '{
    "event_type": "deposit",
    "customer_id": "cliente_123",
    "subid": "afiliado1",
    "amount": "250.00",
    "commission": "75.00"
  }'
```

#### 3. Casa Envia Novo Registro
```bash
# Casa notifica novo cliente registrado
curl -X POST "http://localhost:5000/api/v1/conversions" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test_demo_123" \
  -d '{
    "event_type": "registration", 
    "customer_id": "novo_cliente_456",
    "subid": "afiliado2"
  }'
```

### 📊 VERIFICAR ESTATÍSTICAS ATUALIZADAS:
```bash
# Ver dados processados em tempo real
curl -X GET "http://localhost:5000/api/v1/stats" \
  -H "X-API-Key: test_demo_123"
```

## DEMONSTRAÇÃO PRÁTICA

### Passo 1: Verificar Sistema Ativo
O sistema está rodando e pronto para receber dados das casas de apostas.

### Passo 2: Casas Configuram Webhooks
As casas de apostas configuram seus sistemas para enviar dados para nossos endpoints quando eventos ocorrem.

### Passo 3: Recebimento Automático
Nosso sistema recebe, valida e processa todos os dados automaticamente.

### Passo 4: Comissões Creditadas
Afiliados veem suas comissões atualizadas em tempo real no painel.

## VANTAGENS DO SISTEMA RECEPTOR

✅ **Automático** - Dados chegam instantaneamente
✅ **Confiável** - Sistema sempre disponível 24/7
✅ **Seguro** - API Keys únicas por casa
✅ **Escalável** - Suporta milhares de casas
✅ **Transparente** - Logs completos de tudo
✅ **Eficiente** - Processamento em tempo real

## CONFIGURAÇÃO PARA CASAS REAIS

### Para Integração Produção:
1. Casa obtém API Key única no painel admin
2. Casa configura webhook URL: `https://api.afiliadosbet.com/webhook/conversions`
3. Casa envia dados quando eventos ocorrem
4. Sistema processa automaticamente
5. Afiliados recebem comissões instantaneamente

### Tipos de Eventos Suportados:
- `click` - Clique em link de afiliado
- `registration` - Novo cliente se registrou  
- `deposit` - Cliente fez depósito
- `withdrawal` - Cliente fez saque
- `profit` - Cliente gerou lucro para casa

## DIFERENCIAL COMPETITIVO

Este sistema elimina a complexidade de integração bilateral. As casas simplesmente ENVIAM dados para nossos endpoints quando eventos acontecem, e todo o resto é processado automaticamente pelo nosso sistema.

**Resultado:** Integração mais rápida, dados mais confiáveis, comissões em tempo real.