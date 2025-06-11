# PROMPT RÁPIDO: Correção Imediata JSX + Funcionalidade Pagamentos

## PROBLEMA CRÍTICO
❌ Erro JSX impedindo aplicação de rodar: "Adjacent JSX elements must be wrapped in an enclosing tag"
❌ Menu lateral ausente na página de pagamentos  
❌ Botões aprovação/rejeição não funcionam

## SOLUÇÃO IMEDIATA

### 1. CORRIGIR ESTRUTURA JSX (admin-payments.tsx)
**Problema:** Divs desbalanceadas na estrutura principal

**Estrutura correta necessária:**
```tsx
return (
  <div className="flex min-h-screen bg-slate-950">               // DIV 1
    <AdminSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
    <div className="flex-1 lg:ml-72">                            // DIV 2  
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> // DIV 3
        {/* Todo o conteúdo aqui */}
        <Dialog>
          <DialogContent>
            {/* Conteúdo do dialog */}
          </DialogContent>
        </Dialog>
      </div>  // FECHA DIV 3
    </div>    // FECHA DIV 2
  </div>      // FECHA DIV 1
);
```

### 2. SCHEMA ATUALIZADO
✅ Campos adicionados ao payments:
- processedAt: timestamp("processed_at")
- notes: text("notes")  
- status: 'pending', 'approved', 'rejected', 'processing'

### 3. BACKEND FUNCIONANDO
✅ Routes corrigidas:
- PATCH /api/admin/payments/:id
- cleanUpdateData filtrando undefined values

## ARQUIVOS PRINCIPAIS
- client/src/pages/admin-payments.tsx (ERRO JSX)
- shared/schema.ts (ATUALIZADO)
- server/routes.ts (FUNCIONANDO)

## RESULTADO ESPERADO
✅ Aplicação roda sem erros JSX
✅ Menu lateral visível
✅ Botões aprovação/rejeição operacionais