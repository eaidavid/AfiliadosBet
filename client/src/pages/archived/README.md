# Páginas Arquivadas - AfiliadosBet

Esta pasta contém páginas que foram removidas do sistema principal por não estarem mais em uso ou por serem versões antigas substituídas por implementações mais recentes.

## Páginas Arquivadas

### Dashboards Antigos
- `admin-dashboard.tsx` - Dashboard administrativo antigo
- `admin-dashboard-new.tsx` - Versão intermediária do dashboard admin
- `user-dashboard.tsx` - Dashboard de usuário antigo
- `user-dashboard-simple.tsx` - Versão simplificada do dashboard
- `user-dashboard-clean.tsx` - Versão limpa do dashboard

### Relatórios Antigos
- `admin-reports.tsx` - Relatórios administrativos antigos
- `admin-reports-fixed.tsx` - Versão corrigida dos relatórios admin
- `user-reports.tsx` - Relatórios de usuário antigos
- `user-reports-clean.tsx` - Versão limpa dos relatórios
- `user-reports-fixed.tsx` - Versão corrigida dos relatórios

### Configurações e Outros
- `admin-settings.tsx` - Configurações administrativas antigas
- `admin-leads-management.tsx` - Gerenciamento de leads (não utilizado)
- `dashboard.tsx` - Dashboard genérico antigo
- `landing-page.tsx` - Landing page antiga (substituída por simple-landing.tsx)
- `postback-generator.tsx` - Gerador de postbacks antigo

## Páginas Ativas Atuais

### Landing e Autenticação
- `simple-landing.tsx` - Página inicial principal (rota "/")
- `login.tsx` - Página de login
- `register.tsx` - Página de cadastro

### Painel de Usuário/Afiliado
- `user-dashboard-complete.tsx` - Dashboard principal do usuário
- `affiliate-home.tsx` - Página inicial do afiliado
- `betting-houses.tsx` - Lista de casas de apostas
- `my-links.tsx` - Gerenciamento de links do afiliado
- `affiliate-reports.tsx` - Relatórios do afiliado
- `affiliate-payments.tsx` - Pagamentos do afiliado
- `user-profile.tsx` - Perfil do usuário

### Painel Administrativo
- `admin-dashboard-responsive.tsx` - Dashboard principal responsivo
- `admin-casas.tsx` - Gerenciamento de casas (versão simplificada)
- `admin-houses.tsx` - Administração completa de casas
- `admin-manage.tsx` - Gerenciamento de afiliados
- `admin-settings-enhanced.tsx` - Configurações avançadas
- `postback-generator-professional.tsx` - Gerador profissional de postbacks
- `postback-logs.tsx` - Logs de postbacks

### Utilidades
- `not-found.tsx` - Página 404

## Nota sobre Limpeza

Esta organização foi feita para:
1. Reduzir a confusão entre múltiplas versões de páginas similares
2. Manter apenas as implementações mais recentes e funcionais
3. Preservar o código antigo para referência futura se necessário
4. Melhorar a performance removendo imports desnecessários

Todas as páginas ativas estão devidamente configuradas no roteamento principal do App.tsx.