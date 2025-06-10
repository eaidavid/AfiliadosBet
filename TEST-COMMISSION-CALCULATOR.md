# Teste do Sistema de Cálculo de Comissões - AfiliadosBet

## Status da Implementação ✅ COMPLETO

### Funcionalidades Implementadas:

1. **Backend - Calculadora de Comissões** ✅
   - Classe `CommissionCalculator` para cálculos automáticos
   - Suporte para RevShare e CPA
   - Divisão entre afiliado e master admin
   - Validação de configurações

2. **Banco de Dados** ✅
   - Campo `masterCommission` adicionado à tabela `conversions`
   - Campos `revshareAffiliatePercent` e `cpaAffiliatePercent` na tabela `betting_houses`
   - Schema atualizado e migrado

3. **Sistema de Postback** ✅
   - Integração com calculadora de comissões
   - Armazenamento detalhado dos cálculos em `conversionData`
   - Fallback para lógica anterior se configuração incompleta

4. **Interface Administrativa** ✅
   - Campos para configurar percentuais de afiliados
   - Seção dedicada "Divisão de Comissões - Afiliado vs Master"
   - Validação e descrições explicativas

## Exemplos de Uso:

### Exemplo 1 - RevShare (Bet365)
```
Casa: Bet365
- Tipo: RevShare
- Percentual total da casa: 35%
- Percentual repassado ao afiliado: 20%

Postback recebido: R$ 350 (35% de R$ 1000 de receita)

Cálculo automático:
- Comissão do afiliado: R$ 350 × (20/35) = R$ 200
- Comissão do master: R$ 350 - R$ 200 = R$ 150
```

### Exemplo 2 - CPA (Blaze)
```
Casa: Blaze
- Tipo: CPA
- Valor CPA: R$ 500
- Percentual repassado ao afiliado: 70%

Postback recebido: R$ 500

Cálculo automático:
- Comissão do afiliado: R$ 500 × 70% = R$ 350
- Comissão do master: R$ 500 - R$ 350 = R$ 150
```

## Como Testar:

### 1. Configurar Casa de Apostas
No painel admin em `/admin/houses`:
- Adicionar/editar uma casa
- Definir tipo de comissão (RevShare ou CPA)
- Configurar percentuais na seção "Divisão de Comissões"
- Salvar configurações

### 2. Enviar Postback de Teste
```bash
# Teste RevShare
curl "http://localhost:5000/api/postback/testehouse/deposit?subid=teste123&amount=350"

# Teste CPA
curl "http://localhost:5000/api/postback/testehouse/deposit?subid=teste123&amount=500"
```

### 3. Verificar Resultados
- Consultar tabela `conversions` no banco
- Verificar campos `commission` (afiliado) e `master_commission` (master)
- Analisar `conversion_data` para detalhes do cálculo

## Logs Esperados:
```
💰 Calculando comissão: Casa TestHouse (RevShare), Evento: deposit, Valor: R$ 350
💰 RevShare calculado: Afiliado R$ 200.00, Master R$ 150.00
💰 Comissão final - Afiliado: R$ 200.00, Master: R$ 150.00
✅ Conversão registrada com sucesso para TestHouse - evento: deposit
```

## Validações Implementadas:
- Percentual do afiliado não pode ser maior que percentual total
- Valores devem ser positivos
- Configurações obrigatórias para cada tipo de comissão
- Fallback gracioso se configuração estiver incompleta

## Próximos Passos Sugeridos:
1. Criar dashboard de comissões para o master admin
2. Implementar relatórios de divisão de comissões
3. Adicionar notificações de pagamento para afiliados
4. Criar sistema de aprovação de comissões