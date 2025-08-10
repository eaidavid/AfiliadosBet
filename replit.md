# AfiliadosBet - Sistema de Marketing de Afiliados

## Overview

AfiliadosBet is a comprehensive affiliate marketing platform for sports betting houses. The system enables affiliates to promote various betting houses and earn commissions based on conversions, supporting multiple commission models (CPA, RevShare, and Hybrid). The business vision is to provide a complete, scalable, and high-performance solution that caters to the growing demand in the sports betting affiliate market, offering advanced tracking, robust payment systems, and flexible integration options to maximize earning potential for affiliates and optimize operations for betting houses.

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

**Refactoring Principles**:
- **Goal**: Refactor to a premium standard without duplications or inconsistencies.
- **Objectives**:
    1. **Technical Excellence**: Eliminate 100% duplications, standardize component architecture, centralize routing, clean and scalable code.
    2. **Premium Experience**: Modern UI (unicorn startup level), fluid and intuitive navigation, consistent design system, superior performance.
    3. **Maintainability**: Logical folder structure, reusable and documented components, easy future extension.
- **Mandatory Standards**:
    - **Code**: TypeScript strict, functional components, standardized naming.
    - **Design**: Tailwind + shadcn/ui, premium dark theme, glassmorphism, 60fps animations.
    - **UX**: Intuitive navigation, immediate visual feedback, elegant error handling.
    - **Performance**: Lazy loading, optimized bundle, optimized queries, intelligent cache.
- **Critical Cares**: Do not break authentication or business logic, preserve existing functionalities, test both admin and user panels.
- **Success Criteria**: Zero duplications, perfect navigation (including bottom menu), modern and responsive interface, optimized performance, competitive visual with market leaders.
- **Absolute Rule**: All implementations, suggestions, code, and decisions must strictly follow this premium standard.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for client-side navigation
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js 20 with TypeScript
- **Framework**: Express.js for REST API
- **Authentication**: Passport.js with local strategy + sessions
- **Session Storage**: PostgreSQL with connect-pg-simple
- **Database ORM**: Drizzle ORM with typed schema

### Database
- **Primary Database**: PostgreSQL
- **ORM**: Drizzle ORM with automatic migrations
- **Session Storage**: Dedicated table for session management

### Core System Features
- **Entities**: Users (affiliates/admins), Betting Houses, Affiliate Links, Conversions, Payments, Click Tracking.
- **Commission System**: CPA (Cost Per Action), RevShare, and Hybrid models with configurable split.
- **Integration Types**: Postback (webhooks), API, and Hybrid for conversion data.
- **Postback System**: URL pattern `/api/postback/:casa/:evento` supporting `register`, `deposit`, `profit`, `chargeback` events, with token-based security and automatic commission calculation.

### UI/UX Decisions
- **Color Scheme**: Professional dark theme with emerald/blue accents.
- **Design Approach**: Modern gradients, glassmorphism effects, advanced animations, premium visual effects, and micro-interactions.
- **Templates**: Focus on high-quality visual hierarchy and typography, with responsive design and smooth transitions.
- **Navigation**: Premium bottom navigation with glassmorphism effects and advanced animations across both admin and user routes.

### Deployment Strategy
- **Containerization**: Docker with Node.js 20 Alpine.
- **Database**: PostgreSQL 15+ with SSL.
- **Reverse Proxy**: Nginx for frontend serving and API proxy.
- **Process Manager**: PM2 for process management.
- **Environment Configuration**: `NODE_ENV`, `DATABASE_URL`, `SESSION_SECRET`, `PORT`.
- **Docker Compose**: Includes `app`, `postgres`, `nginx` services.
- **Deployment Options**: Manual VPS scripts, Docker Compose, Replit direct deploy.

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL driver (optimized).
- **drizzle-orm**: Typed ORM for TypeSQL.
- **express**: Web framework for Node.js.
- **passport**: Authentication middleware.
- **bcrypt**: Password hashing.
- **express-session**: Session management.
- **connect-pg-simple**: PostgreSQL session store.
- **pg**: Standard PostgreSQL driver.

### Frontend Dependencies
- **@tanstack/react-query**: Server state management.
- **@radix-ui**: Accessible UI components.
- **tailwindcss**: Utility-first CSS framework.
- **framer-motion**: React animations.
- **react-hook-form**: Form management.
- **shadcn/ui**: Component library built with Radix UI and Tailwind CSS.

### Development Tools
- **tsx**: TypeScript execution.
- **esbuild**: Bundler for server production.
- **vite**: Build tool and dev server.
- **drizzle-kit**: CLI for migrations.

## Recent Changes

### August 10, 2025 - Deploy Reliability and Manual Data Entry System
- **Fixed Application Port Configuration**: Corrected port configuration to use 5000 for development, ensuring workflow compatibility
- **Created Robust Deployment Scripts**: Added ecosystem.config.js for PM2 production deployment with auto-restart
- **Implemented Keep-Alive System**: Enhanced Replit keep-alive system with automatic health monitoring
- **Added Health Check Endpoint**: Created health-check.js for application monitoring and auto-restart capabilities
- **Production Deploy Script**: Complete deploy-production.sh with backup, rollback and monitoring features
- **Enhanced Startup Reliability**: Added startup.sh with process cleanup and dependency verification
- **Auto-Restart Mechanism**: Implemented automatic restart logic to maintain application uptime
- **Comprehensive Monitoring**: Added keep-alive.sh for continuous application monitoring and recovery
- **Graceful Shutdown Handling**: Enhanced process termination handling for better stability
- **Manual Data Entry System Documentation**: Created comprehensive system for manual data insertion when automatic integrations fail
- **Implementation Prompt**: Detailed technical prompt for implementing manual entry system with security, auditoria and user interface specifications

## User Preferences

**Communication Style**: Simple, everyday language.
**Technical Approach**: User prefers practical solutions with step-by-step guides for production deployment.
**Documentation**: User wants "pocket guides" for server maintenance and updates.

**Production Environment**: 
- Server: AlmaLinux VPS or Replit deployment
- Database: PostgreSQL (local or hosted)
- Process Manager: PM2 for production
- Web Server: Nginx for production
- Deployment: Manual updates with backup procedures

**Operational Needs**: User requires manual data entry capabilities for when automatic integrations (API/postback) fail, ensuring business continuity and administrative flexibility.