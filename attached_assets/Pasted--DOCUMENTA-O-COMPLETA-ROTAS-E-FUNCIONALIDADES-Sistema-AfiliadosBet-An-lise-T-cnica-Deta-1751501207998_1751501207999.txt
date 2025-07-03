
# 📋 DOCUMENTAÇÃO COMPLETA - ROTAS E FUNCIONALIDADES
## Sistema AfiliadosBet - Análise Técnica Detalhada

---

## 🏠 PÁGINA INICIAL E AUTENTICAÇÃO

### 1. **Landing Page** - `/`
**Arquivo:** `client/src/pages/simple-landing.tsx`
**Função:** Página inicial pública do sistema
**Funcionalidades:**
- Sistema de abas com informações sobre a plataforma
- Seção "Como Funciona" com 3 etapas do processo
- Seção "Vantagens" destacando benefícios
- Seção "Comissões" explicando modelo de ganhos
- Formulário de contato integrado
- Design responsivo com tema dark/blue
- Call-to-action para cadastro/login

### 2. **Login** - `/login`
**Arquivo:** `client/src/pages/login.tsx`
**Função:** Autenticação de usuários e administradores
**Funcionalidades:**
- Login por email ou CPF
- Validação client-side e server-side
- Redirecionamento automático baseado na role (admin/affiliate)
- Sistema de sessões com cookies seguros
- Tratamento de erros de autenticação
- Link para página de registro

### 3. **Registro** - `/register`
**Arquivo:** `client/src/pages/register.tsx`
**Função:** Cadastro de novos afiliados
**Funcionalidades:**
- Formulário completo com dados pessoais
- Validação de CPF, email único, username único
- Hash de senha com bcrypt
- Criação automática como role 'affiliate'
- Validação de idade (18+)
- Termos de uso e política de privacidade

---

## 👤 PAINEL DO AFILIADO

### 4. **Dashboard Afiliado** - `/home` ou `/dashboard`
**Arquivo:** `client/src/pages/affiliate-home.tsx`
**Função:** Painel principal do afiliado com métricas
**Funcionalidades:**
- **Cards de Estatísticas:**
  - Total de cliques registrados
  - Total de registros convertidos
  - Total de depósitos realizados
  - Comissão total acumulada
  - Taxa de conversão calculada
- **Gráficos Interativos:**
  - Linha temporal de cliques (últimos 7 dias)
  - Performance por casa de apostas
- **Seção de Conversões Recentes:**
  - Lista das últimas 10 conversões
  - Detalhes: tipo, valor, comissão, data
- **Quick Actions:**
  - Criar novo link de afiliação
  - Acessar relatórios detalhados
  - Solicitar saque

### 5. **Casas de Apostas** - `/betting-houses`
**Arquivo:** `client/src/pages/betting-houses.tsx`
**Função:** Listagem e afiliação às casas disponíveis
**Funcionalidades:**
- **Lista de Casas Disponíveis:**
  - Card visual para cada casa
  - Logo, nome, descrição
  - Tipo de comissão (CPA/RevShare/Hybrid)
  - Valor da comissão
  - Status de afiliação do usuário
- **Sistema de Afiliação:**
  - Botão "Afiliar-se" para casas não afiliadas
  - Geração automática de links únicos
  - Validação de afiliação única por casa
- **Filtros e Busca:**
  - Filtrar por tipo de comissão
  - Buscar por nome da casa
  - Ordenar por maior comissão
- **Link Tracking:**
  - Geração de URL com subid (username)
  - Sistema de tracking de cliques

### 6. **Meus Links** - `/my-links`
**Arquivo:** `client/src/pages/my-links.tsx`
**Função:** Gerenciamento dos links de afiliação
**Funcionalidades:**
- **Lista de Links Ativos:**
  - URL completo gerado
  - Casa de apostas associada
  - Data de criação
  - Status (ativo/inativo)
- **Estatísticas por Link:**
  - Número total de cliques
  - Conversões geradas
  - Comissão acumulada
  - Taxa de conversão
- **Ferramentas de Link:**
  - Copiar URL para clipboard
  - Gerar QR Code
  - Preview do link
  - Compartilhamento social
