# 🎨 Premium Design System - AfiliadosBet

Sistema completo de componentes premium com glassmorphism moderno, micro-animações e responsividade total.

## 📋 Componentes Disponíveis

### 🏗️ Layout Components

#### PremiumLayout
Container principal com backgrounds premium e padding responsivos.
```tsx
<PremiumLayout background="gradient" padding="lg">
  <YourContent />
</PremiumLayout>
```

#### PremiumContainer
Container centralizado com tamanhos responsivos.
```tsx
<PremiumContainer size="lg">
  <YourContent />
</PremiumContainer>
```

#### PremiumGrid
Grid responsivo com gaps otimizados.
```tsx
<PremiumGrid cols={3} gap="md">
  <YourItems />
</PremiumGrid>
```

### 🎛️ Form Components

#### PremiumInput
Input premium com variantes glassmorphism.
```tsx
<PremiumInput
  variant="glass"
  label="Email"
  placeholder="Digite seu email"
  icon={<Mail />}
/>
```

#### PremiumButton
Botões premium com animações suaves.
```tsx
<PremiumButton variant="primary" size="lg" loading={isLoading}>
  Enviar
</PremiumButton>
```

#### PremiumSelect
Select avançado com busca e múltipla seleção.
```tsx
<PremiumSelect
  options={options}
  searchable
  multiple
  onChange={handleChange}
/>
```

#### PremiumForm
Formulário completo com validação automática.
```tsx
<PremiumForm
  fields={formFields}
  onSubmit={handleSubmit}
  loading={isSubmitting}
/>
```

### 📊 Display Components

#### PremiumCard
Cards premium com glassmorphism e animações.
```tsx
<PremiumCard variant="glass" animated interactive>
  <PremiumCardHeader gradient>
    <h3>Título</h3>
  </PremiumCardHeader>
  <PremiumCardContent>
    Conteúdo
  </PremiumCardContent>
</PremiumCard>
```

#### PremiumStatsCard
Card especializado para estatísticas.
```tsx
<PremiumStatsCard
  title="Receita Total"
  value="R$ 50.000"
  change="+15%"
  changeType="positive"
  icon={<DollarSign />}
/>
```

#### PremiumBadge
Badges premium com status e animações.
```tsx
<PremiumBadge variant="success" animated>
  Ativo
</PremiumBadge>
```

#### PremiumTable
Tabela premium com ordenação e paginação.
```tsx
<PremiumTable
  columns={columns}
  data={data}
  sortable
  pagination={paginationConfig}
/>
```

### 🔔 Feedback Components

#### PremiumToast
Sistema de notificações premium.
```tsx
const toast = usePremiumToast();

toast.success("Operação realizada com sucesso!");
toast.error("Erro ao processar solicitação");
```

#### PremiumModal
Modais premium com glassmorphism.
```tsx
<PremiumModal
  open={isOpen}
  onClose={handleClose}
  title="Confirmar Ação"
  size="md"
>
  <ModalContent />
</PremiumModal>
```

#### PremiumLoading
Estados de loading premium.
```tsx
<PremiumLoading variant="pulse" size="lg" text="Carregando..." />
<PremiumPageLoading title="Preparando dados..." />
```

### ✨ Animation Components

#### PremiumAnimatedContainer
Container com animações premium.
```tsx
<PremiumAnimatedContainer animation="fadeIn" delay={0.2}>
  <YourContent />
</PremiumAnimatedContainer>
```

#### PremiumHoverCard
Cards com animações de hover suaves.
```tsx
<PremiumHoverCard intensity="medium">
  <YourCard />
</PremiumHoverCard>
```

## 🎨 Design Tokens

### Cores Premium
- **Primary**: Emerald (verde) - `#10B981`
- **Accent**: Blue (azul) - `#3B82F6`
- **Secondary**: Violet (roxo) - `#8B5CF6`
- **Background**: Slate escuro - `#0F172A`
- **Surface**: Slate médio - `#1E293B`

