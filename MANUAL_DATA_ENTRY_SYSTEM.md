# 🛠️ Sistema de Inserção Manual de Dados - AfiliadosBet

## 📋 Visão Geral

Este sistema permite que administradores insiram dados manualmente quando as integrações automáticas (API/Postback) falharem, garantindo continuidade operacional e flexibilidade total.

## 🎯 Funcionalidades do Sistema Manual

### 1. **Inserção Manual de Conversões**
- Registrar conversões de afiliados quando postbacks falharem
- Suporte a todos os tipos: registro, depósito, saque, chargeback
- Cálculo automático de comissões baseado nas regras da casa
- Validação de dados e prevenção de duplicatas

### 2. **Ajuste Manual de Comissões**
- Modificar valores de comissão para casos especiais
- Adicionar bônus ou penalidades pontuais
- Correção de valores incorretos de integrações
- Histórico completo de alterações

### 3. **Gestão Manual de Pagamentos**
- Registrar pagamentos externos ao sistema
- Marcar pagamentos como processados manualmente
- Adicionar comprovantes e observações
- Conciliação bancária manual

### 4. **Correção de Dados**
- Editar conversões existentes
- Corrigir informações de afiliados
- Ajustar datas e valores retroativamente
- Auditoria completa de alterações

## 🏗️ Estrutura de Implementação

### **Página: Admin Manual Entry** (`/admin/manual-entry`)

#### **Seção 1: Inserção de Conversões**
```
┌─────────────────────────────────────────┐
│ 🎯 Nova Conversão Manual                │
├─────────────────────────────────────────┤
│ Casa de Apostas: [Dropdown]             │
│ Afiliado: [Busca com autocomplete]      │
│ Tipo: [registro|depósito|saque|etc]     │
│ Valor: R$ [Input numérico]              │
│ Data/Hora: [DateTime picker]            │
│ Customer ID: [Input texto]              │
│ Observações: [Textarea]                 │
│                                         │
│ [Calcular Comissão] [Salvar Conversão]  │
└─────────────────────────────────────────┘
```

#### **Seção 2: Ajuste de Comissões**
```
┌─────────────────────────────────────────┐
│ 💰 Ajuste Manual de Comissão            │
├─────────────────────────────────────────┤
│ Buscar Afiliado: [Input com busca]      │
│ Tipo de Ajuste:                         │
│ ○ Bônus pontual                         │
│ ○ Correção de valor                     │
│ ○ Penalidade                            │
│ ○ Comissão especial                     │
│                                         │
│ Valor: R$ [Input]                       │
│ Justificativa: [Textarea obrigatório]   │
│                                         │
│ [Aplicar Ajuste]                        │
└─────────────────────────────────────────┘
```

#### **Seção 3: Registro de Pagamentos**
```
┌─────────────────────────────────────────┐
│ 💳 Pagamento Manual                     │
├─────────────────────────────────────────┤
│ Afiliado: [Busca]                       │
│ Valor Pago: R$ [Input]                  │
│ Método: [PIX|Transferência|Outro]       │
│ Data do Pagamento: [Date picker]        │
│ Comprovante: [Upload arquivo]           │
│ Observações: [Textarea]                 │
│                                         │
│ [Registrar Pagamento]                   │
└─────────────────────────────────────────┘
```

### **Página: Histórico e Auditoria** (`/admin/manual-history`)

#### **Dashboard de Ações Manuais**
```
┌─────────────────────────────────────────┐
│ 📊 Resumo de Ações Manuais (30 dias)    │
├─────────────────────────────────────────┤
│ Conversões inseridas: 45                │
│ Comissões ajustadas: 12                 │
│ Pagamentos registrados: 23              │
│ Valor total processado: R$ 125.450,00   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🔍 Filtros de Auditoria                 │
├─────────────────────────────────────────┤
│ Período: [Date range]                   │
│ Tipo de Ação: [All|Conversão|Comissão]  │
│ Admin: [Dropdown]                       │
│ Afiliado: [Busca]                       │
│                                         │
│ [Aplicar Filtros] [Exportar CSV]        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📋 Log de Ações                         │
├─────────────────────────────────────────┤
│ Data/Hora | Admin | Ação | Detalhes     │
│ ────────────────────────────────────    │
│ 10/08 15:30 | João | Conversão Manual   │
│   → Afiliado: Maria Silva               │
│   → Casa: Bet365 | Valor: R$ 500,00     │
│   → Comissão: R$ 150,00                 │
│                                         │
│ 10/08 14:45 | João | Ajuste Comissão    │
│   → Afiliado: Pedro Santos              │
│   → Valor: +R$ 50,00 | Motivo: Bônus    │
└─────────────────────────────────────────┘
```

## 🔧 Especificações Técnicas

### **Backend - Novas Rotas API**

#### **1. Conversões Manuais**
```typescript
// POST /api/admin/manual/conversion
interface ManualConversionRequest {
  affiliateId: number;
  houseId: number;
  type: 'register' | 'deposit' | 'withdrawal' | 'chargeback';
  amount: number;
  customerId?: string;
  timestamp: string;
  notes?: string;
}

// GET /api/admin/manual/conversions
// Lista conversões inseridas manualmente
```

