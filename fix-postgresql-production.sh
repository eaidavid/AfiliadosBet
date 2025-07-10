#!/bin/bash

# Script para corrigir configuração PostgreSQL em produção
# Usando as credenciais corretas: afiliadosbet:Alepoker800@localhost:5432/afiliadosbetdb

set -e

echo "🔧 Corrigindo configuração PostgreSQL para produção..."

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

# Atualizar arquivo .env se necessário
echo "🔧 Atualizando arquivo .env..."
if ! grep -q "DATABASE_URL=postgresql://afiliadosbet:Alepoker800@localhost:5432/afiliadosbetdb" .env; then
    sed -i 's|DATABASE_URL=.*|DATABASE_URL=postgresql://afiliadosbet:Alepoker800@localhost:5432/afiliadosbetdb|' .env
    echo "✅ DATABASE_URL atualizada no .env"
fi

# Aplicar correção no server/index.ts
echo "🔄 Aplicando correção PostgreSQL..."
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

# Verificar se o PostgreSQL está rodando
echo "🔍 Verificando PostgreSQL..."
if ! systemctl is-active --quiet postgresql-15; then
    echo "⚠️  PostgreSQL não está rodando, iniciando..."
    systemctl start postgresql-15
fi

# Testar conexão com o banco
echo "🧪 Testando conexão com banco..."
if ! psql -U afiliadosbet -h localhost -d afiliadosbetdb -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Erro: Não foi possível conectar ao banco PostgreSQL"
    echo "Verifique se o banco afiliadosbetdb existe e se as credenciais estão corretas"
    exit 1
fi

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
echo "✅ Correção PostgreSQL aplicada com sucesso!"
echo ""
echo "🔧 Configuração aplicada:"
echo "   - Banco: afiliadosbetdb"
echo "   - Usuário: afiliadosbet"
echo "   - Senha: Alepoker800"
echo "   - Host: localhost:5432"
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