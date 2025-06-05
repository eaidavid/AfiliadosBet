# Guia Completo de Postbacks - Plataforma de Afiliados

## 1. CONCEITOS BÁSICOS

### O que é um Postback?
Um postback é uma notificação HTTP enviada pela casa de apostas para nossa plataforma quando um evento importante acontece (registro, depósito, etc.). É como um "aviso" automático.

### Tipos de Comissão
- **CPA (Cost Per Acquisition)**: Valor fixo pago quando o lead faz REGISTRO + DEPÓSITO
- **RevShare (Revenue Share)**: Percentual sobre o PROFIT (lucro líquido) da casa

## 2. ESTRUTURA DOS POSTBACKS

### URL Base do Postback
```
https://seudominio.com/api/postback/{casa}/{evento}
```

### Parâmetros Obrigatórios
- `casa`: Identificador único da casa (ex: "brazino")
- `evento`: Tipo do evento (registration, deposit, profit)
- `subid`: Username do afiliado (parâmetro na query)
- `amount`: Valor em reais (para eventos monetários)

### Exemplo Completo
```
https://seudominio.com/api/postback/brazino/registration?subid=joao123&amount=0
https://seudominio.com/api/postback/brazino/deposit?subid=joao123&amount=100.00
https://seudominio.com/api/postback/brazino/profit?subid=joao123&amount=50.00
```

## 3. EVENTOS SUPORTADOS

### registration
- **Descrição**: Novo usuário se registra na casa
- **Parâmetros**: `subid` (obrigatório), `amount=0`
- **CPA**: Apenas registra, não paga ainda
- **RevShare**: Não gera comissão

### deposit
- **Descrição**: Usuário faz um depósito
- **Parâmetros**: `subid`, `amount` (valor do depósito)
- **CPA**: Paga comissão SE já existe registro prévio + valor >= depósito mínimo
- **RevShare**: Não gera comissão (só registra o evento)

### profit
- **Descrição**: Casa obteve lucro líquido do jogador
- **Parâmetros**: `subid`, `amount` (valor do lucro)
- **CPA**: Não gera comissão
- **RevShare**: Paga percentual sobre o valor do profit

## 4. LÓGICA DE COMISSÕES

### CPA (Cost Per Acquisition)
```
Condições para pagamento:
1. Deve existir um evento "registration" prévio para o mesmo subid
2. Evento atual deve ser "deposit" 
3. Valor do depósito >= depósito mínimo configurado na casa
4. Paga o valor fixo configurado (ex: R$ 150)
```

### RevShare (Revenue Share)
```
Condições para pagamento:
1. Evento deve ser "profit" (lucro líquido da casa)
2. Valor deve ser > 0
3. Paga percentual configurado sobre o valor (ex: 30% de R$ 100 = R$ 30)
```

## 5. CONFIGURAÇÃO DAS CASAS

### Campos Importantes
- **Nome**: Nome da casa (ex: "Brazino")
- **Identificador**: Slug único (ex: "brazino")
- **Tipo de Comissão**: "CPA" ou "RevShare"
- **Valor da Comissão**: Valor fixo (CPA) ou percentual (RevShare)
- **Depósito Mínimo**: Valor mínimo para CPA (ex: R$ 10)

### Exemplo CPA
```json
{
  "name": "Brazino",
  "identifier": "brazino",
  "commissionType": "CPA",
  "commissionValue": "150",
  "minDeposit": "10"
}
```

### Exemplo RevShare
```json
{
  "name": "Bet365",
  "identifier": "bet365",
  "commissionType": "RevShare",
  "commissionValue": "30",
  "minDeposit": "0"
}
```

## 6. FLUXO COMPLETO DE EXEMPLO

### Cenário CPA (Brazino - R$ 150 por conversão)

1. **Registro**:
   ```
   GET /api/postback/brazino/registration?subid=joao123&amount=0
   Resultado: Evento registrado, comissão = R$ 0 (aguardando depósito)
   ```

