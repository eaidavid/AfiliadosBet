#!/bin/bash

# Script para corrigir erro de sessão PostgreSQL em produção
# Erro: SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

set -e

echo "🔧 Iniciando correção do erro de sessão PostgreSQL..."

# Verificar se estamos no diretório correto
if [[ ! -f "server/index.ts" ]]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto (/var/www/afiliadosbet)"
    exit 1
fi

# Parar aplicação
echo "⏹️  Parando aplicação..."
pm2 stop afiliadosbet || true

# Fazer backup do arquivo atual
echo "💾 Fazendo backup do arquivo atual..."
cp server/index.ts server/index.ts.backup.$(date +%Y%m%d_%H%M%S)

# Aplicar correção
echo "🔄 Aplicando correção de sessão..."
cat > server/index.ts << 'EOF'
import express from "express";
import { setupVite, serveStatic } from "./vite";
import { registerRoutes } from "./routes";
import { db } from "./db";
import { eq, sql, desc } from "drizzle-orm";
import * as schema from "../shared/schema";
import session from "express-session";
import passport from "passport";

const app = express();

// Session configuration with memory store (simpler for this project)
import MemoryStore from 'memorystore';
const memoryStore = MemoryStore(session);

app.use(session({
  store: new memoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
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

  // Initialize database schema
  try {
    const { initializeDatabase } = await import('./init-database');
    await initializeDatabase();
  } catch (error) {
    console.warn("Database initialization skipped:", error instanceof Error ? error.message : 'Unknown error');
  }

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

  const PORT = parseInt(process.env.PORT || "3000", 10);
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

    // Setup Vite development environment after server starts
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
      console.log("✅ Vite dev server configured");
    } else {
      serveStatic(app);
      console.log("✅ Static files configured");
    }
  });
})();
EOF

# Fazer rebuild da aplicação
echo "🔨 Fazendo rebuild da aplicação..."
npm run build

# Reiniciar aplicação
echo "🚀 Reiniciando aplicação..."
pm2 restart afiliadosbet

# Aguardar um pouco para a aplicação iniciar
echo "⏳ Aguardando aplicação iniciar..."
sleep 5

# Verificar status
echo "📊 Verificando status da aplicação..."
pm2 status afiliadosbet

echo ""
echo "✅ Correção aplicada com sucesso!"
echo ""
echo "🔍 Para verificar se está funcionando:"
echo "   pm2 logs afiliadosbet"
echo ""
echo "🧪 Para testar login:"
echo "   curl -X POST https://seudominio.com/api/auth/login \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"email\":\"admin@afiliadosbet.com.br\",\"password\":\"admin123\"}'"
echo ""
echo "📋 Logs em tempo real:"
echo "   pm2 logs afiliadosbet --lines 50"
EOF

chmod +x fix-session-production.sh