- **Performance Analytics:**
  - Gráfico de cliques por dia
  - Horários de maior engajamento
  - Origem do tráfego

### 7. **Relatórios** - `/reports`
**Arquivo:** `client/src/pages/affiliate-reports.tsx`
**Função:** Analytics avançados e relatórios detalhados
**Funcionalidades:**
- **Filtros de Período:**
  - Últimas 24h, 7 dias, 30 dias, 90 dias
  - Período customizado (data início/fim)
- **Métricas Principais:**
  - Cliques únicos e totais
  - Registros e conversões
  - Volume de depósitos
  - Comissões por tipo (CPA/RevShare)
- **Gráficos Avançados:**
  - Linha temporal de performance
  - Distribuição por casa de apostas
  - Heatmap de atividade por hora
  - Funil de conversão
- **Tabela de Conversões:**
  - Lista paginada de todas as conversões
  - Filtros por tipo, casa, valor
  - Export para CSV/Excel
- **Análise Geográfica:**
  - Conversões por região (se disponível)
  - Performance por dispositivo

### 8. **Pagamentos** - `/payments`
**Arquivo:** `client/src/pages/affiliate-payments.tsx`
**Função:** Histórico e solicitação de pagamentos
**Funcionalidades:**
- **Saldo Disponível:**
  - Comissão total acumulada
  - Valor já sacado
  - Saldo disponível para saque
  - Próximo pagamento programado
- **Histórico de Pagamentos:**
  - Lista de todos os pagamentos
  - Status (pending/completed/failed)
  - Método (PIX/TED/Transferência)
  - Datas de solicitação e processamento
- **Solicitação de Saque:**
  - Formulário de nova solicitação
  - Validação de valor mínimo
  - Configuração de chave PIX
  - Confirmação por email/SMS
- **Configurações PIX:**
  - Tipos de chave (CPF/Email/Telefone/Aleatória)
  - Validação de chaves
  - Histórico de chaves utilizadas

### 9. **Perfil** - `/profile`
**Arquivo:** `client/src/pages/user-profile.tsx`
**Função:** Gerenciamento de dados pessoais
**Funcionalidades:**
- **Dados Pessoais:**
  - Nome completo, email, CPF
  - Telefone, data de nascimento
  - Endereço completo
- **Dados Bancários:**
  - Chave PIX principal
  - Banco, agência, conta
  - Titularidade da conta
- **Configurações de Conta:**
  - Alteração de senha
  - Configurações de notificação
  - Preferências de comunicação
- **Documentos:**
  - Upload de documentos de identificação
  - Status de verificação KYC
  - Histórico de alterações

---

## 🔐 PAINEL ADMINISTRATIVO

### 10. **Dashboard Admin** - `/admin`
**Arquivo:** `client/src/pages/admin-dashboard-simple.tsx`
**Função:** Painel principal com métricas globais do sistema
**Funcionalidades:**
- **KPIs Principais:**
  - Total de afiliados ativos
  - Total de casas de apostas
  - Volume total de conversões
  - Receita total gerada
- **Gráficos Executivos:**
  - Crescimento de afiliados por mês
  - Volume de conversões por casa
  - Receita mensal recorrente
  - Top 10 afiliados por performance
- **Alertas e Notificações:**
  - Novos cadastros pendentes
  - Pagamentos para aprovar
  - Problemas de integração
  - Metas mensais e status
- **Quick Actions:**
  - Aprovar novos afiliados
  - Configurar nova casa
  - Processar pagamentos
  - Gerar relatórios

### 11. **Gerenciamento de Casas** - `/admin/houses`
**Arquivo:** `client/src/pages/admin-houses.tsx`
**Função:** CRUD completo de casas de apostas
**Funcionalidades:**
- **Lista de Casas:**
  - Tabela com todas as casas cadastradas
  - Status (ativa/inativa)
  - Tipo de integração (Postback/API)
  - Número de afiliados conectados
- **Cadastro de Nova Casa:**
  - Informações básicas (nome, logo, descrição)
  - URL base e parâmetros de tracking
  - Configuração de comissões (CPA/RevShare)
  - Tokens de segurança automáticos
