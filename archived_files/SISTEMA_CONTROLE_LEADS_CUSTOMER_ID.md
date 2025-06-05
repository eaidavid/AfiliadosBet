# Sistema de Controle de Leads por Customer_ID - AfiliadosBet

## Visão Geral

O sistema implementa controle completo de leads baseado no campo `customer_id`, permitindo rastreamento detalhado de cada cliente através de toda sua jornada nas casas de apostas, desde o primeiro clique até conversões completas.

## Funcionalidades Implementadas

### 1. Armazenamento Correto do Customer_ID
- ✅ Campo `customer_id` na tabela `conversions`
- ✅ Índices otimizados para consultas por customer_id
- ✅ Índice composto para evitar duplicações: `(customer_id, house_id, type)`

### 2. Prevenção de Duplicações
- ✅ Verificação automática antes de registrar eventos críticos
- ✅ Eventos controlados: `registration`, `first_deposit`, `deposit`
- ✅ Resposta HTTP 409 para duplicações detectadas
- ✅ Log detalhado de tentativas de duplicação

### 3. Consultas e Relatórios por Customer_ID

#### Endpoints Criados:

**GET /api/admin/leads**
- Lista todos os customer_ids únicos
- Agrupa conversões por cliente
- Paginação integrada
- Filtros por data e afiliado

**GET /api/admin/leads/:customerId**
- Detalhes completos de um lead específico
- Timeline de eventos
- Totais de comissão e valor
- Informações do afiliado responsável

**GET /api/admin/leads/:customerId/validate/:houseId/:type**
- Valida se um evento já existe para o customer_id
- Previne duplicações antes do registro
- Retorna status da validação

**GET /api/admin/leads/report/by-affiliate**
- Relatório detalhado por afiliado
- Filtros por período
- Totais agregados

### 4. Interface de Gerenciamento

#### Página Admin: `/admin/leads`
- ✅ Tabela completa de leads
- ✅ Busca por customer_id, afiliado ou casa
- ✅ Ordenação por diferentes critérios
- ✅ Modal de detalhes com timeline
- ✅ Estatísticas em tempo real
- ✅ Design responsivo e moderno

## Estrutura do Banco de Dados

### Tabela Conversions (Otimizada)
```sql
CREATE TABLE conversions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  house_id INTEGER NOT NULL REFERENCES betting_houses(id),
  affiliate_link_id INTEGER REFERENCES affiliate_links(id),
  type TEXT NOT NULL,
  amount DECIMAL(10,2) DEFAULT 0,
  commission DECIMAL(10,2) DEFAULT 0,
  customer_id TEXT, -- ID único do cliente na casa de apostas
  conversion_data JSONB,
  converted_at TIMESTAMP DEFAULT NOW()
);

-- Índices otimizados
CREATE INDEX idx_customer_house_type ON conversions(customer_id, house_id, type);
CREATE INDEX idx_customer_id ON conversions(customer_id);
CREATE INDEX idx_user_conversions ON conversions(user_id, converted_at);
```

## Fluxo de Funcionamento

### 1. Recebimento de Postback
```
1. Postback chega: /postback/casa/evento/token?subid=afiliado&customer_id=12345&amount=100
2. Sistema valida casa e token
3. Busca afiliado pelo subid
4. VERIFICA DUPLICAÇÃO por customer_id + house_id + tipo
5. Se não for duplicado, registra conversão
6. Calcula comissão baseada no tipo da casa
7. Cria pagamento pendente se aplicável
```

### 2. Prevenção de Duplicações
```javascript
// Exemplo de verificação
const isDuplicate = await checkDuplicateConversion(
  customer_id, // "12345"
  house_id,    // 1
  event_type   // "registration"
);

if (isDuplicate) {
  return HTTP 409 - "Evento já registrado para este customer_id"
}
```

### 3. Consulta de Lead Completo
```javascript
// GET /api/admin/leads/12345
{
  "customerId": "12345",
  "totalConversions": 4,
  "totalCommission": 150.00,
  "totalAmount": 500.00,
  "events": [
    {
      "type": "click",
      "amount": 0,
      "commission": 0,
      "convertedAt": "2024-01-01T10:00:00Z",
      "house": { "name": "Bet365" },
      "affiliate": { "username": "davidalves" }
    },
    {
      "type": "registration", 
      "amount": 0,
      "commission": 0,
      "convertedAt": "2024-01-01T10:30:00Z"
    },
    {
      "type": "deposit",
      "amount": 100,
      "commission": 50,
      "convertedAt": "2024-01-01T11:00:00Z"
    },
    {
      "type": "profit",
      "amount": 400,
      "commission": 100,
      "convertedAt": "2024-01-02T15:00:00Z"
    }
  ],
  "eventsSummary": {
    "click": 1,
    "registration": 1, 
    "deposit": 1,
    "profit": 1
  }
}
```

## Consultas SQL Principais

