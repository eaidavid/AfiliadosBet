# 🚀 PROMPT ÉPICO: Página de Gerenciamento de Pagamentos Admin

## 🎯 OBJETIVO PRINCIPAL
Criar uma página administrativa completa para gerenciamento de pagamentos de todos os afiliados da plataforma AfiliadosBet, com interface moderna, funcionalidades avançadas e integração total com o sistema existente.

## 📊 ESTRUTURA DE DADOS EXISTENTE
**ATENÇÃO:** Use EXATAMENTE estes campos da tabela `payments` no schema:

```typescript
// Tabela payments (shared/schema.ts - linhas 134-144)
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(), // 'pix', 'bank_transfer'
  pixKey: text("pix_key"),
  status: text("status").default("pending"), // 'pending', 'completed', 'failed'
  transactionId: text("transaction_id"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela users relacionada (campos necessários):
- id, username, email, fullName, pixKeyType, pixKeyValue
```

## 🎨 ESPECIFICAÇÕES VISUAIS

### Layout Principal
- **Rota:** `/admin/payments`
- **Design:** Dark theme consistente com o sistema existente
- **Responsividade:** Mobile-first com breakpoints otimizados
- **Sidebar:** Integração completa com SidebarLayout existente

### Paleta de Cores (seguir padrão existente)
```css
- Background: slate-900/50, slate-800
- Cards: slate-900/50 border-slate-700
- Text Primary: white, slate-100
- Text Secondary: slate-300, slate-400
- Success: emerald-400, green-500
- Warning: yellow-400, amber-500
- Error: red-400, red-500
- Info: blue-400, cyan-500
```

## 🛠️ FUNCIONALIDADES OBRIGATÓRIAS

### 1. Dashboard de Estatísticas
```typescript
interface PaymentStats {
  totalPendingAmount: string;
  totalCompletedAmount: string;
  totalFailedAmount: string;
  pendingCount: number;
  completedCount: number;
  failedCount: number;
  monthlyVolume: string;
  averagePayment: string;
}
```

**Cards de KPIs:**
- Total Pendente (com ícone Clock - cor amber)
- Total Pago (com ícone CheckCircle - cor emerald)
- Total Falhado (com ícone XCircle - cor red)
- Volume Mensal (com ícone TrendingUp - cor blue)

### 2. Filtros Avançados
**Filtros obrigatórios:**
- Status: pending, completed, failed
- Método: pix, bank_transfer
- Período: hoje, 7 dias, 30 dias, custom range
- Usuário: busca por nome/email/username
- Valor: range mínimo/máximo

### 3. Tabela de Pagamentos
**Colunas obrigatórias:**
- ID do Pagamento
- Afiliado (nome + email)
- Valor (formatado R$)
- Método de Pagamento (com ícones)
- Status (com badges coloridos)
- Chave PIX (se método = pix)
- Data de Criação
- Data de Pagamento
- Ações (Ver, Aprovar, Rejeitar, Editar)

### 4. Modais de Ação
**Modal de Visualização:**
- Todos os dados do pagamento
- Histórico de status
- Dados do afiliado
- Botões de ação

**Modal de Aprovação:**
- Confirmação de pagamento
- Campo para Transaction ID
- Data de pagamento automática

**Modal de Edição:**
- Alterar status
- Alterar método
- Alterar chave PIX
- Observações

## 📱 LAYOUT RESPONSIVO

### Desktop (lg+)
- Grid de 4 colunas para KPIs
- Tabela completa com todas as colunas
- Filtros laterais expansíveis

### Tablet (md)
- Grid de 2 colunas para KPIs
- Tabela responsiva com scroll horizontal
- Filtros em dropdown

### Mobile (sm)
- KPIs em coluna única
- Cards em vez de tabela
- Filtros em modal

## 🎪 COMPONENTES ESPECIAIS

### 1. Status Badge
```typescript
const STATUS_CONFIG = {
  pending: {
    label: 'Pendente',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock
  },
  completed: {
    label: 'Pago',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle
  },
  failed: {
    label: 'Falhado',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle
  }
};
```

### 2. Payment Method Display
```typescript
const PAYMENT_METHODS = {
  pix: {
    label: 'PIX',
    icon: '◉',
    color: 'text-emerald-400 bg-emerald-900/30 border-emerald-500/30'
  },
  bank_transfer: {
    label: 'TED',
    icon: '🏦',
    color: 'text-blue-400 bg-blue-900/30 border-blue-500/30'
  }
};
```

### 3. Bulk Actions
- Seleção múltipla de pagamentos
- Ações em lote: aprovar, rejeitar, exportar
- Confirmação com contadores

## ⚡ FUNCIONALIDADES AVANÇADAS

### 1. Exportação de Relatórios
- CSV com todos os dados
- Filtros aplicados mantidos
- Nome do arquivo com timestamp