- **Configurações de Integração:**
  - **Postback:**
    - URLs de postback por evento
    - Parâmetros personalizados
    - Mapeamento de campos
  - **API:**
    - URL base da API
    - Chaves de autenticação
    - Método de auth (Bearer/Basic)
    - Intervalo de sincronização
- **Postbacks Automáticos:**
  - Geração de URLs únicas
  - Teste de connectivity
  - Logs de requisições
- **Gestão de Afiliados por Casa:**
  - Lista de afiliados por casa
  - Performance individual
  - Comissões pagas

### 12. **Gerenciamento de Afiliados** - `/admin/manage`
**Arquivo:** `client/src/pages/admin-manage.tsx`
**Função:** Administração completa de afiliados
**Funcionalidades:**
- **Lista de Afiliados:**
  - Tabela paginada com todos os afiliados
  - Filtros por status, casa, período
  - Busca por nome, email, username
- **Perfil Detalhado:**
  - Dados pessoais completos
  - Histórico de atividades
  - Performance por casa
  - Comissões acumuladas
- **Ações Administrativas:**
  - Ativar/desativar afiliados
  - Aprovar novos cadastros
  - Resetar senhas
  - Alterar dados pessoais
- **Análise de Performance:**
  - Gráficos individuais de conversão
  - Comparativo com média geral
  - Ranking de performance
  - Alertas de inatividade
- **Gestão de Comissões:**
  - Comissões personalizadas por afiliado
  - Bônus e penalidades
  - Histórico de alterações

### 13. **Gerador de Postbacks** - `/admin/postback-generator`
**Arquivo:** `client/src/pages/postback-generator-professional.tsx`
**Função:** Ferramenta para configuração de postbacks
**Funcionalidades:**
- **Configuração por Casa:**
  - Seleção da casa de apostas
  - Eventos disponíveis (click/register/deposit/profit)
  - URLs personalizadas por evento
- **Builder de URL:**
  - Interface visual para construção
  - Parâmetros disponíveis (subid, customer_id, value)
  - Preview em tempo real
  - Validação de sintaxe
- **Teste de Conectividade:**
  - Envio de postback de teste
  - Verificação de resposta
  - Log de debug detalhado
  - Histórico de testes
- **Templates Pré-configurados:**
  - Modelos para casas populares
  - Configurações otimizadas
  - Import/export de configurações
- **Documentação Integrada:**
  - Exemplos de implementação
  - Códigos de resposta
  - Troubleshooting comum

### 14. **Logs de Postbacks** - `/admin/postback-logs`
**Arquivo:** `client/src/pages/postback-logs.tsx`
**Função:** Monitoramento de postbacks enviados e recebidos
**Funcionalidades:**
- **Lista de Logs:**
  - Tabela com todos os postbacks processados
  - Filtros por casa, evento, status, data
  - Busca por customer_id ou subid
- **Detalhes do Postback:**
  - Dados completos da requisição
  - Headers enviados/recebidos
  - Payload JSON
  - Status code e resposta
- **Análise de Performance:**
  - Taxa de sucesso por casa
  - Tempo de resposta médio
  - Erros mais comuns
  - Volume por período
- **Alertas Automáticos:**
  - Taxa de erro alta
  - Postbacks com falha
  - Casas não respondendo
  - Timeout de requisições
- **Reprocessamento:**
  - Reenvio de postbacks com falha
  - Processamento em lote
  - Agendamento de retry

### 15. **Gerenciamento de Pagamentos** - `/admin/payments`
**Arquivo:** `client/src/pages/admin-payments.tsx`
**Função:** Administração de pagamentos e saques
**Funcionalidades:**
- **Fila de Pagamentos:**
  - Solicitações pendentes de aprovação
  - Informações do afiliado
  - Valor e método de pagamento
  - Validação de dados bancários
- **Processamento em Lote:**
  - Seleção múltipla de pagamentos
  - Aprovação/rejeição em massa
  - Geração de comprovantes
  - Integração com bancos (futuro)
- **Histórico Completo:**
  - Todos os pagamentos processados
  - Filtros avançados
  - Export para contabilidade
  - Reconciliação bancária
