# Sistema de Cálculo de Comissões - IMPLEMENTADO ✅

## Funcionalidades Implementadas

### 1. Calculadora de Comissões Automática
- **Arquivo**: `server/services/commissionCalculator.ts`
- **Classe**: `CommissionCalculator`
- **Funcionalidades**:
  - Cálculo automático RevShare e CPA
  - Divisão matemática entre afiliado e master admin
  - Validação de configurações
  - Fallback para configurações incompletas

### 2. Fórmulas Matemáticas Implementadas

#### RevShare:
```
comissao_afiliado = valor_postback × (percentual_afiliado / percentual_total)
comissao_master = valor_postback - comissao_afiliado
```

#### CPA:
```
comissao_afiliado = valor_cpa × (percentual_afiliado / 100)
comissao_master = valor_cpa - comissao_afiliado
```

### 3. Sistema de Postback Integrado
- **Arquivo**: `server/postback-simple.ts`
- **Funcionalidades**:
  - Processamento automático de postbacks
  - Aplicação das fórmulas de comissão
  - Armazenamento detalhado dos cálculos
  - Logs completos de auditoria

### 4. Interface Administrativa
- **Arquivo**: `client/src/pages/admin-houses.tsx`
- **Campos adicionados**:
  - `revshareAffiliatePercent`: Percentual para afiliados em RevShare
  - `cpaAffiliatePercent`: Percentual para afiliados em CPA
  - Seção "Divisão de Comissões - Afiliado vs Master"

### 5. Banco de Dados Atualizado
- **Tabela**: `betting_houses`
  - `revshare_affiliate_percent`: DECIMAL(5,2)
  - `cpa_affiliate_percent`: DECIMAL(5,2)
- **Tabela**: `conversions`
  - `master_commission`: DECIMAL(10,2)
  - `conversion_data`: JSONB (detalhes do cálculo)

## Exemplos Práticos

### Exemplo 1: RevShare (Brazino - 35% | Afiliado 20%)
```
Casa configurada:
- Tipo: RevShare
- Percentual total: 35%
- Percentual afiliado: 20%

Postback recebido: R$ 350 (35% de R$ 1000 apostado)

Cálculo:
- Comissão afiliado: R$ 350 × (20/35) = R$ 200,00
- Comissão master: R$ 350 - R$ 200 = R$ 150,00
```

### Exemplo 2: CPA (Blaze - R$ 500 | Afiliado 70%)
```
Casa configurada:
- Tipo: CPA
- Valor CPA: R$ 500
- Percentual afiliado: 70%

Postback recebido: R$ 500

Cálculo:
- Comissão afiliado: R$ 500 × 70% = R$ 350,00
- Comissão master: R$ 500 - R$ 350 = R$ 150,00
```

## Validações Implementadas

1. **Percentual do afiliado** não pode ser maior que percentual total (RevShare)
2. **Valores positivos** obrigatórios para todos os cálculos
3. **Configurações obrigatórias** para cada tipo de comissão
4. **Fallback gracioso** se configuração estiver incompleta
5. **Auditoria completa** de todos os cálculos

## Como Testar o Sistema

### 1. Configurar Casa no Admin
```
Acessar: /admin/houses
- Editar casa existente
- Definir tipo de comissão (RevShare/CPA)
- Configurar percentuais na seção "Divisão de Comissões"
- Salvar
```

### 2. Enviar Postback de Teste
```bash
# RevShare Test
curl "http://localhost:5000/postback/brazino/deposit?subid=teste123&amount=350"

# CPA Test  
curl "http://localhost:5000/postback/brazino/deposit?subid=teste456&amount=500"
```

### 3. Verificar Resultados
```sql
SELECT 
  subid, amount, commission, master_commission,
  (commission + COALESCE(master_commission, 0)) as total_check,
  conversion_data
FROM conversions 
WHERE subid LIKE 'teste%'
ORDER BY created_at DESC;
```

## Logs do Sistema

O sistema gera logs detalhados para auditoria:

```
💰 Calculando comissão: Casa Brazino (RevShare), Evento: deposit, Valor: R$ 350
💰 RevShare calculado: Afiliado R$ 200.00, Master R$ 150.00
💰 Comissão final - Afiliado: R$ 200.00, Master: R$ 150.00
✅ Conversão registrada com sucesso para Brazino - evento: deposit
```

## Status da Implementação

- ✅ Backend: CommissionCalculator implementado
- ✅ Banco de dados: Campos de percentual adicionados  
- ✅ Postback: Integração com calculadora
- ✅ Admin: Interface para configuração
- ✅ Validações: Regras de negócio implementadas
- ✅ Auditoria: Logs completos de cálculos
- ✅ Fallback: Compatibilidade com sistema anterior

## Próximos Passos Sugeridos

1. **Dashboard de Comissões**: Visão consolidada para master admin
2. **Relatórios Detalhados**: Análise de divisão de comissões por período
3. **Notificações**: Alertas para pagamentos pendentes
4. **Aprovação**: Sistema de validação de comissões antes do pagamento
5. **API de Consulta**: Endpoints para terceiros consultarem comissões