### 2. Notificações em Tempo Real
- Toast para ações concluídas
- Confirmações de operações perigosas
- Feedback visual imediato

### 3. Paginação Inteligente
- 10, 25, 50, 100 items por página
- Navegação rápida
- Contador total de registros

### 4. Busca Instantânea
- Debounce de 300ms
- Busca por nome, email, ID
- Highlight nos resultados

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### Backend Requirements
```typescript
// Rotas necessárias (server/routes.ts)
GET  /api/admin/payments/stats     // Estatísticas gerais
GET  /api/admin/payments           // Lista paginada com filtros
GET  /api/admin/payments/:id       // Detalhes de um pagamento
PUT  /api/admin/payments/:id       // Atualizar pagamento
POST /api/admin/payments/bulk      // Ações em lote
```

### Query Parameters
```typescript
interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: 'pending' | 'completed' | 'failed';
  method?: 'pix' | 'bank_transfer';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
}
```

### React Query Keys
```typescript
const QUERY_KEYS = {
  paymentStats: ['/api/admin/payments/stats'],
  payments: (filters: PaymentFilters) => ['/api/admin/payments', filters],
  paymentDetail: (id: number) => ['/api/admin/payments', id],
};
```

## 🎯 CRITÉRIOS DE SUCESSO

### Performance
- ✅ Carregamento inicial < 2s
- ✅ Filtros respondem em < 500ms
- ✅ Paginação suave
- ✅ Lazy loading para grandes datasets

### UX/UI
- ✅ Interface intuitiva e consistente
- ✅ Feedback visual para todas as ações
- ✅ Acessibilidade (keyboard navigation)
- ✅ Estados de loading e erro

### Funcionalidade
- ✅ Todos os filtros funcionando
- ✅ CRUD completo de pagamentos
- ✅ Ações em lote operacionais
- ✅ Exportação sem erros

## 🚨 PONTOS CRÍTICOS

### Validações Obrigatórias
- ⚠️ Status transitions válidos (pending → completed/failed)
- ⚠️ Valores monetários sempre formatados
- ⚠️ PIX key obrigatória quando method = 'pix'
- ⚠️ Transaction ID obrigatório para status 'completed'

### Segurança
- 🔒 Verificação de role admin
- 🔒 Validação de IDs existentes
- 🔒 Sanitização de inputs
- 🔒 Logs de auditoria para ações sensíveis

### Performance
- ⚡ Paginação no backend
- ⚡ Índices otimizados para filtros
- ⚡ Cache de estatísticas
- ⚡ Debounce em buscas

## 🎨 ELEMENTOS VISUAIS ESPECÍFICOS

### Header da Página
```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-4xl font-bold text-emerald-400 flex items-center gap-3">
      <CreditCard className="h-10 w-10" />
      Gerenciamento de Pagamentos
    </h1>
    <p className="text-slate-300 text-lg mt-2">
      Controle total sobre pagamentos de afiliados
    </p>
  </div>
  <Button className="bg-emerald-600 hover:bg-emerald-700">
    <Download className="h-4 w-4 mr-2" />
    Exportar Relatório
  </Button>
</div>
```

### Cards de Estatísticas
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Card com animação de hover e gradiente sutil */}
  <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:scale-105 transition-all">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">Total Pendente</p>
          <p className="text-2xl font-bold text-amber-400">R$ {stats.totalPending}</p>
        </div>
        <Clock className="h-8 w-8 text-amber-400" />
      </div>
    </CardContent>
  </Card>
</div>
```

## 🎪 ANIMAÇÕES E TRANSIÇÕES

### Micro-interações
- Hover effects em cards e botões
- Loading spinners personalizados
- Transições suaves entre estados
- Highlight em linhas da tabela

### Estados de Loading
```tsx
// Skeleton para tabela
<div className="space-y-4">
  {Array.from({ length: 10 }).map((_, i) => (
    <div key={i} className="h-16 bg-slate-800 rounded animate-pulse" />
  ))}
</div>
```

## 🎊 RESULTADO FINAL ESPERADO

Uma página administrativa moderna, profissional e altamente funcional que permite:

1. **Visão executiva** com KPIs em tempo real
2. **Controle granular** sobre todos os pagamentos
3. **Workflow eficiente** para aprovações
4. **Interface responsiva** para uso em qualquer dispositivo
5. **Performance otimizada** para grandes volumes de dados
6. **UX excepcional** com feedback visual rico

A página deve se integrar perfeitamente ao design system existente, mantendo consistência visual e padrões de interação já estabelecidos na plataforma AfiliadosBet.

---

**💡 DICA FINAL:** Foque na experiência do administrador que precisa processar dezenas de pagamentos por dia. Cada clique economizado, cada informação bem posicionada e cada feedback visual adequado fará diferença na produtividade diária.