- **Análise Financeira:**
  - Fluxo de caixa mensal
  - Comissões pagas por casa
  - Projeções de pagamento
  - Relatórios fiscais
- **Configurações de Pagamento:**
  - Valores mínimos por método
  - Taxas e custos operacionais
  - Cronograma de processamento
  - Limites por afiliado

### 16. **Configurações do Sistema** - `/admin/settings`
**Arquivo:** `client/src/pages/admin-settings-enhanced.tsx`
**Função:** Configurações globais da plataforma
**Funcionalidades:**
- **Configurações Gerais:**
  - Nome da plataforma
  - Logotipos e branding
  - Informações de contato
  - Configurações de email
- **Configurações de Comissão:**
  - Valores padrão por tipo
  - Regras de cálculo
  - Prazos de pagamento
  - Mínimos para saque
- **Integrações:**
  - APIs de terceiros
  - Webhooks globais
  - Notificações automáticas
  - Backup e sincronização
- **Segurança:**
  - Configurações de sessão
  - Rate limiting
  - Logs de auditoria
  - Políticas de senha
- **Performance:**
  - Cache e otimização
  - Monitoramento de recursos
  - Limpeza automática
  - Configurações de banco

### 17. **Gerenciamento de API** - `/admin/api-management`
**Arquivo:** `client/src/pages/admin-api-management.tsx`
**Função:** Administração de chaves de API e integrações
**Funcionalidades:**
- **Chaves de API:**
  - Geração de novas chaves
  - Configuração de permissões
  - Rate limiting por chave
  - Logs de uso por chave
- **Documentação Integrada:**
  - Endpoints disponíveis
  - Exemplos de código
  - Schema de dados
  - Códigos de erro
- **Monitoramento:**
  - Uso por endpoint
  - Performance das APIs
  - Erros e timeouts
  - Estatísticas de uso
- **Webhooks:**
  - Configuração de webhooks
  - Retry policies
  - Assinatura de segurança
  - Logs de entrega

---

## 🔄 ROTAS DE API (Backend)

### 18. **Autenticação** - `/api/auth/*`
**Arquivo:** `server/routes.ts`
**Endpoints:**
- `POST /api/auth/login` - Login de usuários
- `POST /api/auth/logout` - Logout e destruição de sessão
- `POST /api/auth/register` - Cadastro de novos afiliados
- `GET /api/auth/me` - Informações do usuário autenticado

### 19. **Estatísticas** - `/api/stats/*`
**Arquivo:** `server/routes.ts`
**Endpoints:**
- `GET /api/stats/admin` - Estatísticas administrativas globais
- `GET /api/stats/user` - Estatísticas do afiliado logado
- `GET /api/stats/house/:houseId` - Estatísticas específicas por casa

### 20. **Casas de Apostas** - `/api/betting-houses` e `/api/admin/betting-houses`
**Arquivo:** `server/routes.ts`
**Endpoints:**
- `GET /api/betting-houses` - Lista casas (público/afiliado)
- `GET /api/admin/betting-houses` - Lista casas (admin)
- `POST /api/admin/betting-houses` - Criar nova casa
- `PUT /api/admin/betting-houses/:id` - Atualizar casa
- `DELETE /api/admin/betting-houses/:id` - Excluir casa

### 21. **Afiliados (Admin)** - `/api/admin/affiliates/*`
**Arquivo:** `server/routes.ts`
**Endpoints:**
- `GET /api/admin/affiliates` - Listar afiliados com filtros
- `GET /api/admin/affiliates/:id` - Detalhes de um afiliado
- `PATCH /api/admin/affiliates/:id` - Atualizar afiliado
- `DELETE /api/admin/affiliates/:id` - Excluir afiliado

### 22. **Links de Afiliação** - `/api/affiliate/*`
**Arquivo:** `server/routes.ts`
**Endpoints:**
- `POST /api/affiliate/join` - Criar link de afiliação
- `GET /api/affiliate/links` - Listar links do afiliado
- `GET /api/affiliate/stats` - Estatísticas do afiliado
- `GET /api/affiliate/conversions` - Conversões do afiliado
- `GET /api/affiliate/analytics` - Analytics avançados

