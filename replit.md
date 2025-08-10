# AfiliadosBet - Sistema de Marketing de Afiliados

## Overview

AfiliadosBet é uma plataforma completa de marketing de afiliados para casas de apostas esportivas. O sistema permite que afiliados promovam diferentes casas de apostas e recebam comissões baseadas em conversões, com suporte a múltiplos modelos de comissão (CPA, RevShare, e Hybrid).

## System Architecture

### Frontend Architecture
- **Framework**: React 18 com TypeScript
- **Styling**: Tailwind CSS com componentes shadcn/ui
- **State Management**: TanStack React Query para gerenciamento de estado servidor
- **Routing**: Wouter para navegação client-side
- **Build Tool**: Vite para desenvolvimento e build

### Backend Architecture
- **Runtime**: Node.js 20 com TypeScript
- **Framework**: Express.js para API REST
- **Authentication**: Passport.js com estratégia local + sessões
- **Session Storage**: PostgreSQL com connect-pg-simple
- **Database ORM**: Drizzle ORM com schema tipado

### Database Architecture
- **Primary Database**: PostgreSQL
- **ORM**: Drizzle ORM com migrations automáticas
- **Session Storage**: Tabela dedicada para gerenciamento de sessões

## Key Components

### Core Entities
1. **Users**: Afiliados e administradores com sistema de roles
2. **Betting Houses**: Casas de apostas com configurações específicas de comissão
3. **Affiliate Links**: Links únicos para tracking de conversões
4. **Conversions**: Registros de conversões (registro, depósito, etc.)
5. **Payments**: Sistema de pagamentos para afiliados
6. **Click Tracking**: Rastreamento detalhado de cliques

### Commission System
- **CPA (Cost Per Action)**: Comissão fixa por conversão qualificada
- **RevShare**: Porcentagem do revenue compartilhado
- **Hybrid**: Combinação de CPA + RevShare
- **Split Configuration**: Divisão configurável entre afiliado e master admin

### Integration Types
1. **Postback**: Webhooks enviados pelas casas de apostas
2. **API**: Integração via API para buscar dados de conversão
3. **Hybrid**: Combinação de postback + API

### Postback System
- **URL Pattern**: `/api/postback/:casa/:evento`
- **Event Types**: register, deposit, profit, chargeback
- **Security**: Token-based validation para cada casa
- **Commission Calculation**: Automático baseado nas regras da casa

## Data Flow

### User Registration Flow
1. Usuário se registra na plataforma
2. Sistema cria conta de afiliado
3. Afiliado pode gerar links de casas ativas
4. Tracking automático de cliques e conversões

### Conversion Tracking Flow
1. Casa de apostas envia postback para sistema
2. Sistema valida token de segurança
3. Identifica afiliado via subid
4. Calcula comissão baseada nas regras
5. Registra conversão na base de dados
6. Atualiza estatísticas do afiliado

### Payment Flow
1. Afiliado solicita pagamento via dashboard
2. Admin aprova/rejeita pedido
3. Sistema processa pagamento (PIX/Transferência)
4. Atualiza status e histórico

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Driver PostgreSQL otimizado
- **drizzle-orm**: ORM tipado para TypeSQL
- **express**: Framework web para Node.js
- **passport**: Middleware de autenticação
- **bcrypt**: Hash de senhas
- **express-session**: Gerenciamento de sessões

### Frontend Dependencies
- **@tanstack/react-query**: Gerenciamento de estado servidor
- **@radix-ui**: Componentes UI acessíveis
- **tailwindcss**: Framework CSS utility-first
- **framer-motion**: Animações React
- **react-hook-form**: Gerenciamento de formulários

### Development Tools
- **tsx**: TypeScript execution para desenvolvimento
- **esbuild**: Bundler para produção do servidor
- **vite**: Build tool e dev server
- **drizzle-kit**: CLI para migrations

## Deployment Strategy

### Production Environment
- **Container**: Docker com Node.js 20 Alpine
- **Database**: PostgreSQL 15+ com SSL
- **Reverse Proxy**: Nginx para servir frontend e proxy API
- **Process Manager**: PM2 para gerenciamento de processos

### Environment Configuration
- **NODE_ENV**: production/development
- **DATABASE_URL**: String de conexão PostgreSQL
- **SESSION_SECRET**: Chave secreta para sessões
- **PORT**: Porta do servidor (padrão 3000)

### Docker Composition
- **app**: Aplicação principal Node.js
- **postgres**: Banco PostgreSQL dedicado
- **nginx**: Proxy reverso e servidor web

### Deployment Options
1. **Manual VPS**: Scripts automatizados para Ubuntu/CentOS
2. **Docker Compose**: Stack completa containerizada
3. **Replit**: Deploy direto na plataforma Replit

## Recent Changes

