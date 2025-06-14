import express from "express";
import { setupVite, serveStatic } from "./vite";
import { registerRoutes } from "./routes";
import { db } from "./db";
import { eq, sql, desc } from "drizzle-orm";
import * as schema from "../shared/schema";
import session from "express-session";
import passport from "passport";

const app = express();

// Setup sessões simples em memória
app.use(session({
  secret: process.env.SESSION_SECRET || "fallback-secret-for-dev",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Permitir cookies em desenvolvimento
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
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

  // Registrar todas as rotas da API
  await registerRoutes(app);

  const PORT = parseInt(process.env.PORT || "5000", 10);
  const server = app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server listening on port ${PORT}`);
    console.log("Application ready to receive requests");
    
    // Inicializar agendador de sincronização API com delay
    setTimeout(async () => {
      try {
        const { ApiSyncScheduler } = await import('./cron/apiSyncScheduler');
        const scheduler = ApiSyncScheduler.getInstance();
        await scheduler.initializeScheduler();
      } catch (error) {
        console.error("Erro ao inicializar agendador de API:", error);
      }
    }, 5000); // Delay de 5 segundos para permitir que o servidor inicie completamente
  });

  // Setup Vite development environment
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
})();