### 23. **Perfil de Usuário** - `/api/user/*`
**Arquivo:** `server/routes.ts`
**Endpoints:**
- `GET /api/user/profile` - Dados do perfil
- `PUT /api/user/profile` - Atualizar perfil
- `PUT /api/user/pix` - Configurar chave PIX
- `GET /api/user/session` - Verificar sessão ativa

### 24. **Postbacks** - `/postback/*`
**Arquivo:** `server/routes.ts`
**Endpoints:**
- `GET /postback/click` - Receber postback de clique
- `GET /postback/register` - Receber postback de registro
- `GET /postback/deposit` - Receber postback de depósito
- `GET /postback/revenue` - Receber postback de receita

### 25. **Tracking** - `/track/:linkId`
**Arquivo:** `server/routes.ts`
**Função:** Rastreamento de cliques em links de afiliação
**Processo:**
1. Registra o clique no banco de dados
2. Captura IP, User-Agent, timestamp
3. Cria conversão do tipo 'click'
4. Redireciona para a casa de apostas

### 26. **Postbacks Registrados** - `/api/admin/registered-postbacks`
**Arquivo:** `server/routes.ts`
**Endpoints:**
- `GET /api/admin/registered-postbacks` - Listar postbacks
- `POST /api/admin/registered-postbacks` - Criar postback
- `PUT /api/admin/registered-postbacks/:id` - Atualizar postback
- `DELETE /api/admin/registered-postbacks/:id` - Excluir postback

### 27. **Conversões** - `/api/conversions/*`
**Arquivo:** `server/routes.ts`
**Endpoints:**
- `GET /api/conversions` - Listar conversões com filtros
- `GET /api/conversions/affiliates` - Afiliados para filtro
- `GET /api/conversions/houses` - Casas para filtro
- `POST /api/conversions/sync` - Sincronização manual

### 28. **Pagamentos (Admin)** - `/api/admin/payments/*`
**Arquivo:** `server/routes.ts`
**Endpoints:**
- `GET /api/admin/payments/stats` - Estatísticas de pagamentos
- `GET /api/admin/payments` - Listar pagamentos com filtros
- `GET /api/admin/payments/:id` - Detalhes do pagamento
- `PUT /api/admin/payments/:id` - Atualizar pagamento
- `PATCH /api/admin/payments/:id` - Atualização parcial
- `PATCH /api/admin/payments/bulk-update` - Ação em lote
- `GET /api/admin/payments/export` - Exportar dados
- `POST /api/admin/payments/:id/approve` - Aprovar pagamento
- `POST /api/admin/payments/:id/reject` - Rejeitar pagamento

### 29. **API v1 Externa** - `/api/v1/*`
**Arquivo:** `server/api-routes.ts`
**Endpoints:**
- `POST /api/v1/conversions` - Receber conversões externas
- `GET /api/v1/affiliates` - Listar afiliados (para casas)
- `POST /api/v1/webhook` - Webhooks genéricos
- `GET /api/v1/stats` - Estatísticas para casas
- `GET /api/v1/docs` - Documentação da API

### 30. **Webhooks** - `/webhook/*`
**Arquivo:** `server/webhook-endpoints.ts`
**Função:** Receber webhooks de diferentes casas de apostas
**Endpoints dinâmicos baseados na configuração das casas**

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### 31. **Schema Principal** - `shared/schema.ts`
**Tabelas:**

#### **users** (Usuários/Afiliados)
- `id` - Chave primária
- `username` - Nome de usuário único
- `email` - Email único
- `password` - Hash da senha
- `fullName` - Nome completo
- `cpf` - CPF único
- `phone` - Telefone
- `birthDate` - Data de nascimento
- `role` - Papel (admin/affiliate)
- `isActive` - Status ativo
- `pixKeyType` - Tipo da chave PIX
- `pixKeyValue` - Valor da chave PIX
- `createdAt` - Data de criação