### August 10, 2025 - Deploy Reliability and Always-Running Configuration
- **Fixed Application Port Configuration**: Corrected port configuration to use 5000 for development, ensuring workflow compatibility
- **Created Robust Deployment Scripts**: Added ecosystem.config.js for PM2 production deployment with auto-restart
- **Implemented Keep-Alive System**: Enhanced Replit keep-alive system with automatic health monitoring
- **Added Health Check Endpoint**: Created health-check.js for application monitoring and auto-restart capabilities
- **Production Deploy Script**: Complete deploy-production.sh with backup, rollback and monitoring features
- **Enhanced Startup Reliability**: Added startup.sh with process cleanup and dependency verification
- **Auto-Restart Mechanism**: Implemented automatic restart logic to maintain application uptime
- **Comprehensive Monitoring**: Added keep-alive.sh for continuous application monitoring and recovery
- **Graceful Shutdown Handling**: Enhanced process termination handling for better stability

### July 26, 2025 - Database Connection Fix and Premium UI Upgrade
- **Fixed Critical Database Connection Issue**: Switched from Neon serverless WebSocket driver to standard PostgreSQL driver (pg) to resolve connection failures
- **Database Configuration Fix**: Updated database connection to use proper SSL configuration and connection pooling
- **Betting Houses Crash Fix**: Fixed orderSelectedFields error by adding proper data initialization and error handling
- **Premium Bottom Navigation 2026**: Implemented ultra-premium bottom navigation with glassmorphism effects, premium gradients, and advanced animations
- **Removed Top Menu from Betting Houses**: Eliminated PremiumMenuBar from betting houses page as requested
- **Universal Premium Navigation**: Applied new premium navigation system to both admin and user routes
- **Enhanced Error Handling**: Added proper initial data handling to prevent crashes when stats are undefined
- **Port Configuration Update**: Changed development port from 5000 to 5001 to resolve port conflicts

### July 10, 2025 - Production Login System and Deployment Fixes
- **Fixed PostgreSQL Session Configuration**: Resolved SASL authentication errors in production with proper Pool configuration
- **Enhanced Login Flow**: Improved frontend login with direct fetch calls and credentials handling
- **Production Deployment Guide**: Created comprehensive deployment guides for AlmaLinux with PostgreSQL
- **Quick Update Guide**: Added GUIA_ATUALIZACAO_PRODUCAO.md for easy server maintenance
- **Session Management**: Fixed session persistence issues with proper PostgreSQL session store
- **Frontend-Backend Integration**: Resolved "Cannot GET /" errors by fixing Vite middleware initialization order
- **Authentication Debug**: Added comprehensive debugging tools and error handling for production environment
- **Automated Scripts**: Created fix-postgresql-production.sh and fix-session-production.sh for one-click server updates
- **Loop Fix**: Resolved infinite redirect loops by eliminating conflicting useEffect redirects and improving session sync
- **Production Git Workflow**: Created INSTRUCOES_LOGIN_PRODUCAO.md to handle git conflicts and permission issues on VPS
- **Complete VPS Guide**: Step-by-step solution for git stash, permissions, and manual fallback procedures
- **Loop Fix**: Resolved infinite redirect loops by eliminating conflicting useEffect redirects and improving session sync
- **Production Session Configuration**: Fixed session cookie persistence issues by disabling secure flag and forcing session save after login
- **Session Debug Enhancement**: Added comprehensive session logging to identify cookie persistence problems
- **PostgreSQL Production Fix**: Created comprehensive PostgreSQL diagnostic and repair script for VPS deployment issues
- **Emergency Recovery**: Added CORRECAO_FORCADA_VPS.md with manual PostgreSQL recovery procedures
- **Critical Production Fix**: Identified application running SQLite in production instead of PostgreSQL
- **Complete Database Migration**: Created comprehensive script to migrate from SQLite to PostgreSQL in production
- **Schema Synchronization**: Unified database schema between development and production environments

### June 30, 2025 - Complete Project Optimization and Universal Compatibility
- **Universal Environment Compatibility**: Removed all Replit-specific dependencies and made system work in any environment (VPS, local, Docker)
- **Clean Project Structure**: Moved all deployment files to archived_files, keeping only essential files in root directory
- **Enhanced Session Management**: Implemented PostgreSQL session store for production with fallback to memory store in development
- **Universal Host Binding**: Configured server to bind to 0.0.0.0 with configurable HOST environment variable
- **Docker Support**: Added comprehensive Dockerfile and .dockerignore for containerized deployment
- **Environment Configuration**: Created .env.example template with all necessary environment variables
- **Health Check Endpoint**: Added /api/health endpoint for monitoring and load balancer health checks
- **Fixed Import Dependencies**: Resolved all broken imports and missing modules that caused server errors
- **Production-Ready Session Security**: Configured secure cookies and HTTPS-only mode for production
- **Comprehensive Documentation**: Created detailed README.md with installation, deployment, and troubleshooting guides
- **Database Error Handling**: Fixed "Internal Server Error" on login by implementing proper database connection error handling with user-friendly Portuguese messages

