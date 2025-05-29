import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

const app = express();

// ROTA DE POSTBACK ESPECIAL - ANTES DE QUALQUER MIDDLEWARE
app.get("/webhook/:casa/:evento", async (req, res) => {
  const startTime = Date.now();
  console.log(`🔔 === POSTBACK RECEBIDO === ${new Date().toISOString()}`);
  console.log(`URL: ${req.url}`);
  console.log(`Params: ${JSON.stringify(req.params)}`);
  console.log(`Query: ${JSON.stringify(req.query)}`);
  
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
    
    console.log(`📝 Criando log:`, logData);
    const logEntry = await db.insert(schema.postbackLogs).values(logData).returning();
    console.log(`✅ Log criado ID: ${logEntry[0].id}`);
    
    // Verificar casa
    const houses = await db.select()
      .from(schema.bettingHouses)
      .where(eq(schema.bettingHouses.identifier, casa));
    
    if (houses.length === 0) {
      console.log(`❌ Casa não encontrada: ${casa}`);
      await db.update(schema.postbackLogs)
        .set({ status: 'ERROR_HOUSE_NOT_FOUND' })
        .where(eq(schema.postbackLogs.id, logEntry[0].id));
      return res.json({ error: "Casa não encontrada", logId: logEntry[0].id });
    }
    
    const house = houses[0];
    console.log(`✅ Casa: ${house.name}`);
    
    // Verificar afiliado
    const affiliates = await db.select()
      .from(schema.users)
      .where(eq(schema.users.username, subid as string));
    
    if (affiliates.length === 0) {
      console.log(`❌ Afiliado não encontrado: ${subid}`);
      await db.update(schema.postbackLogs)
        .set({ status: 'ERROR_AFFILIATE_NOT_FOUND' })
        .where(eq(schema.postbackLogs.id, logEntry[0].id));
      return res.json({ error: "Afiliado não encontrado", logId: logEntry[0].id });
    }
    
    const affiliate = affiliates[0];
    console.log(`✅ Afiliado: ${affiliate.username}`);
    
    // Registrar evento
    const eventoData = await db.insert(schema.eventos).values({
      afiliadoId: affiliate.id,
      casa: house.identifier,
      evento,
      valor: amount ? (amount as string) : null
    }).returning();
    console.log(`✅ Evento ID: ${eventoData[0].id}`);
    
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
    
    // Salvar comissão
    if (commissionValue > 0) {
      console.log(`💰 Comissão ${tipo}: R$ ${commissionValue}`);
      await db.insert(schema.comissoes).values({
        afiliadoId: affiliate.id,
        eventoId: eventoData[0].id,
        tipo,
        valor: commissionValue.toString()
      });
    }
    
    // Atualizar log para sucesso
    await db.update(schema.postbackLogs)
      .set({ status: 'SUCCESS' })
      .where(eq(schema.postbackLogs.id, logEntry[0].id));
    
    const processTime = Date.now() - startTime;
    console.log(`🎉 Processado em ${processTime}ms`);
    
    res.json({ 
      success: true, 
      message: "Postback processado",
      commission: commissionValue,
      type: tipo,
      affiliate: affiliate.username,
      house: house.name,
      event: evento,
      logId: logEntry[0].id,
      processTime: `${processTime}ms`
    });
    
  } catch (error) {
    console.error("❌ ERRO:", error);
    res.json({ 
      error: "Erro no processamento", 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Configure middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  if (path.startsWith("/api/")) {
    const originalSend = res.send;
    const originalJson = res.json;

    res.send = function (body) {
      return originalSend.call(this, body);
    };

    res.json = function (body) {
      capturedJsonResponse = body;
      return originalJson.call(this, body);
    };
  }

  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    res.end = originalEnd;
    const duration = Date.now() - start;

    if (path.startsWith("/api")) {
      const formattedJson = capturedJsonResponse
        ? `:: ${JSON.stringify(capturedJsonResponse).slice(0, 80)}...`
        : "";

      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms ${formattedJson}`);
    }

    return originalEnd.call(this, chunk, encoding);
  };
  next();
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  log(`Unhandled application error: ${err.message}`);
});

if (process.env.NODE_ENV === "development") {
  const server = await registerRoutes(app);
  await setupVite(app, server);
} else {
  const server = await registerRoutes(app);
  serveStatic(app);
}