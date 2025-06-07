# 🚀 GUIA COMPLETO DE TESTE - SISTEMA DE API

## **Como Testar o Sistema de Integração de Dados Externos**

### **PASSO 1: Acesse o Painel Admin**
1. Vá para: `http://localhost:5000/login`
2. Entre com as credenciais de admin:
   - **Email:** admin@afiliados.com
   - **Senha:** admin123

### **PASSO 2: Acesse o Gerenciamento de API**
1. No painel admin, clique em **"API Management"** no menu lateral
2. Ou vá diretamente para: `http://localhost:5000/admin/api-management`

### **PASSO 3: Crie uma API Key**
1. Clique em **"Nova API Key"**
2. Preencha:
   - **Nome:** "API Teste Casa X"
   - **Casa de Apostas:** Selecione uma casa existente
   - **Data de Expiração:** (opcional)
3. Clique em **"Criar API Key"**
4. **COPIE A CHAVE GERADA** - você precisará dela para os testes

### **PASSO 4: Teste com cURL (Terminal)**

#### **A) Teste de Autenticação**
```bash
curl -X GET "http://localhost:5000/api/v1/docs" \
  -H "X-API-Key: SUA_CHAVE_AQUI"
```

#### **B) Enviar uma Conversão de Depósito**
```bash
curl -X POST "http://localhost:5000/api/v1/conversions" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: SUA_CHAVE_AQUI" \
  -d '{
    "event_type": "deposit",
    "customer_id": "cliente_123",
    "subid": "nome_do_afiliado",
    "amount": "100.00",
    "commission": "30.00",
    "metadata": {
      "currency": "BRL",
      "payment_method": "pix"
    }
  }'
```

#### **C) Enviar um Registro**
```bash
curl -X POST "http://localhost:5000/api/v1/conversions" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: SUA_CHAVE_AQUI" \
  -d '{
    "event_type": "registration",
    "customer_id": "cliente_456",
    "subid": "nome_do_afiliado",
    "metadata": {
      "registration_date": "2024-01-15"
    }
  }'
```

#### **D) Listar Afiliados da Casa**
```bash
curl -X GET "http://localhost:5000/api/v1/affiliates?page=1&limit=10" \
  -H "X-API-Key: SUA_CHAVE_AQUI"
```

#### **E) Obter Estatísticas**
```bash
curl -X GET "http://localhost:5000/api/v1/stats" \
  -H "X-API-Key: SUA_CHAVE_AQUI"
```

### **PASSO 5: Monitorar os Resultados**

#### **No Painel Admin:**
1. Vá para a aba **"Logs de Requisições"**
2. Veja todas as chamadas da API em tempo real
3. Verifique status codes (200 = sucesso)

#### **Na Aba Estatísticas:**
1. Veja o número de requisições
2. Monitore a taxa de sucesso
3. Acompanhe o uso das API Keys

### **PASSO 6: Teste com Postman/Insomnia**

#### **Configuração:**
- **Base URL:** `http://localhost:5000/api/v1`
- **Header:** `X-API-Key: SUA_CHAVE_AQUI`
- **Content-Type:** `application/json`

#### **Endpoints para Testar:**
1. `GET /docs` - Documentação
2. `POST /conversions` - Enviar conversões
3. `GET /affiliates` - Listar afiliados
4. `GET /stats` - Estatísticas

### **PASSO 7: Teste de Erro (Opcional)**

#### **Teste sem API Key:**
```bash
curl -X GET "http://localhost:5000/api/v1/affiliates"
# Deve retornar erro 401
```

#### **Teste com API Key inválida:**
```bash
curl -X GET "http://localhost:5000/api/v1/affiliates" \
  -H "X-API-Key: chave_inexistente"
# Deve retornar erro 401
```

### **RESULTADOS ESPERADOS**

#### **✅ Teste Bem-Sucedido:**
- Status code 200 ou 201
- Dados JSON válidos na resposta
- Logs aparecem no painel admin
- Estatísticas são atualizadas

#### **❌ Problemas Comuns:**
- **401 Unauthorized:** API Key inválida ou ausente
- **404 Not Found:** Endpoint incorreto
- **400 Bad Request:** Dados malformados no JSON

### **EXEMPLO DE RESPOSTA SUCESSO**
```json
{
  "success": true,
  "message": "Conversion processed successfully",
  "data": {
    "conversion_id": 123,
    "commission_calculated": "30.00",
    "affiliate_credited": true
  }
}
```

### **PRÓXIMOS PASSOS**
1. **Configurar uma casa real** com seus próprios endpoints
2. **Implementar webhooks** para eventos automáticos
3. **Monitorar performance** através das estatísticas
4. **Escalar para produção** com mais casas de apostas

---

## **🔧 TROUBLESHOOTING**

### **Problema: API não responde**
- Verifique se o servidor está rodando na porta 5000
- Confirme se o banco de dados está conectado

### **Problema: Chave não funciona**
- Verifique se copiou a chave completa
- Confirme se a chave está ativa no painel

### **Problema: Dados não aparecem**
- Verifique se o `subid` corresponde ao username de um afiliado existente
- Confirme se a casa de apostas está ativa

---

**💡 DICA:** Use a aba "Documentação" no painel para ver exemplos atualizados de todas as chamadas da API!