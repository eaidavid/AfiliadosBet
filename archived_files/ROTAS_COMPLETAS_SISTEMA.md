# DOCUMENTAÇÃO COMPLETA DE ROTAS - AfiliadosBet

## 🔧 PAINEL ADMINISTRATIVO (Admin)

### 📍 Acesso Base
- **URL Base**: `/admin`
- **Autenticação**: Requerida (role: 'admin')
- **Sidebar**: `client/src/components/admin/sidebar.tsx`

### 🎯 Rotas Administrativas Disponíveis

#### 1. **Dashboard Administrativo**
- **ID Menu**: `dashboard`
- **Rota**: `/admin`
- **Ícone**: BarChart3
- **Descrição**: Visão geral do sistema com métricas globais
- **Funcionalidades**: Estatísticas de afiliados, conversões, receita total

#### 2. **Administração de Casas**
- **ID Menu**: `houses`
- **Rota**: `/admin/houses`
- **Ícone**: Building
- **Descrição**: Configuração e gestão das casas parceiras
- **Funcionalidades**: CRUD de casas, configuração de comissões, postbacks

#### 3. **Administração de Afiliados**
- **ID Menu**: `manage`
- **Rota**: `/admin/manage`
- **Ícone**: Users
- **Descrição**: Gestão completa de afiliados
- **Funcionalidades**: Lista de afiliados, aprovação, bloqueio, performance

#### 4. **Gerador de Postbacks**
- **ID Menu**: `gerador-de-postbacks`
- **Rota**: `/admin/postback-generator`
- **Ícone**: Webhook
- **Descrição**: Criação e teste de postbacks
- **Funcionalidades**: URLs personalizadas, parâmetros, testes automáticos

#### 5. **Logs de Postbacks**
- **ID Menu**: `logs-postbacks`
- **Rota**: `/admin/postback-logs`
- **Ícone**: Activity
- **Descrição**: Monitoramento de postbacks enviados
- **Funcionalidades**: Histórico, status, debugging, filtragem

#### 6. **Configurações Avançadas**
- **ID Menu**: `admin-settings`
- **Rota**: `/admin/settings`
- **Ícone**: Settings
- **Descrição**: Configurações globais da plataforma
- **Funcionalidades**: Parâmetros do sistema, integrações, APIs

---

## 👤 PAINEL DO USUÁRIO/AFILIADO (User)

### 📍 Acesso Base
- **URL Base**: `/`
- **Autenticação**: Requerida (role: 'user')
- **Sidebar**: `client/src/components/affiliate-sidebar.tsx`

### 🎯 Rotas de Usuário Disponíveis

#### 1. **Dashboard do Afiliado**
- **Rota**: `/home`
- **Ícone**: Home
- **Descrição**: Visão geral e estatísticas pessoais
- **Funcionalidades**: Comissões, cliques, conversões, gráficos

#### 2. **Casas de Apostas**
- **Rota**: `/betting-houses`
- **Ícone**: Building2
- **Descrição**: Casas disponíveis para afiliação
- **Funcionalidades**: Lista de casas, comissões, geração de links

#### 3. **Meus Links**
- **Rota**: `/my-links`
- **Ícone**: Link2
- **Descrição**: Visualizar e gerenciar links de afiliação
- **Funcionalidades**: Performance por link, edição, estatísticas

#### 4. **Relatórios**
- **Rota**: `/reports`
- **Ícone**: BarChart3
- **Descrição**: Relatórios e analytics detalhados
- **Funcionalidades**: Gráficos avançados, exportação, filtros

#### 5. **Pagamentos**
- **Rota**: `/payments`
- **Ícone**: CreditCard
- **Descrição**: Histórico de pagamentos e solicitações
- **Funcionalidades**: Histórico, PIX, saques, comissões

#### 6. **Perfil do Usuário**
- **Rota**: `/profile`
- **Ícone**: User
- **Descrição**: Gerenciar perfil e configurações pessoais
- **Funcionalidades**: Dados pessoais, senha, chave PIX

---

## 🔄 ROTAS DE AUTENTICAÇÃO

#### **Login**
- **Rota**: `/login`
- **Descrição**: Página de autenticação
- **Funcionalidades**: Login por email/CPF, recuperação de senha

#### **Logout**
- **Função**: Disponível em ambos os painéis
- **Descrição**: Encerramento de sessão
- **Redirecionamento**: `/login`

---

## 🎨 ESTRUTURA DE NAVEGAÇÃO

### Admin Sidebar - Configuração
```typescript
interface AdminSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "houses", label: "Administração de Casas", icon: Building },
  { id: "manage", label: "Administração de Afiliados", icon: Users },
  { id: "gerador-de-postbacks", label: "Gerador de Postbacks", icon: Webhook },
  { id: "logs-postbacks", label: "Logs de Postbacks", icon: Activity },
  { id: "admin-settings", label: "Configurações Avançadas", icon: Settings }
];
```

### Affiliate Sidebar - Configuração
```typescript
const navigationItems = [
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

## 🔐 CONTROLE DE ACESSO

### Verificação de Permissões
- **Admin**: `role: 'admin'` - Acesso total ao sistema
- **User**: `role: 'user'` - Acesso restrito ao painel de afiliado
- **Middleware**: Verificação automática em todas as rotas protegidas

### Redirecionamentos
- **Não autenticado**: → `/login`
- **Admin sem permissão**: → `/login`
- **User tentando acessar admin**: → `/home`

---

## 📱 RESPONSIVIDADE

### Desktop
- **Sidebar**: Fixa com largura variável (72px colapsado / 288px expandido)
- **Conteúdo**: Margem automática baseada no estado da sidebar

### Mobile
- **Sidebar**: Overlay com menu hambúrguer
- **Conteúdo**: Largura total sem margem
- **Navegação**: Touch-friendly com botões maiores

---

## 🛠️ TECNOLOGIAS UTILIZADAS

### Roteamento
- **Biblioteca**: `wouter`
- **Componentes**: `Link`, `useLocation`
- **Tipo**: Client-side routing

### UI/UX
- **Design System**: Shadcn/UI + Tailwind CSS
- **Ícones**: Lucide React
- **Tema**: Dark mode com gradientes

### Estado
- **Sidebar**: `useState` para controle de collapse/mobile
- **Autenticação**: Custom hooks (`useAuth`, `useLogout`)
- **Mobile**: `useIsMobile` hook personalizado

---

## 📋 RESUMO DE ROTAS

### Admin (6 páginas)
1. `/admin` - Dashboard
2. `/admin/houses` - Casas
3. `/admin/manage` - Afiliados  
4. `/admin/postback-generator` - Postbacks
5. `/admin/postback-logs` - Logs
6. `/admin/settings` - Configurações

### User (6 páginas)
1. `/home` - Dashboard
2. `/betting-houses` - Casas
3. `/my-links` - Links
4. `/reports` - Relatórios
5. `/payments` - Pagamentos
6. `/profile` - Perfil

### Autenticação (1 página)
1. `/login` - Login/Registro

**Total: 13 rotas principais no sistema**