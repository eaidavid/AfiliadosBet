# PROMPT COMPLETO: CORREÇÃO NAVEGAÇÃO E ROTAS AFILIADOSBET

## 🎯 OBJETIVO PRINCIPAL
Corrigir completamente o sistema de navegação do AfiliadosBet, eliminando crashes, bugs de layout e problemas de responsividade no mobile/tablet.

## 🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. ROTAS QUEBRADAS - POSTBACKS E PAGAMENTOS
- ❌ Rotas de postbacks não existem ou estão mal configuradas
- ❌ Logs de postbacks com erro "orderSelectedFields" 
- ❌ Páginas de pagamentos crashando ou inexistentes
- ❌ Erro: "Cannot convert undefined or null to object" nas queries

### 2. DASHBOARD USUÁRIO BUGADO
- ❌ Layout com áreas quebradas e mal alinhadas
- ❌ Componentes sobrepostos ou mal posicionados
- ❌ Dados não carregando corretamente
- ❌ Interface inconsistente com o padrão premium

### 3. NAVEGAÇÃO MOBILE/TABLET PROBLEMÁTICA
- ❌ Menu inferior não responsivo adequadamente
- ❌ Difícil compreensão e uso em dispositivos móveis
- ❌ Falta de adaptação inteligente para diferentes telas
- ❌ Menu inferior deve ser REMOVIDO no painel web do usuário

## 📋 TAREFAS OBRIGATÓRIAS

### FASE 1: CORREÇÃO DE ROTAS E BACKEND
1. **Corrigir Rotas de Postbacks**
   - Criar/corrigir rota `/admin/postback` (gerador de postbacks)
   - Criar/corrigir rota `/admin/logs` (logs de postbacks)
   - Garantir que as páginas existam e funcionem

2. **Corrigir Rotas de Pagamentos**
   - Verificar rota `/admin/payments` (painel admin)
   - Verificar rota `/payments` ou `/user/payments` (painel usuário)
   - Corrigir queries que estão falhando

3. **Resolver Erro "orderSelectedFields"**
   - Identificar queries com problema
   - Corrigir conversões de undefined/null
   - Garantir inicialização correta dos dados

### FASE 2: CORREÇÃO LAYOUT USUÁRIO
1. **Dashboard do Usuário (/home)**
   - Corrigir áreas bugadas do layout
   - Alinhar componentes corretamente
   - Garantir carregamento de dados
   - Aplicar padrão visual premium

2. **Rotas Usuário Crashando**
   - Identificar rotas que estão falhando
   - Corrigir imports e dependências quebradas
   - Testar todas as páginas do usuário

### FASE 3: NAVEGAÇÃO RESPONSIVA PREMIUM
1. **Remover Menu Inferior - Painel Web Usuário**
   - Eliminar bottom navigation no desktop para usuários
   - Manter apenas no mobile/tablet
   - Implementar navegação desktop apropriada

2. **Menu Mobile/Tablet Ultra-Responsivo**
   - Breakpoints inteligentes (mobile: 0-767px, tablet: 768-1023px)
   - Design intuitivo e fácil compreensão
   - Animações suaves e profissionais
   - Ícones claros e textos legíveis
   - Funcionalidade para admin e usuário diferenciada

## 🎨 PADRÕES TÉCNICOS OBRIGATÓRIOS

### RESPONSIVIDADE
- **Mobile (0-767px)**: Menu inferior com 4-5 itens principais
- **Tablet (768-1023px)**: Menu inferior adaptado ou sidebar compacta
- **Desktop (1024px+)**: Sidebar premium (admin) / navegação top (usuário)

### DESIGN SYSTEM
- Glassmorphism e gradientes premium
- Animações 60fps com framer-motion
- Tema escuro com acentos emerald/blue
- Micro-interações profissionais
- Feedback visual imediato

### ARQUITETURA CÓDIGO
- TypeScript strict em todos os componentes
- Componentes reutilizáveis e documentados
- Eliminação total de duplicações
- Error boundaries para prevenção de crashes
- Loading states em todas as queries

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### 1. ESTRUTURA DE NAVEGAÇÃO
```
/components/navigation/
├── mobile-bottom-nav.tsx (ultra-responsivo)
├── premium-desktop-sidebar.tsx (admin)
├── user-desktop-nav.tsx (novo - usuário web)
└── smart-navigation-system.tsx (orquestrador)
```

### 2. BREAKPOINTS RESPONSIVOS
```css
/* Mobile First */
sm: 640px   /* Mobile grande */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop pequeno */
xl: 1280px  /* Desktop */
2xl: 1536px /* Desktop grande */
```

### 3. ROTAS CORRIGIDAS
```
Admin:
- /admin/postback (gerador)
- /admin/logs (logs postback)
- /admin/payments (pagamentos)

Usuário:
- /home (dashboard corrigido)
- /houses (casas de apostas)
- /payments (pagamentos usuário)
- /profile (perfil)
```

## ✅ CRITÉRIOS DE SUCESSO

### FUNCIONALIDADE
- [ ] Todas as rotas funcionando sem crashes
- [ ] Queries de banco sem erros
- [ ] Dashboard usuário com layout perfeito
- [ ] Navegação responsiva impecável

### EXPERIÊNCIA
- [ ] Menu mobile intuitivo e rápido
- [ ] Transições suaves em todos os dispositivos
- [ ] Feedback visual imediato
- [ ] Interface moderna e profissional

### TÉCNICO
- [ ] Zero duplicações de código
- [ ] Performance otimizada
- [ ] Código limpo e manutenível
- [ ] Error handling robusto

## 🚀 RESULTADO ESPERADO

Um sistema de navegação premium, totalmente responsivo e livre de bugs, com:
- Rotas de postbacks e pagamentos funcionando perfeitamente
- Dashboard usuário com layout impecável
- Navegação mobile/tablet ultra-responsiva e intuitiva
- Menu inferior removido do painel web do usuário
- Experiência visual moderna e profissional

**PRIORIDADE MÁXIMA**: Corrigir todos os crashes e bugs de layout antes de implementar melhorias visuais.