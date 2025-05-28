import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

const app = express();

// MIDDLEWARE ESPECIAL PARA POSTBACKS - intercepta antes de qualquer middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/postback/')) {
    return handlePostback(req, res);
  }
  next();
});

// Rota adicional com prefixo /api para evitar interceptação do Vite
app.get("/api/postback-handler/:casa/:evento/:token", async (req, res) => {
  return handlePostback(req, res);
});

async function handlePostback(req: any, res: any) {
  try {
    const pathParts = req.path.split('/');
    if (pathParts.length !== 5) {
      return res.status(400).json({ error: "Formato inválido de URL" });
    }
    
    const [, , casa, evento, token] = pathParts;
    const { subid, amount, customer_id } = req.query;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    console.log(`📩 Postback recebido: casa=${casa}, evento=${evento}, token=${token}, subid=${subid}`);
    
    // Verificar se a casa existe pelo identificador
    const house = await db.select()
      .from(schema.bettingHouses)
      .where(eq(schema.bettingHouses.identifier, casa))
      .limit(1);
    
    if (house.length === 0) {
      console.log(`❌ Casa não encontrada: ${casa}`);
      return res.status(404).json({ error: "Casa de apostas não encontrada" });
    }
    
    // Verificar token de segurança
    if (house[0].securityToken !== token) {
      console.log(`❌ Token inválido: esperado ${house[0].securityToken}, recebido ${token}`);
      return res.status(401).json({ error: "Token de segurança inválido" });
    }
    
    // Buscar afiliado pelo subid
    const affiliate = await db.select()
      .from(schema.users)
      .where(eq(schema.users.username, subid as string))
      .limit(1);
    
    if (affiliate.length === 0) {
      console.log(`❌ Afiliado não encontrado: ${subid}`);
      return res.status(404).json({ error: "Afiliado não encontrado" });
    }
    
    // Calcular comissão baseada no tipo da casa
    let commissionValue = 0;
    let tipo = 'CPA';
    
    if (house[0].commissionType === 'CPA') {
      commissionValue = parseFloat(house[0].commissionValue);
      tipo = 'CPA';
    } else if (house[0].commissionType === 'RevShare' && amount) {
      const percentage = parseFloat(house[0].commissionValue) / 100;
      commissionValue = parseFloat(amount as string) * percentage;
      tipo = 'RevShare';
    }
    
    console.log(`✅ Postback processado com sucesso - Casa: ${house[0].name}, Evento: ${evento}, Afiliado: ${affiliate[0].username}, Comissão: R$ ${commissionValue}`);
    
    res.json({ 
      success: true, 
      message: "Postback processado com sucesso",
      commission: commissionValue,
      type: tipo,
      affiliate: affiliate[0].username,
      house: house[0].name,
      event: evento,
      processed_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Erro no processamento do postback:", error);
    res.status(500).json({ error: "Erro interno no processamento", status: "ERROR" });
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
  try {
    const { casa, evento, token } = req.params;
    const { subid, amount, customer_id } = req.query;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    console.log(`📩 Postback recebido: casa=${casa}, evento=${evento}, token=${token}, subid=${subid}`);
    
    // Verificar se a casa existe pelo identificador
    const house = await db.select()
      .from(schema.bettingHouses)
      .where(eq(schema.bettingHouses.identifier, casa))
      .limit(1);
    
    if (house.length === 0) {
      console.log(`❌ Casa não encontrada: ${casa}`);
      return res.status(404).json({ error: "Casa de apostas não encontrada" });
    }
    
    // Verificar token de segurança
    if (house[0].securityToken !== token) {
      console.log(`❌ Token inválido: esperado ${house[0].securityToken}, recebido ${token}`);
      return res.status(401).json({ error: "Token de segurança inválido" });
    }
    
    // Buscar afiliado pelo subid
    const affiliate = await db.select()
      .from(schema.users)
      .where(eq(schema.users.username, subid as string))
      .limit(1);
    
    if (affiliate.length === 0) {
      console.log(`❌ Afiliado não encontrado: ${subid}`);
      return res.status(404).json({ error: "Afiliado não encontrado" });
    }
    
    // Calcular comissão baseada no tipo da casa
    let commissionValue = 0;
    let tipo = 'CPA';
    
    if (house[0].commissionType === 'CPA') {
      commissionValue = parseFloat(house[0].commissionValue);
      tipo = 'CPA';
    } else if (house[0].commissionType === 'RevShare' && amount) {
      const percentage = parseFloat(house[0].commissionValue) / 100;
      commissionValue = parseFloat(amount as string) * percentage;
      tipo = 'RevShare';
    }
    
    console.log(`✅ Postback processado com sucesso`);
    res.json({ 
      success: true, 
      message: "Postback processado com sucesso",
      commission: commissionValue,
      type: tipo,
      affiliate: affiliate[0].username,
      house: house[0].name,
      event: evento
    });
    
  } catch (error) {
    console.error("❌ Erro no processamento do postback:", error);
    res.status(500).json({ error: "Erro interno no processamento", status: "ERROR" });
  }
});

// Middleware para garantir JSON válido em todas as respostas da API
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
