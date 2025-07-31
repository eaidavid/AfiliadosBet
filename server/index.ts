import express from "express";
import { setupVite, serveStatic } from "./vite";
import { registerRoutes } from "./routes";
import { db } from "./db";
import { eq, sql, desc } from "drizzle-orm";
import * as schema from "../shared/schema";
import session from "express-session";
import passport from "passport";
import { setupGracefulShutdown } from "./startup-optimizer";
import { compressionMiddleware, securityHeaders, performanceMonitoring, realtimeHealthMonitor } from "./middleware/premium-middleware";
import { setupHealthEndpoints } from "./health-monitor";
import { setupKeepAlive } from "./replit-optimizer";

const app = express();

// Premium middleware stack
app.use(compressionMiddleware());
app.use(securityHeaders());
app.use(performanceMonitoring());
app.use(realtimeHealthMonitor());

// Session configuration with PostgreSQL store in production
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';

const PgSession = connectPgSimple(session);

// Create PostgreSQL pool for sessions
const sessionPool = process.env.NODE_ENV === 'production' && process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: false // Set to true if using SSL
    })
  : null;

app.use(session({
  store: sessionPool 
    ? new PgSession({
        pool: sessionPool,
        tableName: 'sessions',
        createTableIfMissing: true
      })
    : undefined, // Use memory store in development
  secret: process.env.SESSION_SECRET || "fallback-secret-for-dev-only-change-in-production",
  resave: false,
  saveUninitialized: false,
  name: 'afiliadosbet.sid', // Custom session name
  cookie: {
    httpOnly: true,
    secure: false, // DISABLED - VPS doesn't have proper HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// JSON parsing middleware with error handling
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server error:', err);
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  res.status(500).json({ error: 'Internal server error' });
});

// Global error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Configurar Passport
app.use(passport.initialize());
app.use(passport.session());

// Todas as rotas são registradas através do registerRoutes em routes.ts

(async () => {
  console.log("starting up user application");

  // Initialize database schema
  try {
    const { initializeDatabase } = await import('./init-database');
    await initializeDatabase();
  } catch (error) {
    console.warn("Database initialization skipped:", error instanceof Error ? error.message : 'Unknown error');
  }

  // Setup premium health monitoring
  setupHealthEndpoints(app);

  // Registrar todas as rotas da API
  await registerRoutes(app);

  // Simplified and robust development setup
  if (process.env.NODE_ENV === "development") {
    const PORT = parseInt(process.env.PORT || "5000", 10);
    const HOST = process.env.HOST || "0.0.0.0";
    
    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Premium server listening on port ${PORT}`);
      console.log("Application ready to receive requests");
      console.log("📋 API scheduler disabled in development mode");
      
      // Setup keep-alive for Replit
      setupKeepAlive(PORT);
      console.log("✅ Replit keep-alive system activated");
    });
    
    // Enhanced error handling
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.log("💡 Try: pkill -f tsx && npm run dev");
        process.exit(1);
      } else {
        console.error('Server error:', error);
      }
    });
    
    // Setup graceful shutdown
    setupGracefulShutdown(server);
    
    // Vite setup with robust error handling
    try {
      await setupVite(app, server);
      console.log("✅ Vite dev server configured with premium optimizations");
    } catch (error) {
      console.error('Vite setup error:', error);
      console.log("⚠️ Continuing without Vite hot reload");
    }
    
  } else {
    // Production setup
    const PORT = parseInt(process.env.PORT || "3000", 10);
    const HOST = process.env.HOST || "0.0.0.0";
    
    serveStatic(app);
    console.log("✅ Static files configured with premium caching");
    
    const server = app.listen(PORT, HOST, async () => {
      console.log(`🚀 Production server listening on port ${PORT}`);
      console.log("Application ready to receive requests");
      
      // Setup production enhancements
      setupGracefulShutdown(server);
      setupKeepAlive(PORT);
      
      // Initialize API scheduler
      setTimeout(async () => {
        try {
          const { ApiSyncScheduler } = await import('./cron/apiSyncScheduler');
          const scheduler = ApiSyncScheduler.getInstance();
          await scheduler.initializeScheduler();
          console.log("✅ API scheduler initialized successfully");
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn("⚠️ API scheduler initialization failed (non-critical):", errorMessage);
        }
      }, 10000);
    });
    
    // Production error handling
    server.on('error', (error: any) => {
      console.error('💥 Production server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use in production`);
        process.exit(1);
      }
    });
  }
})();