### June 14, 2025 - Application Startup and UI Fixes
- **Fixed Application Startup Issues**: Resolved API scheduler initialization problems causing app crashes
- **Improved Error Handling**: Added proper error handling for cron tasks and database connections
- **Fixed CSS Border Issues**: Removed global border rules causing unwanted borders throughout the interface
- **Enhanced Startup Sequence**: Added delayed scheduler initialization to prevent startup conflicts
- **Port Conflict Resolution**: Fixed EADDRINUSE errors by properly managing running processes

### June 14, 2025 - Complete VPS Deployment System
- **Independent VPS Deployment**: Created comprehensive deployment system for production VPS (69.62.65.24)
- **Automated Installation Scripts**: Built three deployment options - quick install, full install, and manual step-by-step
- **Production Configuration**: Complete Nginx, PostgreSQL, PM2, SSL/HTTPS setup with domain afiliadosbet.com.br
- **Update System**: Automated git-based update system with backup capabilities
- **Beginner-Friendly Guides**: Created simple tutorials for non-technical users
- **Build Optimization**: Resolved Vite build performance issues with optimized scripts

### Current Project State
- **Universal Deployment Ready**: System can now be deployed on any environment without Replit dependencies
- **Clean Architecture**: Organized project structure with essential files only in root directory
- **Production-Grade Configuration**: Enhanced security, session management, and error handling
- **Comprehensive Documentation**: Complete setup and deployment guides for any environment
- **Docker Support**: Full containerization support for modern deployment workflows
- **Zero Configuration Startup**: Simple npm install && npm run dev for immediate development
- **Premium Authentication**: New /auth page with world-class design and animations
- **AlmaLinux Deployment Guide**: Complete documentation for production deployment

## Changelog
- June 13, 2025. Initial setup
- June 14, 2025. Project cleanup and UI standardization

## User Preferences

**Communication Style**: Simple, everyday language.
**Technical Approach**: User prefers practical solutions with step-by-step guides for production deployment.
**Documentation**: User wants "pocket guides" for server maintenance and updates.

**UI/UX Design Preference**: User loves the premium design from /auth page and wants this design standard applied throughout the entire system. Focus on:
- Modern gradients and animations
- Professional dark theme with emerald/blue accents
- Premium visual effects and micro-interactions
- Money/earnings themed elements and animations
- Responsive design with smooth transitions
- High-quality visual hierarchy and typography

**Production Environment**: 
- Server: AlmaLinux VPS
- Database: PostgreSQL (afiliadosbetdb)
- Process Manager: PM2
- Web Server: Nginx
- Deployment: Manual updates with backup procedures

## 🛠️ PADRÃO PREMIUM DE REFATORAÇÃO (Jul 27, 2025)

**CONTEXTO**: Sistema AfiliadosBet sendo refatorado para padrão premium sem duplicações ou inconsistências.

### 🚨 PROBLEMAS IDENTIFICADOS
- Menu inferior duplicado e inconsistente
- Roteamento caótico e fragmentado
- Componentes desorganizados e duplicados
- Layouts e navegação quebrados (inclusive no mobile)

### 🎯 OBJETIVOS OBRIGATÓRIOS
1. **EXCELÊNCIA TÉCNICA**
   - Eliminar 100% das duplicações
   - Padronizar arquitetura de componentes
   - Roteamento centralizado e limpo
   - Código limpo, organizado e escalável

2. **EXPERIÊNCIA PREMIUM**
   - Interface moderna, nível startup unicórnio
   - Navegação fluida, responsiva e intuitiva
   - Design system visualmente consistente
   - Desempenho superior

3. **MANUTENIBILIDADE**
   - Estrutura de pastas lógica
   - Componentes reutilizáveis e documentados
   - Fácil extensão futura

### 🎨 PADRÕES OBRIGATÓRIOS
- **CÓDIGO**: TypeScript strict, componentes funcionais, nomenclatura padronizada
- **DESIGN**: Tailwind + shadcn/ui, tema escuro premium, glassmorphism, animações 60fps
- **UX**: Navegação intuitiva, feedback visual imediato, tratamento de erros elegante
- **PERFORMANCE**: Lazy loading, bundle otimizado, queries otimizadas, cache inteligente

### 🚀 METODOLOGIA
1. **ANÁLISE**: Mapear componentes e dependências
2. **PLANEJAMENTO**: Definir arquitetura limpa
3. **EXECUÇÃO**: Refatorar incrementalmente sem quebrar sistema
4. **VALIDAÇÃO**: Testar cada modificação

### ⚠️ CUIDADOS CRÍTICOS
- Não quebrar autenticação nem lógica de negócio
- Preservar funcionalidades existentes
- Testar ambos painéis (admin e usuário)

### ✅ CRITÉRIOS DE SUCESSO
- Zero duplicações
- Navegação perfeita (inclusive menu inferior)
- Interface moderna e responsiva
- Desempenho otimizado
- Visual competitivo com os melhores do mercado

**💬 REGRA ABSOLUTA: Todas implementações, sugestões, códigos e decisões devem seguir rigorosamente este padrão premium.**