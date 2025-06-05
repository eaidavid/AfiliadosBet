# DOCUMENTAÇÃO COMPLETA DOS MENUS LATERAIS - AfiliadosBet

## 📋 VISÃO GERAL
Sistema de navegação lateral para duas interfaces distintas:
- **Painel Administrativo**: Gestão completa da plataforma
- **Painel do Usuário (Afiliado)**: Ferramentas de marketing e acompanhamento

---

## 🔧 PAINEL ADMINISTRATIVO (Admin Sidebar)

### 📍 Localização do Arquivo
```
client/src/components/admin/sidebar.tsx
```

### 🎯 Funcionalidades Principais (Baseado no Código Real)

#### 1. **Dashboard Administrativo**
- **ID**: `dashboard`
- **Rota**: `/admin`
- **Ícone**: BarChart3
- **Função**: Visão geral do sistema com métricas globais
- **Dados**: Estatísticas de afiliados, conversões, receita total

#### 2. **Administração de Casas**
- **ID**: `houses`
- **Rota**: `/admin/houses`
- **Ícone**: Building
- **Função**: Configuração e gestão das casas parceiras
- **Dados**: Lista de casas, comissões, postbacks, status

#### 3. **Administração de Afiliados**
- **ID**: `manage`
- **Rota**: `/admin/manage`
- **Ícone**: Users
- **Função**: Gestão completa de afiliados
- **Dados**: Lista de afiliados, status, performance, pagamentos

#### 4. **Gerador de Postbacks**
- **ID**: `gerador-de-postbacks`
- **Rota**: `/admin/postback-generator`
- **Ícone**: Webhook
- **Função**: Criação e teste de postbacks
- **Dados**: URLs, parâmetros, testes automáticos

#### 5. **Logs de Postbacks**
- **ID**: `logs-postbacks`
- **Rota**: `/admin/postback-logs`
- **Ícone**: Activity
- **Função**: Monitoramento de postbacks enviados
- **Dados**: Histórico, status, erros, debug

#### 6. **Configurações Avançadas**
- **ID**: `admin-settings`
- **Rota**: `/admin/settings`
- **Ícone**: Settings
- **Função**: Configurações globais da plataforma
- **Dados**: Parâmetros do sistema, integrações, APIs

#### 7. **Gerenciamento de Leads** (Disponível)
- **ID**: `leads`
- **Rota**: `/admin/leads`
- **Ícone**: Users
- **Função**: Gestão completa de leads e prospects
- **Dados**: Lista de leads, status, origem, conversões

### 🎨 Características Visuais do Admin Sidebar
- **Largura**: Variável (72px colapsado / 288px expandido)
- **Posição**: Fixa à esquerda
- **Tema**: Escuro com gradientes azuis
- **Logo**: AfiliadosBet no topo
- **Colapso**: Funcionalidade de collapse/expand
- **Mobile**: Menu responsivo com overlay

### 🛠️ Props e Interface (Admin)
```typescript
interface AdminSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}
```

### 🔐 Controle de Acesso
- Restrito a usuários com `role: 'admin'`
- Verificação automática de permissões
- Redirecionamento para login se não autorizado
- Botão de logout integrado

---

## 👤 PAINEL DO USUÁRIO/AFILIADO (Affiliate Sidebar)

### 📍 Localização do Arquivo
```
client/src/components/affiliate-sidebar.tsx
```

### 🎯 Funcionalidades Principais (Baseado no Código Real)

#### 1. **Dashboard**
- **Href**: `/home`
- **Ícone**: Home
- **Título**: "Dashboard"
- **Descrição**: "Visão geral e estatísticas"
- **Função**: Visão geral das métricas do afiliado
- **Dados**: Cliques, conversões, comissões, performance

#### 2. **Casas de Apostas**
- **Href**: `/betting-houses`
- **Ícone**: Building2
- **Título**: "Casas de Apostas"
- **Descrição**: "Casas disponíveis para afiliação"
- **Função**: Explorar casas disponíveis para afiliação
- **Dados**: Lista de casas, comissões, detalhes, oportunidades

#### 3. **Meus Links**
- **Href**: `/my-links`
- **Ícone**: Link2
- **Título**: "Meus Links"
- **Descrição**: "Visualizar e gerenciar meus links"
- **Função**: Gestão dos links de afiliado
- **Dados**: Links ativos, performance, cliques, conversões

#### 4. **Relatórios**
- **Href**: `/reports`
- **Ícone**: BarChart3
- **Título**: "Relatórios"
- **Descrição**: "Relatórios e analytics"
- **Função**: Análises detalhadas de performance
- **Dados**: Gráficos, métricas, tendências, comparativos

