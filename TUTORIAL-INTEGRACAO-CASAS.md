# 🎯 Tutorial Completo: Integração de Casas de Apostas com AfiliadosBet

## Visão Geral do Sistema

O **AfiliadosBet** é um sistema **RECEPTOR** de dados. Isso significa que as casas de apostas **ENVIAM** dados para nossos endpoints quando eventos acontecem em suas plataformas.

### Fluxo de Dados:
```
Casa de Apostas → ENVIA dados → AfiliadosBet → PROCESSA → Credita Afiliados
```

## 📋 Pré-requisitos para Integração

### 1. Obter API Key
- Acesse o painel administrativo do AfiliadosBet
- Vá em "Configurações" → "API Keys"
- Gere uma API Key única para sua casa
- Anote a API Key (exemplo: `casa_bet365_abc123`)

### 2. Configurar Endpoints de Destino
```
Base URL: https://api.afiliadosbet.com
Endpoints Principais:
- POST /api/v1/conversions (receber conversões)
- GET /api/v1/ping (testar conectividade)
- GET /api/v1/stats (verificar estatísticas)
```

## 🔧 Implementação Técnica

### Autenticação
Todas as requisições devem incluir o header:
```http
X-API-Key: sua_api_key_aqui
Content-Type: application/json
```

### 1. Teste de Conectividade

**Endpoint:** `GET /api/v1/ping`

```bash
curl -X GET "https://api.afiliadosbet.com/api/v1/ping" \
  -H "X-API-Key: sua_api_key"
```

**Resposta Esperada:**
```json
{
  "success": true,
  "message": "API is working",
  "timestamp": "2025-06-07T20:48:28.810Z",
  "house": {
    "id": 1,
    "name": "Sua Casa de Apostas"
  }
}
```

### 2. Envio de Conversões

**Endpoint:** `POST /api/v1/conversions`

#### Tipos de Eventos Suportados:

##### A) Clique em Link de Afiliado
```bash
curl -X POST "https://api.afiliadosbet.com/api/v1/conversions" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua_api_key" \
  -d '{
    "event_type": "click",
    "customer_id": "visitante_12345",
    "subid": "username_do_afiliado"
  }'
```

##### B) Registro de Novo Cliente
```bash
curl -X POST "https://api.afiliadosbet.com/api/v1/conversions" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua_api_key" \
  -d '{
    "event_type": "registration",
    "customer_id": "cliente_novo_789",
    "subid": "username_do_afiliado"
  }'
```

##### C) Depósito de Cliente
```bash
curl -X POST "https://api.afiliadosbet.com/api/v1/conversions" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua_api_key" \
  -d '{
    "event_type": "deposit",
    "customer_id": "cliente_456",
    "subid": "username_do_afiliado",
    "amount": "500.00",
    "commission": "150.00"
  }'
```

##### D) Saque de Cliente
```bash
curl -X POST "https://api.afiliadosbet.com/api/v1/conversions" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua_api_key" \
  -d '{
    "event_type": "withdrawal",
    "customer_id": "cliente_789",
    "subid": "username_do_afiliado",
    "amount": "200.00"
  }'
```

##### E) Lucro Gerado
```bash
curl -X POST "https://api.afiliadosbet.com/api/v1/conversions" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua_api_key" \
  -d '{
    "event_type": "profit",
    "customer_id": "cliente_123",
    "subid": "username_do_afiliado",
    "amount": "1000.00",
    "commission": "300.00"
  }'
```

### Resposta de Sucesso:
```json
{
  "success": true,
  "message": "Conversion processed successfully",
  "data": {
    "conversion_id": 1749329308810,
    "event_type": "deposit",
    "affiliate": {
      "id": 4,
      "username": "eadavid",
      "email": "euleralves113@gmail.com"
    },
    "house": {
      "id": 1,
      "name": "Sua Casa"
    },
    "amount": "500.00",
    "commission": "150.00",
    "processed_at": "2025-06-07T20:48:28.810Z"
  }
}
```

## 🏗️ Implementação no Sistema da Casa

### Exemplo em PHP:

```php
<?php
class AfiliadosBetIntegration {
    private $apiKey;
    private $baseUrl;
    
    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
        $this->baseUrl = 'https://api.afiliadosbet.com';
    }
    
    public function sendConversion($eventType, $customerId, $subid, $amount = null, $commission = null) {
        $data = [
            'event_type' => $eventType,
            'customer_id' => $customerId,
            'subid' => $subid
        ];
        
        if ($amount) $data['amount'] = $amount;
        if ($commission) $data['commission'] = $commission;
        
        $headers = [
            'Content-Type: application/json',
            'X-API-Key: ' . $this->apiKey
        ];
        
        $ch = curl_init($this->baseUrl . '/api/v1/conversions');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }
}

// Exemplo de uso:
$afiliados = new AfiliadosBetIntegration('sua_api_key');

// Quando cliente faz depósito:
$afiliados->sendConversion('deposit', 'cliente_123', 'afiliado_user', '500.00', '150.00');

// Quando cliente se registra:
$afiliados->sendConversion('registration', 'novo_cliente_456', 'afiliado_user');
?>
```