#### **2. Ajustes de Comissão**
```typescript
// POST /api/admin/manual/commission-adjustment
interface CommissionAdjustmentRequest {
  affiliateId: number;
  type: 'bonus' | 'correction' | 'penalty' | 'special';
  amount: number;
  reason: string;
  referenceId?: number; // ID da conversão relacionada
}

// GET /api/admin/manual/commission-adjustments
// Lista ajustes aplicados
```

#### **3. Pagamentos Manuais**
```typescript
// POST /api/admin/manual/payment
interface ManualPaymentRequest {
  affiliateId: number;
  amount: number;
  method: 'pix' | 'transfer' | 'other';
  paymentDate: string;
  proof?: string; // Base64 do comprovante
  notes?: string;
}

// GET /api/admin/manual/payments
// Lista pagamentos registrados
```

#### **4. Auditoria**
```typescript
// GET /api/admin/manual/audit-log
interface AuditLogParams {
  startDate?: string;
  endDate?: string;
  actionType?: string;
  adminId?: number;
  affiliateId?: number;
}
```

### **Database Schema Extensions**

#### **Tabela: manual_entries**
```sql
CREATE TABLE manual_entries (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES users(id),
  affiliate_id INTEGER REFERENCES users(id),
  entry_type VARCHAR(50) NOT NULL, -- 'conversion', 'commission', 'payment'
  action_type VARCHAR(50) NOT NULL, -- 'insert', 'update', 'adjustment'
  amount DECIMAL(10,2),
  reference_id INTEGER, -- ID da tabela relacionada
  metadata JSONB, -- Dados específicos da ação
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  ip_address INET
);
```

#### **Campos adicionais em tabelas existentes**
```sql
-- Conversions table
ALTER TABLE conversions ADD COLUMN is_manual BOOLEAN DEFAULT FALSE;
ALTER TABLE conversions ADD COLUMN manual_entry_id INTEGER REFERENCES manual_entries(id);

-- Payments table  
ALTER TABLE payments ADD COLUMN is_manual BOOLEAN DEFAULT FALSE;
ALTER TABLE payments ADD COLUMN manual_entry_id INTEGER REFERENCES manual_entries(id);
ALTER TABLE payments ADD COLUMN proof_file TEXT; -- Path do comprovante
```

## 🎨 Interface de Usuario

### **Design Pattern**
- Formulários em cards com validação em tempo real
- Feedback visual imediato para ações
- Confirmação para operações críticas
- Loading states durante processamento
- Toast notifications para feedback

### **Componentes Reutilizáveis**
```typescript
// Busca de afiliados com autocomplete
<AffiliateSearch 
  onSelect={(affiliate) => setSelectedAffiliate(affiliate)}
  placeholder="Buscar afiliado por nome ou email"
/>

// Seletor de casa de apostas
<HouseSelector 
  value={selectedHouse}
  onChange={setSelectedHouse}
  showCommissionInfo={true}
/>

// Upload de comprovantes
<ProofUploader 
  onUpload={(file) => setProofFile(file)}
  accept="image/*,.pdf"
  maxSize="5MB"
/>

// Calculadora de comissão
<CommissionCalculator 
  house={selectedHouse}
  amount={amount}
  type={conversionType}
  onCalculated={(commission) => setCalculatedCommission(commission)}
/>
```

## 🔒 Controles de Segurança

### **Permissões**
- Apenas admins com permissão especial podem fazer inserções manuais
- Log completo de todas as ações com IP e timestamp
- Aprovação dupla para valores acima de limite configurável
- Bloqueio automático após muitas ações em pouco tempo

### **Validações**
- Verificação de duplicatas antes de inserir
- Limites máximos por tipo de operação
- Validação de datas (não futurismo excessivo)
- Verificação de integridade de dados

### **Auditoria**
- Registro de TODAS as ações manuais
- Exportação de relatórios para compliance
- Alertas automáticos para ações suspeitas
- Backup automático antes de operações críticas

## 🚀 Implementação Sugerida

### **Fase 1: Core Manual Entry** (Prioridade Alta)
1. Página de inserção manual de conversões
2. Sistema básico de auditoria
3. Validações essenciais de segurança

### **Fase 2: Advanced Features** (Prioridade Média)
1. Ajustes de comissão
2. Registro de pagamentos manuais
3. Dashboard de auditoria avançado

### **Fase 3: Automation & Intelligence** (Prioridade Baixa)
1. Detecção automática de discrepâncias
2. Sugestões inteligentes baseadas em histórico
3. Integração com sistemas de compliance

## 📈 Benefícios Esperados

### **Operacionais**
- ✅ Zero downtime por falhas de integração
- ✅ Flexibilidade total para casos especiais
- ✅ Correção rápida de problemas
- ✅ Compliance e auditoria completa

### **Financeiros**
- ✅ Redução de perdas por falhas técnicas
- ✅ Pagamentos pontuais mesmo com problemas
- ✅ Satisfação de afiliados mantida
- ✅ Crescimento sustentável da plataforma

## 🎯 Próximos Passos

1. **Aprovação do escopo**: Revisar e ajustar funcionalidades
2. **Priorização**: Definir ordem de implementação
3. **Design detalhado**: Criar mockups das interfaces
4. **Desenvolvimento**: Implementar em fases
5. **Testes**: Validar com cenários reais
6. **Treinamento**: Capacitar equipe administrativa

---

**Este sistema garante que o AfiliadosBet continue operando mesmo quando as integrações automáticas falharem, mantendo a confiança dos afiliados e a continuidade dos negócios.**