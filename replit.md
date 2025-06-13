# AfiliadosBet - Affiliate Marketing Platform

## Overview

AfiliadosBet is a comprehensive affiliate marketing platform designed specifically for betting houses (casas de apostas) in the Brazilian market. The system operates as a **data receiver**, where betting houses send conversion data through webhooks/postbacks and API integrations, which are then processed to calculate and credit affiliate commissions automatically.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom UI components from shadcn/ui
- **Routing**: React Router for SPA navigation
- **State Management**: React hooks and context for local state
- **Data Fetching**: Fetch API with custom hooks for server communication
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple
- **API Design**: RESTful endpoints with webhook receivers

### Deployment Strategy
- **Development**: Replit environment with hot reloading
- **Production**: Containerized deployment with Docker
- **Database**: PostgreSQL 15+ required
- **Process Management**: PM2 for production deployments
- **Reverse Proxy**: Nginx configuration included

## Key Components

### User Management
- **Dual Role System**: Affiliates and Administrators
- **Authentication**: Email/password with bcrypt hashing
- **Profile Management**: Complete user profiles with PIX key integration
- **Session Management**: Secure session handling with automatic expiration

### Betting House Integration
- **Postback Processing**: Real-time webhook receivers for conversion events
- **API Integration**: Pull-based data fetching from betting house APIs
- **Commission Calculation**: Automated CPA and RevShare commission processing
- **Security Tokens**: Unique tokens for each betting house integration

### Commission System
- **CPA (Cost Per Acquisition)**: Fixed amount per qualified deposit
- **RevShare (Revenue Share)**: Percentage of betting house revenue
- **Hybrid Model**: Support for both CPA and RevShare simultaneously
- **Master/Affiliate Split**: Configurable percentage splits between platform and affiliates

### Data Processing
- **Webhook Endpoints**: Multiple endpoints for different event types (clicks, registrations, deposits, revenue)
- **Commission Calculator**: Automated calculation engine with fallback logic
- **Data Validation**: Input validation and error handling for all incoming data
- **Logging System**: Comprehensive logging for all postback events and API calls

## Data Flow

### Inbound Data Flow
1. **Betting Houses** → Send postback/webhook data → **AfiliadosBet Receivers**
2. **Receivers** → Validate and process data → **Commission Calculator**
3. **Calculator** → Apply business rules → **Database Storage**
4. **Database** → Update affiliate balances → **Real-time Dashboard Updates**

### API Integration Flow
1. **Scheduled Jobs** → Fetch data from betting house APIs → **Data Processor**
2. **Processor** → Transform and validate data → **Commission System**
3. **Commission System** → Calculate earnings → **Database Updates**

### User Interface Flow
1. **Affiliates** → Access dashboard → **View earnings and statistics**
2. **Administrators** → Manage betting houses → **Configure commission structures**
3. **Payment System** → Process withdrawal requests → **Update payment statuses**

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL 14+ (production), Neon serverless (development)
- **Node.js**: Version 20+ required for modern JavaScript features
- **React Ecosystem**: React 18, React Router, React Hook Form
- **UI Framework**: Radix UI primitives with Tailwind CSS styling

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Drizzle ORM**: Type-safe database operations with migration support
- **Vite**: Fast development server and build optimization
- **ESBuild**: Fast TypeScript compilation for production builds

### Authentication & Security
- **Passport.js**: Authentication middleware with local strategy
- **bcrypt**: Password hashing and verification
- **express-session**: Session management with PostgreSQL storage
- **CORS**: Cross-origin resource sharing configuration

### Monitoring & Logging
- **Custom Logging**: Comprehensive request/response logging
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Webhook Logging**: Detailed logging of all postback events for debugging

## Deployment Strategy

### Development Environment
- Replit-based development with hot reloading
- Environment variables managed through .env files
- Automatic database provisioning and migration

### Production Deployment
- Docker containerization with multi-stage builds
- PostgreSQL database with connection pooling
- Nginx reverse proxy for load balancing and SSL termination
- PM2 process management for zero-downtime deployments

### Scalability Considerations
- Database connection pooling for high concurrency
- Horizontal scaling support through containerization
- CDN integration for static asset delivery
- Caching strategies for frequently accessed data

## Changelog
- June 13, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.