#### **bettingHouses** (Casas de Apostas)
- `id` - Chave primária
- `name` - Nome da casa
- `description` - Descrição
- `logoUrl` - URL do logo
- `baseUrl` - URL base para afiliação
- `identifier` - Identificador único
- `securityToken` - Token de segurança
- `primaryParam` - Parâmetro principal (subid)
- `additionalParams` - Parâmetros adicionais
- `commissionType` - Tipo de comissão
- `commissionValue` - Valor da comissão
- `cpaValue` - Valor CPA
- `revshareValue` - Valor RevShare
- `minDeposit` - Depósito mínimo
- `paymentMethods` - Métodos de pagamento
- `isActive` - Status ativo
- `integrationType` - Tipo de integração
- `apiBaseUrl` - URL da API
- `apiKey` - Chave da API
- `syncInterval` - Intervalo de sincronização

#### **affiliateLinks** (Links de Afiliação)
- `id` - Chave primária
- `userId` - FK para users
- `houseId` - FK para bettingHouses
- `generatedUrl` - URL gerada
- `isActive` - Status ativo
- `createdAt` - Data de criação

#### **conversions** (Conversões)
- `id` - Chave primária
- `userId` - FK para users
- `houseId` - FK para bettingHouses
- `affiliateLinkId` - FK para affiliateLinks
- `type` - Tipo (click/registration/deposit/profit)
- `amount` - Valor da transação
- `commission` - Comissão gerada
- `customerId` - ID do cliente na casa
- `convertedAt` - Data da conversão
- `conversionData` - Dados adicionais JSON

#### **clickTracking** (Rastreamento de Cliques)
- `id` - Chave primária
- `linkId` - FK para affiliateLinks
- `userId` - FK para users
- `houseId` - FK para bettingHouses
- `ipAddress` - IP do clique
- `userAgent` - User agent
- `clickedAt` - Data do clique

#### **payments** (Pagamentos)
- `id` - Chave primária
- `userId` - FK para users
- `amount` - Valor do pagamento
- `method` - Método (PIX/TED)
- `pixKey` - Chave PIX utilizada
- `status` - Status (pending/completed/failed)
- `transactionId` - ID da transação
- `createdAt` - Data da solicitação
- `paidAt` - Data do pagamento

#### **registeredPostbacks** (Postbacks Registrados)
- `id` - Chave primária
- `name` - Nome do postback
- `url` - URL do postback
- `houseId` - FK para bettingHouses
- `eventType` - Tipo do evento
- `description` - Descrição
- `isActive` - Status ativo

---

## 🎨 COMPONENTES E LAYOUTS

### 32. **Layout Principal** - `client/src/components/StandardLayout.tsx`
**Função:** Layout padrão para páginas internas
**Funcionalidades:**
- Sidebar responsiva (admin/affiliate)
- Header com informações do usuário
- Área de conteúdo dinâmica
- Navigation breadcrumbs
- Logout functionality

### 33. **Sidebar Admin** - `client/src/components/admin/sidebar.tsx`
**Função:** Menu lateral administrativo
**Itens do Menu:**
- Dashboard (`/admin`)
- Casas de Apostas (`/admin/houses`)
- Gerenciar Afiliados (`/admin/manage`)
- Gerador de Postbacks (`/admin/postback-generator`)
- Logs de Postbacks (`/admin/postback-logs`)
- Configurações (`/admin/settings`)

### 34. **Sidebar Afiliado** - `client/src/components/affiliate-sidebar.tsx`
**Função:** Menu lateral do afiliado
**Itens do Menu:**
- Dashboard (`/home`)
- Casas de Apostas (`/betting-houses`)
- Meus Links (`/my-links`)
- Relatórios (`/reports`)
- Pagamentos (`/payments`)
- Perfil (`/profile`)

### 35. **Bottom Navigation** - `client/src/components/bottom-navigation.tsx`
**Função:** Navegação inferior para mobile
**Funcionalidades:**
- Ícones para principais seções
- Indicador de página ativa
- Design responsivo
- Touch-friendly

---

## 🔧 SERVIÇOS E INTEGRAÇÕES

### 36. **Commission Calculator** - `server/services/commissionCalculator.ts`
**Função:** Cálculo de comissões baseado no tipo
**Tipos Suportados:**
- **CPA:** Valor fixo por conversão qualificada
- **RevShare:** Percentual do lucro/receita
- **Hybrid:** Combinação de CPA + RevShare

