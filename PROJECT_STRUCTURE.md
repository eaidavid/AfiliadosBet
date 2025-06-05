# Estrutura do Projeto AfiliadosBet - Organizada

## 📁 Estrutura Principal

```
AfiliadosBet/
├── client/                     # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── hooks/             # Hooks customizados
│   │   ├── lib/               # Utilitários e configurações
│   │   ├── pages/             # Páginas do sistema
│   │   │   ├── archived/      # Páginas antigas arquivadas
│   │   │   └── *.tsx          # Páginas ativas
│   │   ├── App.tsx            # Configuração de rotas
│   │   ├── main.tsx           # Ponto de entrada
│   │   └── index.css          # Estilos globais
│   ├── index.html
│   └── public/
├── server/                     # Backend Express + TypeScript
├── shared/                     # Código compartilhado
│   └── schema.ts              # Schemas do banco de dados
├── attached_assets/           # Assets do usuário
├── archived_files/            # Arquivos da raiz arquivados
└── [arquivos de configuração] # Package.json, configs, etc.
```

## 🎯 Páginas Ativas do Sistema

### Landing e Autenticação
- **simple-landing.tsx** - Página principal (rota "/")
- **login.tsx** - Sistema de login
- **register.tsx** - Cadastro de usuários

### Painel do Afiliado
- **user-dashboard-complete.tsx** - Dashboard principal
- **affiliate-home.tsx** - Home do afiliado
- **betting-houses.tsx** - Lista de casas de apostas
- **my-links.tsx** - Gerenciamento de links
- **affiliate-reports.tsx** - Relatórios detalhados
- **affiliate-payments.tsx** - Gestão de pagamentos
- **user-profile.tsx** - Perfil do usuário

### Painel Administrativo
- **admin-dashboard-responsive.tsx** - Dashboard principal
- **admin-casas.tsx** - Gestão simplificada de casas
- **admin-houses.tsx** - Administração completa de casas
- **admin-manage.tsx** - Gerenciamento de afiliados
- **admin-settings-enhanced.tsx** - Configurações avançadas
- **postback-generator-professional.tsx** - Gerador de postbacks
- **postback-logs.tsx** - Logs e monitoramento

### Utilitários
- **not-found.tsx** - Página 404

## 🗂️ Arquivos Organizados

### Páginas Arquivadas (client/src/pages/archived/)
- 14 páginas antigas incluindo dashboards, relatórios e versões obsoletas
- Documentação completa no README.md da pasta

### Arquivos da Raiz Arquivados (archived_files/)
- Documentações antigas
- Scripts de deploy obsoletos
- Configurações descontinuadas
- Arquivos de desenvolvimento antigos

## ⚙️ Configurações Essenciais Mantidas

### Configuração do Frontend
- `package.json` - Dependências principais
- `vite.config.ts` - Configuração do Vite
- `tailwind.config.ts` - Tailwind CSS
- `tsconfig.json` - TypeScript

### Configuração do Backend
- `drizzle.config.ts` - ORM do banco
- `ecosystem.config.js` - PM2
- `.env.example` - Variáveis de ambiente

## 🎨 Sistema de Design

- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS + Shadcn/ui
- **Tema:** Dark blue moderno (slate-950/800)
- **Layout:** Responsivo com container centralizado
- **Animações:** Suaves e profissionais

## 🛣️ Roteamento Ativo

```
/ - Landing page principal
/login - Autenticação
/register - Cadastro
/dashboard - Dashboard do usuário
/houses - Casas de apostas
/my-links - Links do afiliado
/reports - Relatórios
/payments - Pagamentos
/profile - Perfil

/admin - Dashboard administrativo
/admin/houses - Gestão de casas
/admin/manage - Gestão de afiliados
/admin/settings - Configurações
/admin/postback-generator - Gerador de postbacks
/admin/postback-logs - Logs de postbacks
```

## 📊 Status do Sistema

✅ **Landing Page** - Sistema de abas informativas completo
✅ **Painel de Usuário** - Dashboard e funcionalidades ativas
✅ **Painel Admin** - Gestão completa e responsiva
✅ **Autenticação** - Login/registro funcionais
✅ **Arquitetura** - Código organizado e limpo
✅ **Performance** - Erros corrigidos, estrutura otimizada

## 🔧 Melhorias Implementadas

1. **Limpeza Organizacional**
   - Arquivamento de páginas obsoletas
   - Remoção de arquivos desnecessários
   - Estrutura mais clara e navegável

2. **Correções Técnicas**
   - Eliminação de CSS inválido
   - Tratamento de promise rejections
   - Imports corrigidos

3. **Documentação**
   - READMEs explicativos
   - Estrutura do projeto documentada
   - Histórico preservado

O sistema agora possui uma estrutura limpa, organizada e totalmente funcional, facilitando desenvolvimento e manutenção contínua.