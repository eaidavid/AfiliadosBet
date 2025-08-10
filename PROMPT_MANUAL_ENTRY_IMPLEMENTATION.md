# 🚀 PROMPT PARA IMPLEMENTAÇÃO DO SISTEMA DE INSERÇÃO MANUAL

## 📝 CONTEXTO DO SISTEMA

Você está trabalhando no AfiliadosBet, uma plataforma de marketing de afiliados para casas de apostas. O sistema possui integrações automáticas via API e postbacks, mas precisamos de um sistema manual robusto para quando essas integrações falharem.

## 🎯 OBJETIVO PRINCIPAL

Implementar um sistema completo de inserção manual de dados que permita aos administradores:
- Inserir conversões manualmente quando postbacks falharem
- Ajustar comissões para casos especiais
- Registrar pagamentos externos
- Manter auditoria completa de todas as ações

## 📋 ESPECIFICAÇÕES TÉCNICAS

### **STACK TECNOLÓGICO**
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript + Drizzle ORM
- **Database**: PostgreSQL
- **Arquitetura**: Fullstack integrado com padrões existentes

### **LOCALIZAÇÃO DOS ARQUIVOS**
- Schema: `shared/schema.ts`
- Routes: `server/routes.ts` 
- Storage: `server/storage.ts`
- Frontend: `client/src/pages/`
- Components: `client/src/components/`

## 🏗️ ESTRUTURA DE IMPLEMENTAÇÃO

### **1. BACKEND - EXTENSÕES DO SCHEMA**

Adicione ao `shared/schema.ts`:

```typescript
// Tabela para auditoria de ações manuais
export const manualEntries = pgTable("manual_entries", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => users.id).notNull(),
  affiliateId: integer("affiliate_id").references(() => users.id),
  entryType: varchar("entry_type", { length: 50 }).notNull(), // 'conversion', 'commission', 'payment'
  actionType: varchar("action_type", { length: 50 }).notNull(), // 'insert', 'update', 'adjustment'
  amount: decimal("amount", { precision: 10, scale: 2 }),
  referenceId: integer("reference_id"), // ID da tabela relacionada
  metadata: jsonb("metadata"), // Dados específicos da ação
  reason: text("reason"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Adicionar campos às tabelas existentes
// conversions: adicionar is_manual BOOLEAN, manual_entry_id INTEGER
// payments: adicionar is_manual BOOLEAN, manual_entry_id INTEGER, proof_file TEXT
```

### **2. BACKEND - NOVAS ROTAS API**

Adicione ao `server/routes.ts`:

```typescript
// Rotas para inserção manual
app.post('/api/admin/manual/conversion', requireAdmin, async (req, res) => {
  // Validar dados
  // Calcular comissão automaticamente
  // Inserir conversão com flag manual
  // Registrar na auditoria
  // Retornar resultado
});

app.post('/api/admin/manual/commission-adjustment', requireAdmin, async (req, res) => {
  // Validar ajuste
  // Aplicar alteração
  // Registrar na auditoria
});

app.post('/api/admin/manual/payment', requireAdmin, async (req, res) => {
  // Registrar pagamento
  // Upload de comprovante (opcional)
  // Atualizar saldo do afiliado
  // Auditoria
});

app.get('/api/admin/manual/audit-log', requireAdmin, async (req, res) => {
  // Buscar histórico com filtros
  // Paginação
  // Exportar dados se solicitado
});
```

### **3. FRONTEND - NOVA PÁGINA ADMINISTRATIVA**

Criar em `client/src/pages/admin/ManualEntry.tsx`:

```typescript
export default function ManualEntry() {
  return (
    <div className="space-y-8">
      {/* Header com título e breadcrumb */}
      <ManualEntryHeader />
      
      {/* Tabs para diferentes tipos de inserção */}
      <Tabs defaultValue="conversions">
        <TabsList>
          <TabsTrigger value="conversions">Conversões</TabsTrigger>
          <TabsTrigger value="commissions">Comissões</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
        </TabsList>
        
        <TabsContent value="conversions">
          <ManualConversionForm />
        </TabsContent>
        
        <TabsContent value="commissions">
          <CommissionAdjustmentForm />
        </TabsContent>
        
        <TabsContent value="payments">
          <ManualPaymentForm />
        </TabsContent>
        
        <TabsContent value="audit">
          <AuditLogViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### **4. COMPONENTES ESPECIALIZADOS**

#### **Formulário de Conversão Manual**
```typescript
function ManualConversionForm() {
  // Form com react-hook-form + zod
  // Seletor de casa de apostas
  // Busca de afiliado com autocomplete
  // Calculadora automática de comissão
  // Validações em tempo real
  // Submit com confirmação
}
```

#### **Busca de Afiliados**
```typescript
function AffiliateSearch({ onSelect }: { onSelect: (affiliate: User) => void }) {
  // Input com busca em tempo real
  // Dropdown com resultados
  // Exibir info básica do afiliado
  // Debounce para performance
}
```

#### **Calculadora de Comissão**
```typescript
function CommissionCalculator({ house, amount, type }) {
  // Calcular comissão baseada nas regras da casa
  // Exibir breakdown detalhado
  // Permitir override manual se necessário
  // Validar limites mínimos/máximos
}
```

## 🎨 DIRETRIZES DE DESIGN

### **Visual e UX**
- Seguir padrão visual existente (dark theme premium)
- Cards com glassmorphism para cada formulário
- Feedback visual imediato (loading, success, error)
- Confirmações para ações críticas
- Breadcrumbs para navegação

### **Validações**
- Formulários com validação em tempo real
- Prevenção de duplicatas
- Limites de valores por tipo de operação
- Verificação de permissões antes de exibir

### **Responsividade**
- Layout adaptativo para mobile/tablet
- Forms que funcionam bem em telas pequenas
- Tabelas responsivas com scroll horizontal

## 🔒 SEGURANÇA E AUDITORIA

### **Controles Obrigatórios**
```typescript
// Middleware de permissão
const requireManualEntryPermission = (req, res, next) => {
  if (!req.user?.role === 'admin' || !req.user?.permissions?.manual_entry) {
    return res.status(403).json({ error: 'Permissão negada' });
  }
  next();
};