#### 5. **Pagamentos**
- **Href**: `/payments`
- **Ícone**: CreditCard
- **Título**: "Pagamentos"
- **Descrição**: "Histórico de pagamentos"
- **Função**: Dashboard financeiro completo
- **Dados**: 
  - Saldo disponível para saque
  - Total recebido historicamente
  - Pagamentos pendentes
  - Ganhos mensais
  - Histórico de transações
  - Solicitação de saques
  - Informações bancárias/PIX

#### 6. **Perfil**
- **Href**: `/profile`
- **Ícone**: User
- **Título**: "Perfil"
- **Descrição**: "Gerenciar perfil e configurações"
- **Função**: Gerenciamento de dados pessoais
- **Dados**: Informações pessoais, documentos, configurações

### 🎨 Características Visuais do Affiliate Sidebar
- **Largura**: Variável (64px colapsado / 288px expandido)
- **Posição**: Fixa à esquerda (z-40)
- **Tema**: Escuro slate-900 com bordas slate-800
- **Logo**: Crown icon + "AfiliadosBet" com subtitle "Painel do Afiliado"
- **Colapso**: Botão ChevronLeft/ChevronRight
- **Cores de Destaque**: Emerald-400 (#34D399)

### 🛠️ Props e Interface (Affiliate)
```typescript
interface AffiliateSidebarProps {
  className?: string;
}

interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}
```

### 🔐 Controle de Acesso
- Restrito a usuários autenticados
- Verificação de sessão ativa via useAuth hook
- Redirecionamento automático para login
- Integração com sistema de logout

---

## 🗄️ ESTRUTURA DE DADOS

### Admin Sidebar - Estrutura Real
```typescript
interface AdminSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "houses", label: "Administração de Casas", icon: Building },
  { id: "manage", label: "Administração de Afiliados", icon: Users },
  { id: "gerador-de-postbacks", label: "Gerador de Postbacks", icon: Webhook },
  { id: "logs-postbacks", label: "Logs de Postbacks", icon: Activity },
  { id: "admin-settings", label: "Configurações Avançadas", icon: Settings }
];
```

### Affiliate Sidebar - Estrutura Real
```typescript
interface AffiliateSidebarProps {
  className?: string;
}

interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/home',
    icon: Home,
    description: 'Visão geral e estatísticas'
  },
  {
    title: 'Casas de Apostas',
    href: '/betting-houses',
    icon: Building2,
    description: 'Casas disponíveis para afiliação'
  },
  {
    title: 'Meus Links',
    href: '/my-links',
    icon: Link2,
    description: 'Visualizar e gerenciar meus links'
  },
  {
    title: 'Relatórios',
    href: '/reports',
    icon: BarChart3,
    description: 'Relatórios e analytics'
  },
  {
    title: 'Pagamentos',
    href: '/payments',
    icon: CreditCard,
    description: 'Histórico de pagamentos'
  },
  {
    title: 'Perfil',
    href: '/profile',
    icon: User,
    description: 'Gerenciar perfil e configurações'
  }
];
```

---

## 🎭 ESTADOS E INTERAÇÕES

### Admin Sidebar - Estados
- **Collapsed**: Largura reduzida com ícones apenas
- **Expanded**: Largura completa com labels
- **Mobile**: Overlay responsivo
- **Active Page**: Destaque visual do item ativo

### Affiliate Sidebar - Estados  
- **Collapsed**: w-16 (64px) apenas ícones
- **Expanded**: w-72 (288px) completo
- **Navigation Active**: Baseado em useLocation hook
- **Hover Effects**: Transições suaves

### Responsividade
- **Desktop**: Menu fixo lateral
- **Tablet**: Funcionalidade de collapse
- **Mobile**: Menu overlay com gesture support

---

## 🔌 NAVEGAÇÃO E ROTEAMENTO

### Admin Sidebar - Roteamento
```typescript
const handlePageChange = (page: string) => {
  onPageChange(page);
  
  // Navegação direta via window.location.href
  if (page === "dashboard") window.location.href = "/admin";
  if (page === "houses") window.location.href = "/admin/houses";
  if (page === "manage") window.location.href = "/admin/manage";
  if (page === "gerador-de-postbacks") window.location.href = "/admin/postback-generator";
  if (page === "logs-postbacks") window.location.href = "/admin/postback-logs";
  if (page === "admin-settings") window.location.href = "/admin/settings";
  if (page === "leads") window.location.href = "/admin/leads";
};
```

### Affiliate Sidebar - Roteamento
```typescript
// Utiliza wouter para navegação
import { Link, useLocation } from 'wouter';

// Navegação via Link components
<Link href="/payments" className="nav-link">
  <CreditCard className="h-5 w-5" />
  <span>Pagamentos</span>
</Link>
```

---

## 🎨 ESTILOS E CUSTOMIZAÇÃO

### Classes CSS Principais
```css
/* Admin Sidebar */
.admin-sidebar {
  @apply fixed left-0 top-0 z-50 h-screen bg-slate-900 border-r border-slate-800;
}

/* Affiliate Sidebar */
.affiliate-sidebar {
  @apply fixed left-0 top-0 z-40 h-screen bg-slate-900 border-r border-slate-800;
}

/* Collapse States */
.sidebar-collapsed {
  @apply w-16;
}

.sidebar-expanded {
  @apply w-72;
}
```

### Variáveis de Cor
```css
:root {
  --admin-primary: #3B82F6; /* Blue */
  --affiliate-primary: #10B981; /* Emerald */
  --sidebar-bg: #0F172A; /* Slate-900 */
  --sidebar-border: #1E293B; /* Slate-800 */
}
```

---

## 🛠️ HOOKS E UTILITÁRIOS

### Hooks Utilizados
```typescript
// Admin Sidebar
import { useLogout } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";

// Affiliate Sidebar  
import { useLocation } from 'wouter';
import { useState } from 'react';
```

### Componentes UI
```typescript
// Componentes Shadcn/UI utilizados
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Para Adicionar Nova Funcionalidade:

#### Admin Sidebar
1. [ ] Adicionar item no array `menuItems`
2. [ ] Criar rota no `handlePageChange`
3. [ ] Implementar página correspondente
4. [ ] Adicionar rota no `App.tsx`
5. [ ] Configurar permissões admin

#### Affiliate Sidebar
1. [ ] Adicionar item no array `navigationItems`
2. [ ] Criar componente da página
3. [ ] Adicionar rota no `App.tsx`
4. [ ] Configurar proteção de autenticação
5. [ ] Testar responsividade

---

## 🔧 DEPENDÊNCIAS TÉCNICAS

### Bibliotecas Principais
```json
{
  "wouter": "^3.0.0",
  "lucide-react": "^0.263.1",
  "@radix-ui/react-*": "latest",
  "tailwindcss": "^3.3.0"
}
```

### Ícones Utilizados
```typescript
// Admin Sidebar Icons
import { 
  BarChart3, Users, Building, Webhook, 
  Activity, Settings, LogOut, Menu, X, 
  ChevronLeft, ChevronRight 
} from "lucide-react";

// Affiliate Sidebar Icons
import {
  Home, Building2, Link2, BarChart3,
  CreditCard, User, LogOut, Bell, Crown,
  ChevronLeft, ChevronRight
} from "lucide-react";
```

---

## 🚨 TROUBLESHOOTING

### Problemas Comuns

#### 1. **Menu não aparece**
- Verificar z-index conflicts
- Confirmar importação correta do componente
- Validar permissões de usuário

#### 2. **Navegação não funciona**
- Verificar rotas no App.tsx
- Confirmar implementação useLocation
- Validar props passadas

#### 3. **Responsividade quebrada**
- Verificar classes Tailwind
- Confirmar breakpoints mobile
- Validar estado collapsed

### Debug útil
```typescript
// Para debug de navegação
console.log('Current location:', location);
console.log('Is mobile:', isMobile);
console.log('Current page:', currentPage);
```

---

## 📈 ANALYTICS E MONITORAMENTO

### Métricas Importantes
- Tempo de carregamento do sidebar
- Frequência de uso de cada item
- Taxa de bounce por seção
- Performance em mobile

### Logging Recomendado
```typescript
// Track navigation events
const trackNavigation = (page: string) => {
  console.log(`Navigation to: ${page}`);
  // Implementar analytics real aqui
};
```

---

## 🔄 ATUALIZAÇÕES E VERSIONAMENTO

### Última Atualização: Junho 2025
- Implementação da página de Pagamentos (/payments)
- Correção de overlapping mobile
- Documentação completa dos sidebars
- Integração com dados reais do banco

### Próximas Melhorias
- [ ] Sistema de notificações em tempo real
- [ ] Badges dinâmicos
- [ ] Shortcuts de teclado
- [ ] Temas customizáveis
- [ ] Analytics avançado

---

*Documentação Técnica Completa - AfiliadosBet v2.0*
*Sistema de Afiliados com Dashboard Administrativo e do Usuário*