### Glassmorphism Classes
- `.glass` - Glassmorphism básico
- `.glass-premium` - Glassmorphism premium com gradientes
- `.glass-card` - Cards com glassmorphism
- `.glass-overlay` - Overlays com blur

### Animações Premium
- `.animate-fade-in` - Entrada suave
- `.animate-scale-in` - Escala com entrada
- `.animate-slide-in-left` - Desliza da esquerda
- `.animate-premium-pulse` - Pulse premium
- `.animate-float` - Flutuação suave
- `.animate-glow` - Brilho animado

### Typography System
- `.text-display` - Títulos grandes (6xl-7xl)
- `.text-headline` - Títulos principais (4xl-5xl)
- `.text-title` - Títulos seções (2xl-3xl)
- `.text-subtitle` - Subtítulos (lg-xl)
- `.text-body-large` - Texto corpo grande (base-lg)
- `.text-body` - Texto corpo (sm-base)
- `.text-caption` - Legendas (xs-sm)

## 🚀 Performance

### Otimizações Implementadas
- **Lazy Loading**: Componentes carregados sob demanda
- **Memo**: Prevenção de re-renders desnecessários
- **CSS Puro**: Animações em CSS para melhor performance
- **Minimal Bundle**: Apenas componentes utilizados são incluídos

### Best Practices
1. Use `PremiumAnimatedContainer` para animações complexas
2. Prefira `glass-premium` para elementos importantes
3. Combine `PremiumGrid` com `PremiumCard` para layouts
4. Use `PremiumStaggerContainer` para listas animadas

## 📱 Responsividade

### Breakpoints Tailwind
- **sm**: 640px+
- **md**: 768px+
- **lg**: 1024px+
- **xl**: 1280px+
- **2xl**: 1536px+

### Mobile First
Todos os componentes seguem a abordagem mobile-first:
- Layouts se adaptam automaticamente
- Touch targets adequados (44px mínimo)
- Navegação otimizada para mobile
- Safe areas respeitadas (notch, etc.)

## 🔧 Implementação

### Setup Inicial
```tsx
// Importe os componentes necessários
import {
  PremiumLayout,
  PremiumContainer,
  PremiumCard,
  PremiumButton
} from '@/components/premium';

// Use no seu componente
export const MyPage = () => {
  return (
    <PremiumLayout background="gradient">
      <PremiumContainer size="lg">
        <PremiumCard variant="glass" animated>
          <PremiumButton variant="primary">
            Ação Premium
          </PremiumButton>
        </PremiumCard>
      </PremiumContainer>
    </PremiumLayout>
  );
};
```

### Estrutura de Pastas
```
components/premium/
├── index.ts                 # Barrel exports
├── premium-layout.tsx       # Layout components
├── premium-button.tsx       # Button components
├── premium-input.tsx        # Input components
├── premium-card.tsx         # Card components
├── premium-modal.tsx        # Modal components
├── premium-table.tsx        # Table components
├── premium-form.tsx         # Form components
├── premium-loading.tsx      # Loading states
├── premium-toast.tsx        # Toast notifications
├── premium-badge.tsx        # Badge components
├── premium-select.tsx       # Select components
└── premium-animations.tsx   # Animation components
```

## ✅ Checklist de Qualidade

- [x] **TypeScript Strict**: Tipagem completa
- [x] **Acessibilidade**: ARIA labels e navegação por teclado
- [x] **Performance**: Otimizado para 60fps
- [x] **Responsividade**: Mobile-first design
- [x] **Glassmorphism**: Efeitos modernos implementados
- [x] **Micro-animações**: Transições suaves
- [x] **Dark Theme**: Tema escuro profissional
- [x] **Componentização**: Biblioteca reutilizável
- [x] **Documentação**: Exemplos completos

---

**Desenvolvido seguindo os padrões premium AfiliadosBet** 🚀