### 37. **API Integration Service** - `server/services/apiIntegrationService.ts`
**Função:** Integração com APIs externas das casas
**Funcionalidades:**
- Teste de conectividade
- Sincronização de dados
- Autenticação automática
- Retry policies
- Error handling

### 38. **Smartico Fetcher** - `server/services/smarticoFetcher.ts`
**Função:** Integração específica com Smartico
**Funcionalidades:**
- Fetch de conversões
- Mapeamento de dados
- Sincronização automática
- Validação de dados

### 39. **Postback Handler** - `server/postback-simple.ts`
**Função:** Processamento de postbacks recebidos
**Processo:**
1. Validação de token de segurança
2. Identificação do afiliado por subid
3. Cálculo de comissão baseado no evento
4. Registro da conversão no banco
5. Resposta padronizada (status: ok/error)

### 40. **Database Fallback** - `server/db-fallback.ts`
**Função:** Sistema de fallback quando banco está indisponível
**Funcionalidades:**
- Dados temporários em memória
- Sincronização quando banco volta
- Usuários e casas de emergência

---

## 📱 RESPONSIVIDADE E UX

### 41. **Design System**
**Framework:** Tailwind CSS + Shadcn/UI
**Tema:** Dark mode com palette azul/slate
**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px  
- Desktop: > 1024px

### 42. **Componentes UI Utilizados**
- **Cards:** Containers para estatísticas e informações
- **Tables:** Listagens de dados com paginação
- **Forms:** Formulários com validação
- **Modals:** Dialogs para ações importantes
- **Charts:** Gráficos para analytics (Recharts)
- **Badges:** Indicadores de status
- **Buttons:** Ações primárias e secundárias

---

## 🔒 SEGURANÇA E AUTENTICAÇÃO

### 43. **Sistema de Autenticação**
**Método:** Session-based com Passport.js
**Estratégia:** Local Strategy (email/password)
**Middleware:**
- `requireAuth` - Verificar autenticação
- `requireAdmin` - Verificar role admin
- `requireAffiliate` - Verificar role affiliate

### 44. **Validações de Segurança**
- Hash de senhas com bcrypt
- Validação de CPF único
- Rate limiting em endpoints críticos
- Sanitização de inputs
- CORS configurado
- Headers de segurança

---

## 📊 ANALYTICS E MÉTRICAS

### 45. **Métricas Rastreadas**
- **Cliques:** Todos os cliques em links de afiliação
- **Registros:** Novos usuários nas casas
- **Depósitos:** Primeiro e subsequentes depósitos
- **Lucro:** Profit/loss das casas
- **Comissões:** Valores pagos aos afiliados

### 46. **Cálculos Automáticos**
- Taxa de conversão (registros/cliques)
- Ticket médio de depósito
- LTV (Lifetime Value) estimado
- ROI por afiliado
- Performance comparativa

---

## 🚀 DEPLOY E PRODUÇÃO

### 47. **Configuração de Deploy**
**Scripts disponíveis:**
- `npm run build` - Build de produção
- `npm run dev` - Desenvolvimento
- `npm run db:push` - Aplicar schema no banco
- `npm start` - Iniciar servidor de produção

### 48. **Variáveis de Ambiente**
- `NODE_ENV` - Ambiente (development/production)
- `DATABASE_URL` - Conexão PostgreSQL
- `SESSION_SECRET` - Chave secreta das sessões
- `PORT` - Porta do servidor (padrão 3000)

---

## 📋 RESUMO TÉCNICO

**Total de Rotas Frontend:** 20+ páginas
**Total de Endpoints API:** 40+ endpoints
**Banco de Dados:** 8 tabelas principais
**Arquitetura:** Frontend React + Backend Node.js + PostgreSQL
**Autenticação:** Session-based com roles
**Deploy:** Replit, VPS ou Docker
**Performance:** Otimizado para até 10k usuários simultâneos

**Funcionalidades Principais:**
✅ Sistema completo de afiliação
✅ Múltiplos tipos de comissão
✅ Tracking avançado de conversões
✅ Painel administrativo completo
✅ Sistema de pagamentos
✅ Integrações via postback e API
✅ Analytics e relatórios detalhados
✅ Design responsivo moderno