// Log de auditoria automático
const logManualAction = async (adminId, action, data) => {
  await db.insert(manualEntries).values({
    adminId,
    entryType: action.type,
    actionType: action.action,
    amount: data.amount,
    referenceId: data.referenceId,
    metadata: data,
    reason: data.reason,
    ipAddress: req.ip,
  });
};
```

### **Validações de Negócio**
- Não permitir conversões futuras além de 24h
- Limitar valores máximos por tipo de ação
- Verificar se afiliado está ativo
- Validar se casa de apostas está configurada

## 📊 DASHBOARD DE AUDITORIA

### **Métricas Principais**
- Total de ações manuais no período
- Valor total processado manualmente
- Distribuição por tipo de ação
- Top administradores por atividade

### **Filtros Avançados**
- Período (date range picker)
- Tipo de ação (conversões, comissões, pagamentos)
- Administrador responsável
- Afiliado específico
- Range de valores

### **Exportação**
- CSV para análise externa
- PDF para relatórios
- Excel para dashboards

## 🚀 PLANO DE IMPLEMENTAÇÃO

### **Fase 1: Core Functionality** (Prioridade Alta)
1. ✅ Estender schema do banco de dados
2. ✅ Implementar rotas básicas de inserção manual
3. ✅ Criar página de inserção de conversões
4. ✅ Sistema básico de auditoria

### **Fase 2: Advanced Features** (Prioridade Média)
1. ✅ Ajustes de comissão
2. ✅ Registro de pagamentos manuais
3. ✅ Dashboard completo de auditoria
4. ✅ Exportação de relatórios

### **Fase 3: Polish & Intelligence** (Prioridade Baixa)
1. ✅ Detecção de anomalias
2. ✅ Sugestões inteligentes
3. ✅ Notificações automáticas
4. ✅ Integrações com compliance

## 🎯 CRITÉRIOS DE SUCESSO

### **Funcionalidades Essenciais**
- ✅ Admin consegue inserir conversões manualmente
- ✅ Comissões são calculadas automaticamente
- ✅ Todas as ações ficam registradas na auditoria
- ✅ Interface intuitiva e responsiva
- ✅ Validações impedem erros graves

### **Performance**
- ✅ Formulários respondem em < 500ms
- ✅ Busca de afiliados em < 300ms
- ✅ Auditoria carrega em < 1s
- ✅ Não impacta performance geral do sistema

### **Segurança**
- ✅ Apenas admins autorizados podem usar
- ✅ Todas as ações são auditadas
- ✅ Validações impedem dados inválidos
- ✅ Logs incluem IP e timestamp

## 📝 EXEMPLO DE USO

### **Cenário: Postback da Bet365 falhou**
1. Admin recebe reclamação de afiliado sobre conversão não contabilizada
2. Acessa `/admin/manual-entry`
3. Seleciona aba "Conversões"
4. Preenche formulário:
   - Casa: Bet365
   - Afiliado: João Silva
   - Tipo: Depósito
   - Valor: R$ 1.000,00
   - Customer ID: 12345
   - Observação: "Postback falhou - confirmado via suporte Bet365"
5. Sistema calcula comissão automaticamente (R$ 300,00)
6. Admin confirma e salva
7. Conversão é registrada e comissão creditada
8. Ação fica registrada na auditoria

## 🔧 COMANDOS DE IMPLEMENTAÇÃO

```bash
# 1. Atualizar schema do banco
npm run db:push

# 2. Testar rotas da API
curl -X POST http://localhost:5000/api/admin/manual/conversion \
  -H "Content-Type: application/json" \
  -d '{"affiliateId": 1, "houseId": 1, "type": "deposit", "amount": 1000}'

# 3. Verificar logs de auditoria
curl http://localhost:5000/api/admin/manual/audit-log

# 4. Testar interface
# Navegar para /admin/manual-entry
```

---

**PROMPT READY FOR IMPLEMENTATION** 🚀

Use este prompt como guia completo para implementar o sistema de inserção manual. Ele está estruturado para garantir que nenhum detalhe importante seja esquecido e que o resultado final seja profissional e robusto.