2. **Depósito**:
   ```
   GET /api/postback/brazino/deposit?subid=joao123&amount=25.00
   Verificação: Existe registro? SIM. Valor >= R$ 10? SIM.
   Resultado: Comissão paga = R$ 150
   ```

### Cenário RevShare (Bet365 - 30% sobre profit)

1. **Registro**:
   ```
   GET /api/postback/bet365/registration?subid=maria456&amount=0
   Resultado: Evento registrado, comissão = R$ 0
   ```

2. **Depósito**:
   ```
   GET /api/postback/bet365/deposit?subid=maria456&amount=100.00
   Resultado: Evento registrado, comissão = R$ 0 (RevShare não paga por depósito)
   ```

3. **Profit**:
   ```
   GET /api/postback/bet365/profit?subid=maria456&amount=80.00
   Resultado: Comissão paga = R$ 24 (30% de R$ 80)
   ```

## 7. MONITORAMENTO E LOGS

### Logs Automáticos
- Todos os postbacks são registrados na tabela `postback_logs`
- Status possíveis: SUCCESS, ERROR_HOUSE_NOT_FOUND, ERROR_AFFILIATE_NOT_FOUND
- Logs incluem IP, timestamp e dados completos

### Dados Registrados
- **Conversions**: Tabela principal com todos os eventos e comissões
- **Postback Logs**: Log detalhado de cada chamada recebida
- **Eventos**: Sistema legado (ainda mantido)
- **Comissões**: Sistema legado (ainda mantido)

## 8. TESTES E VALIDAÇÃO

### Como Testar
1. Cadastre uma casa de apostas no painel admin
2. Anote o identificador gerado
3. Faça chamadas HTTP para testar:

```bash
# Teste de registro
curl "https://seudominio.com/api/postback/brazino/registration?subid=teste123&amount=0"

# Teste de depósito
curl "https://seudominio.com/api/postback/brazino/deposit?subid=teste123&amount=50"

# Teste de profit (para RevShare)
curl "https://seudominio.com/api/postback/bet365/profit?subid=teste123&amount=100"
```

### Respostas Esperadas
```json
// Sucesso
{
  "status": "success",
  "message": "Postback processado com sucesso - Brazino",
  "event": "deposit",
  "commission": 150,
  "house": "Brazino",
  "logId": 123
}

// Erro - Casa não encontrada
{
  "error": "Casa de apostas não encontrada",
  "logId": 124
}
```

## 9. TROUBLESHOOTING

### Problemas Comuns

1. **"Casa não encontrada"**
   - Verifique se o identificador está correto
   - Confirme se a casa está ativa no painel

2. **"CPA não pago apesar de depósito"**
   - Verifique se existe registro prévio para o mesmo subid
   - Confirme se o valor do depósito >= depósito mínimo

3. **"RevShare não pago"**
   - Confirme se o evento é "profit" (não "deposit")
   - Verifique se o valor é > 0

### Verificações no Banco
```sql
-- Ver casas cadastradas
SELECT id, name, identifier, commission_type, commission_value FROM betting_houses;

-- Ver logs de postback
SELECT * FROM postback_logs ORDER BY created_at DESC LIMIT 10;

-- Ver conversões registradas
SELECT * FROM conversions ORDER BY converted_at DESC LIMIT 10;
```

## 10. BOAS PRÁTICAS

### Para Afiliados
- Use identificadores únicos e consistentes como subid
- Teste sempre com valores pequenos primeiro
- Monitore os relatórios regularmente

### Para Administradores
- Configure corretamente o tipo de comissão de cada casa
- Monitore logs de erro regularmente
- Mantenha backups dos dados de conversão

### Para Casas de Apostas
- Enviem postbacks em tempo real
- Incluam todos os parâmetros obrigatórios
- Usem HTTPS para segurança
- Implementem retry em caso de falha temporária

---

**IMPORTANTE**: Este sistema está configurado para dados reais. Não use dados fictícios ou de teste em produção. Todos os valores de comissão serão calculados e pagos conforme configurado.