### Exemplo em Node.js:

```javascript
const axios = require('axios');

class AfiliadosBetIntegration {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.afiliadosbet.com';
    }
    
    async sendConversion(eventType, customerId, subid, amount = null, commission = null) {
        const data = {
            event_type: eventType,
            customer_id: customerId,
            subid: subid
        };
        
        if (amount) data.amount = amount;
        if (commission) data.commission = commission;
        
        try {
            const response = await axios.post(`${this.baseUrl}/api/v1/conversions`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey
                }
            });
            
            return response.data;
        } catch (error) {
            console.error('Erro ao enviar conversão:', error.response?.data);
            throw error;
        }
    }
}

// Exemplo de uso:
const afiliados = new AfiliadosBetIntegration('sua_api_key');

// Quando cliente faz depósito:
afiliados.sendConversion('deposit', 'cliente_123', 'afiliado_user', '500.00', '150.00');
```

### Exemplo em Python:

```python
import requests
import json

class AfiliadosBetIntegration:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = 'https://api.afiliadosbet.com'
    
    def send_conversion(self, event_type, customer_id, subid, amount=None, commission=None):
        data = {
            'event_type': event_type,
            'customer_id': customer_id,
            'subid': subid
        }
        
        if amount:
            data['amount'] = amount
        if commission:
            data['commission'] = commission
        
        headers = {
            'Content-Type': 'application/json',
            'X-API-Key': self.api_key
        }
        
        response = requests.post(
            f'{self.base_url}/api/v1/conversions',
            json=data,
            headers=headers
        )
        
        return response.json()

# Exemplo de uso:
afiliados = AfiliadosBetIntegration('sua_api_key')

# Quando cliente faz depósito:
afiliados.send_conversion('deposit', 'cliente_123', 'afiliado_user', '500.00', '150.00')
```

## 🔄 Momentos para Enviar Dados

### 1. **Clique em Link** (Opcional)
- Quando usuário clica em link de afiliado
- Útil para tracking de funil

### 2. **Registro** (Obrigatório)
- Assim que cliente completa cadastro
- Identificar através do parâmetro `subid` no link

### 3. **Primeiro Depósito** (Obrigatório)
- Quando cliente faz primeiro depósito
- Incluir valor e comissão calculada

### 4. **Depósitos Subsequentes** (Opcional)
- Depósitos adicionais do mesmo cliente
- Dependendo do modelo de comissão

### 5. **Lucros/GGR** (Mensal)
- Enviar dados de lucro líquido mensalmente
- Para modelos de revenue share

## 📊 Monitoramento e Verificação

### Verificar Estatísticas:
```bash
curl -X GET "https://api.afiliadosbet.com/api/v1/stats" \
  -H "X-API-Key: sua_api_key"
```

### Resposta:
```json
{
  "success": true,
  "data": {
    "house": {"id": 1, "name": "Sua Casa"},
    "conversions": {
      "total": 156,
      "by_type": {
        "clicks": 1250,
        "registrations": 89,
        "deposits": 45,
        "profits": 22
      }
    },
    "financial": {
      "total_volume": "15,670.00",
      "total_commission": "4,701.00"
    }
  }
}
```

## 🚨 Tratamento de Erros

### Códigos de Resposta:

- **200 OK**: Sucesso
- **400 Bad Request**: Dados inválidos
- **401 Unauthorized**: API Key inválida
- **404 Not Found**: Afiliado não encontrado
- **500 Internal Error**: Erro interno

### Exemplo de Erro:
```json
{
  "error": "Affiliate not found",
  "message": "No affiliate found with username: afiliado_inexistente"
}
```

## 🔐 Segurança

### Validações Implementadas:
- ✅ API Key obrigatória
- ✅ Validação de formato de dados
- ✅ Rate limiting
- ✅ Logs de segurança
- ✅ Verificação de origem

### Recomendações:
- Mantenha API Key segura
- Use HTTPS sempre
- Implemente retry logic
- Log todas as tentativas
- Monitor respostas de erro

## 🎯 Conclusão

Com esta integração, sua casa de apostas enviará dados automaticamente para o AfiliadosBet sempre que eventos relevantes ocorrerem. O sistema processará tudo automaticamente e creditará as comissões dos afiliados em tempo real.

### Benefícios:
- ✅ **Automático**: Sem intervenção manual
- ✅ **Tempo Real**: Dados processados instantaneamente
- ✅ **Confiável**: Sistema disponível 24/7
- ✅ **Transparente**: Logs completos de tudo
- ✅ **Escalável**: Suporta alto volume

### Próximos Passos:
1. Obter API Key no painel admin
2. Implementar código de integração
3. Testar com dados reais
4. Monitorar estatísticas
5. Configurar alertas se necessário

**Suporte:** Entre em contato conosco para qualquer dúvida durante a implementação.