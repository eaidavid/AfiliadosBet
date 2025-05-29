import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

const app = express();

// Configure middleware básico ANTES do Vite
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROTA DE POSTBACK ESPECIAL - DEVE SER ANTES DO VITE
app.get("/webhook/:casa/:evento", async (req, res) => {
  const startTime = Date.now();
  console.log(`🔔 === POSTBACK RECEBIDO VIA WEBHOOK === ${new Date().toISOString()}`);
  console.log(`URL completa: ${req.url}`);
  console.log(`Parâmetros: casa=${req.params.casa}, evento=${req.params.evento}`);
  console.log(`Query: ${JSON.stringify(req.query)}`);
  console.log(`IP: ${req.ip}`);
  
  try {
    const { casa, evento } = req.params;
    const { subid, amount, customer_id } = req.query;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    // SEMPRE registrar o log primeiro
    const logData = {
      casa: casa as string,
      evento: evento as string,
      subid: (subid as string) || 'unknown',
      valor: amount ? amount.toString() : '0',
      ip,
      raw: req.url,
      status: 'PROCESSING'
    };
    
    console.log(`📝 Registrando log inicial:`, logData);
    const logEntry = await db.insert(schema.postbackLogs).values(logData).returning();
    console.log(`✅ Log criado com ID: ${logEntry[0].id}`);
    
    // Verificar se a casa existe
    const houses = await db.select()
      .from(schema.bettingHouses)
      .where(eq(schema.bettingHouses.identifier, casa));
    
    if (houses.length === 0) {
      console.log(`❌ Casa não encontrada: ${casa}`);
      await db.update(schema.postbackLogs)
        .set({ status: 'ERROR_HOUSE_NOT_FOUND' })
        .where(eq(schema.postbackLogs.id, logEntry[0].id));
      return res.status(404).json({ error: "Casa de apostas não encontrada", logId: logEntry[0].id });
    }
    
    const house = houses[0];
    console.log(`✅ Casa encontrada: ${house.name}`);
    
    // Verificar se o afiliado existe
    const affiliates = await db.select()
      .from(schema.users)
      .where(eq(schema.users.username, subid as string));
    
    if (affiliates.length === 0) {
      console.log(`❌ Afiliado não encontrado: ${subid}`);
      await db.update(schema.postbackLogs)
        .set({ status: 'ERROR_AFFILIATE_NOT_FOUND' })
        .where(eq(schema.postbackLogs.id, logEntry[0].id));
      return res.status(404).json({ error: "Afiliado não encontrado", logId: logEntry[0].id });
    }
    
    const affiliate = affiliates[0];
    console.log(`✅ Afiliado encontrado: ${affiliate.username}`);
    
    // Registrar evento
    console.log(`📊 Registrando evento...`);
    const eventoData = await db.insert(schema.eventos).values({
      afiliadoId: affiliate.id,
      casa: house.identifier,
      evento,
      valor: amount ? (amount as string) : null
    }).returning();
    console.log(`✅ Evento registrado com ID: ${eventoData[0].id}`);
    
    // Calcular comissão
    let commissionValue = 0;
    let tipo = 'CPA';
    
    if (house.commissionType === 'CPA' && (evento === 'registration' || evento === 'first_deposit')) {
      commissionValue = parseFloat(house.commissionValue);
      tipo = 'CPA';
    } else if (house.commissionType === 'RevShare' && amount && (evento === 'deposit' || evento === 'profit')) {
      const percentage = parseFloat(house.commissionValue) / 100;
      commissionValue = parseFloat(amount as string) * percentage;
      tipo = 'RevShare';
    }
    
    // Salvar comissão se houver
    if (commissionValue > 0) {
      console.log(`💰 Calculando comissão ${tipo}: R$ ${commissionValue}`);
      await db.insert(schema.comissoes).values({
        afiliadoId: affiliate.id,
        eventoId: eventoData[0].id,
        tipo,
        valor: commissionValue.toString()
      });
      console.log(`✅ Comissão salva: R$ ${commissionValue} para ${affiliate.username}`);
    }
    
    // Atualizar log como sucesso
    await db.update(schema.postbackLogs)
      .set({ status: 'SUCCESS' })
      .where(eq(schema.postbackLogs.id, logEntry[0].id));
    
    const processTime = Date.now() - startTime;
    console.log(`🎉 Postback processado com sucesso em ${processTime}ms`);
    console.log(`=== FIM DO POSTBACK WEBHOOK ===`);
    
    res.json({ 
      success: true, 
      message: "Postback processado com sucesso",
      commission: commissionValue,
      type: tipo,
      affiliate: affiliate.username,
      house: house.name,
      event: evento,
      logId: logEntry[0].id,
      processTime: `${processTime}ms`
    });
    
  } catch (error) {
    console.error("❌ ERRO CRÍTICO no webhook:", error);
    res.status(500).json({ 
      error: "Erro interno no processamento", 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

async function handlePostback(req: any, res: any) {
  try {
    const pathParts = req.path.split('/');
    let casa, evento;
    
    // Verificar formato da URL: /api/postback-handler/casa/evento
    if (pathParts.length === 5 && pathParts[1] === 'api' && pathParts[2] === 'postback-handler') {
      [, , , casa, evento] = pathParts;
    } else if (req.params && req.params.casa) {
      // Rota com parâmetros do Express
      casa = req.params.casa;
      evento = req.params.evento;
    } else {
      return res.status(400).json({ error: "Formato inválido de URL" });
    }
    
    const { subid, amount, customer_id } = req.query;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    console.log(`📩 Postback recebido: casa=${casa}, evento=${evento}, subid=${subid}, amount=${amount}`);
    
    // Verificar se a casa existe pelo identificador
    const house = await db.select()
      .from(schema.bettingHouses)
      .where(eq(schema.bettingHouses.identifier, casa))
      .limit(1);
    
    if (house.length === 0) {
      console.log(`❌ Casa não encontrada: ${casa}`);
      // Log de erro no postback
      await db.insert(schema.postbackLogs).values({
        casa,
        evento,
        subid: subid as string || 'unknown',
        valor: amount ? parseFloat(amount as string) : 0,
        ip,
        raw: req.url,
        status: 'ERROR_HOUSE_NOT_FOUND'
      });
      return res.status(404).json({ error: "Casa de apostas não encontrada" });
    }
    
    // Buscar afiliado pelo subid
    const affiliate = await db.select()
      .from(schema.users)
      .where(eq(schema.users.username, subid as string))
      .limit(1);
    
    if (affiliate.length === 0) {
      console.log(`❌ Afiliado não encontrado: ${subid}`);
      // Log de erro no postback
      await db.insert(schema.postbackLogs).values({
        casa,
        evento,
        subid: subid as string || 'unknown',
        valor: amount ? parseFloat(amount as string) : 0,
        ip,
        raw: req.url,
        status: 'ERROR_AFFILIATE_NOT_FOUND'
      });
      return res.status(404).json({ error: "Afiliado não encontrado" });
    }
    
    // Registrar evento no banco
    const eventoData = await db.insert(schema.eventos).values({
      afiliadoId: affiliate[0].id,
      casa,
      evento,
      valor: amount ? (amount as string) : null
    }).returning();
    
    // Calcular comissão baseada no tipo da casa
    let commissionValue = 0;
    let tipo = 'CPA';
    
    if (house[0].commissionType === 'CPA' && (evento === 'registration' || evento === 'first_deposit')) {
      commissionValue = parseFloat(house[0].commissionValue);
      tipo = 'CPA';
    } else if (house[0].commissionType === 'RevShare' && amount && (evento === 'deposit' || evento === 'profit')) {
      const percentage = parseFloat(house[0].commissionValue) / 100;
      commissionValue = parseFloat(amount as string) * percentage;
      tipo = 'RevShare';
    }
    
    // Salvar comissão se houver
    if (commissionValue > 0) {
      await db.insert(schema.comissoes).values({
        afiliadoId: affiliate[0].id,
        eventoId: eventoData[0].id,
        tipo,
        valor: commissionValue.toString()
      });
      
      console.log(`💰 Comissão ${tipo}: R$ ${commissionValue} para ${affiliate[0].username} (${house[0].name})`);
    }
    
    // Log de sucesso no postback
    await db.insert(schema.postbackLogs).values({
      casa,
      evento,
      subid: subid as string,
      valor: amount ? parseFloat(amount as string) : 0,
      ip,
      raw: req.url,
      status: 'SUCCESS'
    });
    
    console.log(`✅ Postback processado com sucesso - Casa: ${house[0].name}, Evento: ${evento}, Afiliado: ${affiliate[0].username}, Comissão: R$ ${commissionValue}`);
    
    res.json({ 
      success: true, 
      message: "Postback processado com sucesso",
      commission: commissionValue,
      type: tipo,
      affiliate: affiliate[0].username,
      house: house[0].name,
      event: evento,
      customer_id,
      processed_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Erro no processamento do postback:", error);
    
    // Log de erro genérico
    try {
      await db.insert(schema.postbackLogs).values({
        casa: req.params?.casa || 'unknown',
        evento: req.params?.evento || 'unknown',
        subid: req.query?.subid as string || 'unknown',
        valor: req.query?.amount ? parseFloat(req.query.amount as string) : 0,
        ip: req.ip || 'unknown',
        raw: req.url,
        status: 'ERROR_INTERNAL'
      });
    } catch (logError) {
      console.error("❌ Erro ao registrar log:", logError);
    }
    
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
