import express from "express";
import { setupVite, serveStatic } from "./vite";
import { registerRoutes } from "./routes";
import { db } from "./db";
import { eq, sql, desc } from "drizzle-orm";
import * as schema from "../shared/schema";
import session from "express-session";
import passport from "passport";

const app = express();

// Session configuration with PostgreSQL store in production
import connectPgSimple from 'connect-pg-simple';
const PgSession = connectPgSimple(session);

app.use(session({
  store: process.env.NODE_ENV === 'production' 
    ? new PgSession({
        pool: require('./db').pool,
        tableName: 'sessions',
        createTableIfMissing: true
      })
    : undefined, // Use memory store in development
  secret: process.env.SESSION_SECRET || "fallback-secret-for-dev-only-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
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

// Configurar Passport
app.use(passport.initialize());
app.use(passport.session());

// Todas as rotas são registradas através do registerRoutes em routes.ts

(async () => {
  console.log("starting up user application");

  // Health check endpoint for monitoring
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV || 'development'
    });
  });

  // Registrar todas as rotas da API
  await registerRoutes(app);

  const PORT = parseInt(process.env.PORT || "5000", 10);
  const HOST = process.env.HOST || "0.0.0.0"; // Universal host binding
  
  const server = app.listen(PORT, HOST, async () => {
    console.log(`Server listening on port ${PORT}`);
    console.log("Application ready to receive requests");
    
    // Initialize API scheduler only in production with proper error handling
    if (process.env.NODE_ENV === 'production') {
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
      }, 10000); // Longer delay for production stability
    } else {
      console.log("📋 API scheduler disabled in development mode");
    }
  });

  // Setup Vite development environment
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
})();