### 1. Buscar Todas as Conversões de um Cliente
```sql
SELECT 
  c.*,
  u.username,
  u.full_name,
  b.name as house_name
FROM conversions c
JOIN users u ON c.user_id = u.id  
JOIN betting_houses b ON c.house_id = b.id
WHERE c.customer_id = '12345'
ORDER BY c.converted_at ASC;
```

### 2. Relatório por Afiliado com Totais
```sql
SELECT 
  c.customer_id,
  u.username as affiliate,
  b.name as house,
  array_agg(c.type ORDER BY c.converted_at) as events,
  count(*) as total_events,
  sum(c.commission) as total_commission,
  sum(c.amount) as total_amount
FROM conversions c
JOIN users u ON c.user_id = u.id
JOIN betting_houses b ON c.house_id = b.id  
WHERE c.customer_id IS NOT NULL
GROUP BY c.customer_id, u.username, b.name
ORDER BY total_commission DESC;
```

### 3. Verificar Duplicação
```sql
SELECT id FROM conversions 
WHERE customer_id = '12345' 
  AND house_id = 1 
  AND type = 'registration'
LIMIT 1;
```

### 4. Top Leads por Comissão
```sql
SELECT 
  customer_id,
  count(*) as total_conversions,
  sum(commission) as total_commission,
  max(converted_at) as last_activity
FROM conversions 
WHERE customer_id IS NOT NULL
GROUP BY customer_id
ORDER BY total_commission DESC
LIMIT 10;
```

## Validações e Regras de Negócio

### Eventos Únicos por Cliente
- ✅ **Registration**: Máximo 1 por customer_id por casa
- ✅ **First_deposit**: Máximo 1 por customer_id por casa  
- ✅ **Deposit**: Controlado conforme regra de negócio
- ⚠️ **Click**: Permitido múltiplos (tracking de retorno)
- ⚠️ **Profit**: Permitido múltiplos (eventos recorrentes)

### Tipos de Comissão Suportados

#### CPA (Cost Per Acquisition)
- Paga apenas após **registro + depósito mínimo**
- Valor fixo por conversão completa
- Não duplica para mesmo customer_id

#### RevShare (Revenue Share)  
- Paga sobre **profit/lucro** do cliente
- Percentual do valor apostado/perdido
- Permite múltiplos eventos profit

#### Hybrid (CPA + RevShare)
- **CPA**: Pago no primeiro depósito válido
- **RevShare**: Pago em todos os profits subsequentes
- Combina ambos os modelos

## Logs e Auditoria

### Log de Duplicações Detectadas
```
🚫 DUPLICAÇÃO DETECTADA: customer_id=12345, house=Bet365, evento=registration
```

### Log de Conversão Registrada
```
✅ Conversão registrada: customer_id=12345, evento=deposit, comissão=R$50
```

### Log de Validação
```
📩 Postback recebido: casa=bet365, evento=deposit, customer_id=12345
💰 Calculando comissão: Casa Bet365 (CPA), Evento: deposit, Valor: R$100
✅ Postback processado com sucesso
```

## Interface de Usuário

### Dashboard Principal (`/admin`)
- Estatísticas gerais do sistema
- Gráficos de conversões por tipo
- Top 5 afiliados
- Postbacks recentes

### Gerenciamento de Leads (`/admin/leads`)
- Lista paginada de todos os customer_ids
- Busca e filtros avançados
- Modal de detalhes com timeline completa
- Estatísticas por lead

### Funcionalidades da Interface
- ✅ Busca por customer_id, afiliado ou casa
- ✅ Ordenação por comissão, eventos, data
- ✅ Paginação automática
- ✅ Modal de detalhes expandido
- ✅ Timeline visual de eventos
- ✅ Badges coloridos por tipo de evento
- ✅ Totais e estatísticas em tempo real

## Próximos Passos

### Melhorias Sugeridas
1. **Alertas de Fraude**: Notificar tentativas de duplicação suspeitas
2. **Relatórios Avançados**: Export para Excel/PDF
3. **Dashboard de Cliente**: Visão do customer_id para suporte
4. **API de Validação Externa**: Webhook para casas consultarem duplicações
5. **Métricas de Performance**: Tempo de conversão, LTV por cliente

### Integrações Futuras
1. **CRM Integration**: Sincronizar dados de clientes
2. **Analytics Avançado**: Google Analytics, Facebook Pixel
3. **Automação de Marketing**: Segmentação por comportamento
4. **Compliance**: Logs para auditoria regulatória

## Comandos de Teste

### Testar Duplicação
```bash
# Primeiro postback - deve funcionar
curl "http://localhost:5000/postback/bet365/registration/token123?subid=davidalves&customer_id=TEST123"

# Segundo postback igual - deve retornar 409
curl "http://localhost:5000/postback/bet365/registration/token123?subid=davidalves&customer_id=TEST123"
```

### Consultar Lead
```bash
curl "http://localhost:5000/api/admin/leads/TEST123"
```

### Validar Evento
```bash
curl "http://localhost:5000/api/admin/leads/TEST123/validate/1/registration"
```

---

**Status**: ✅ Sistema implementado e funcional
**Versão**: 1.0
**Data**: 04/06/2025