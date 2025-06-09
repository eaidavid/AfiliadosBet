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
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false, // Permitir cookies em desenvolvimento
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    
    // Inicializar agendador de sincronização API
    try {
      const { ApiSyncScheduler } = await import('./cron/apiSyncScheduler');
      const scheduler = ApiSyncScheduler.getInstance();
      await scheduler.initializeScheduler();
    } catch (error) {
      console.error("Erro ao inicializar agendador de API:", error);
    }
  });

  // Setup Vite development environment
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
})();