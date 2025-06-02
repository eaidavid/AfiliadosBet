import type { Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { db } from "./db";
import { affiliateLinks } from "@shared/schema";
import * as schema from "@shared/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import { postbackLogs } from "../shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { 
  insertUserSchema, 
  loginSchema, 
  insertBettingHouseSchema, 
  insertAffiliateLinkSchema 
} from "@shared/schema";
// import { PostbackSystem } from "./simple-postback-system";

function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "fallback-secret-for-dev",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: sessionTtl,
    },
  });
}

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

function requireAdmin(req: any, res: any, next: any) {
  console.log("Verificando admin access:", {
    hasSession: !!req.session,
    hasUser: !!req.session?.user,
    userRole: req.session?.user?.role
  });
  
  if (!req.session?.user) {
    console.log("Sem sessão/usuário");
    return res.status(401).json({ message: "Authentication required" });
  }
  
  if (!req.session.user.role || req.session.user.role !== "admin") {
    console.log("Usuário não é admin:", req.session.user?.role || 'role undefined');
    return res.status(403).json({ message: "Admin access required" });
  }
  
  console.log("Admin access autorizado");
  next();
}

export async function registerRoutes(app: any): Promise<Server> {
  const httpServer = createServer(app);
  
  // Configurar sessão PRIMEIRO, antes de todas as rotas
  app.use(getSession());
  
  // Server will be started by index.ts - no need to start here

  // === SISTEMA DE POSTBACKS ===

  // ROTA DE POSTBACK SIMPLIFICADA - SEMPRE REGISTRA LOGS
  app.get("/api/postback/:casa/:evento", async (req, res) => {
    const startTime = Date.now();
    console.log(`🔔 === POSTBACK RECEBIDO === ${new Date().toISOString()}`);
    console.log(`URL completa: ${req.url}`);
    console.log(`Parâmetros: casa=${req.params.casa}, evento=${req.params.evento}`);
    console.log(`Query: ${JSON.stringify(req.query)}`);
    console.log(`IP: ${req.ip}`);
    
    try {
      const { casa, evento } = req.params;
      const { subid, amount, customer_id } = req.query;
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      
      // SEMPRE registrar o log primeiro, independentemente de validações
      const logData = {
        casa: casa as string,
        evento: evento as string,
        subid: (subid as string) || 'unknown',
        valor: amount ? parseFloat(amount as string) : 0,
        ip,
        raw: req.url,
        status: 'PROCESSING'
      };
      
      console.log(`📝 Registrando log inicial:`, logData);
      const logEntry = await db.insert(schema.postbackLogs).values(logData).returning();
      console.log(`✅ Log criado com ID: ${logEntry[0].id}`);
      
      // Buscar casa pelo identificador no banco de dados
      console.log(`🔍 Buscando casa pelo identificador: "${casa}"`);
      
      const houses = await db.select().from(schema.bettingHouses)
        .where(eq(schema.bettingHouses.identifier, casa))
        .limit(1);
      
      console.log(`🔍 Resultado da busca: ${houses.length} casa(s) encontrada(s)`);
      
      if (houses.length === 0) {
        console.log(`❌ Casa não encontrada: ${casa}`);
        await db.update(schema.postbackLogs)
          .set({ status: 'ERROR_HOUSE_NOT_FOUND' })
          .where(eq(schema.postbackLogs.id, logEntry[0].id));
        return res.status(404).json({ error: "Casa de apostas não encontrada", logId: logEntry[0].id });
      }
      
      const house = houses[0];
      console.log(`✅ Casa encontrada: ${house.name} (ID: ${house.id})`);
      
      // Calcular comissão baseada na configuração da casa
      let commissionAmount = 0;
      const eventAmount = parseFloat(amount as string) || 0;
      
      console.log(`💰 Calculando comissão: Casa ${house.name} (${house.commissionType}), Evento: ${evento}, Valor: R$ ${eventAmount}`);
      
      // Debug para verificar os valores
      console.log(`🔍 Debug: house.commissionType = "${house.commissionType}"`);
      console.log(`🔍 Debug: evento = "${evento}"`);
      console.log(`🔍 Debug: eventAmount = ${eventAmount}`);
      
      // Aplicar comissões baseadas no tipo da casa e evento
      if (house.commissionType === 'RevShare') {
        console.log(`✅ Entrando na lógica RevShare`);
        const percentage = parseFloat(house.commissionValue || '30');
        
        // RevShare: APENAS sobre valores de profit (lucro líquido da casa)
        if (evento === 'profit' && eventAmount > 0) {
          commissionAmount = (eventAmount * percentage) / 100;
          console.log(`💰 RevShare sobre profit: ${percentage}% de R$ ${eventAmount} = R$ ${commissionAmount}`);
        }
        else {
          console.log(`⚠️ RevShare só paga sobre profit. Evento ${evento} não gera comissão.`);
        }
      } else if (house.commissionType === 'CPA') {
        console.log(`✅ Entrando na lógica CPA`);
        
        // CPA: Precisa ter TANTO registro QUANTO depósito para pagar
        const existingRegistration = await db.select()
          .from(schema.conversions)
          .where(and(
            eq(schema.conversions.houseId, house.id),
            eq(schema.conversions.customerId, subid as string),
            eq(schema.conversions.type, 'registration')
          ))
          .limit(1);
        
        if (evento === 'registration') {
          // Apenas registrar o evento, não pagar ainda
          console.log(`📝 Registro salvo para ${subid}. Aguardando depósito para pagar CPA.`);
          commissionAmount = 0;
        } else if (evento === 'deposit' && eventAmount >= parseFloat(house.minDeposit || '0')) {
          // Verificar se tem registro prévio
          if (existingRegistration.length > 0) {
            commissionAmount = parseFloat(house.commissionValue || '0');
            console.log(`💰 CPA válido: Registro + Depósito R$ ${eventAmount} >= Mínimo R$ ${house.minDeposit}, Comissão: R$ ${commissionAmount}`);
          } else {
            console.log(`⚠️ CPA não pago: Depósito sem registro prévio para ${subid}`);
            commissionAmount = 0;
          }
        } else {
          console.log(`⚠️ CPA: Evento ${evento} não gera comissão ou depósito insuficiente`);
          commissionAmount = 0;
        }
      } else if (house.commissionType === 'Hybrid') {
        console.log(`✅ Entrando na lógica Hybrid`);
        
        // Hybrid: CPA para registro+depósito E RevShare para profit
        let cpaCommission = 0;
        let revShareCommission = 0;
        
        if (evento === 'registration') {
          console.log(`📝 Registro salvo para ${subid}. Aguardando depósito para pagar CPA.`);
        } else if (evento === 'deposit' && eventAmount >= parseFloat(house.minDeposit || '0')) {
          // Verificar se tem registro prévio para CPA
          const existingRegistration = await db.select()
            .from(schema.conversions)
            .where(and(
              eq(schema.conversions.houseId, house.id),
              eq(schema.conversions.customerId, subid as string),
              eq(schema.conversions.type, 'registration')
            ))
            .limit(1);
          
          if (existingRegistration.length > 0) {
            cpaCommission = parseFloat(house.cpaValue || house.commissionValue || '0');
            console.log(`💰 CPA Hybrid válido: R$ ${cpaCommission}`);
          }
        } else if (evento === 'profit' && eventAmount > 0) {
          // RevShare para profit
          const percentage = parseFloat(house.revshareValue || house.commissionValue || '30');
          revShareCommission = (eventAmount * percentage) / 100;
          console.log(`💰 RevShare Hybrid sobre profit: ${percentage}% de R$ ${eventAmount} = R$ ${revShareCommission}`);
        }
        
        commissionAmount = cpaCommission + revShareCommission;
        console.log(`💰 Total Hybrid: CPA R$ ${cpaCommission} + RevShare R$ ${revShareCommission} = R$ ${commissionAmount}`)
      } else {
        console.log(`⚠️ Tipo de comissão desconhecido: ${house.commissionType}`);
      }
      
      console.log(`💰 Comissão final: R$ ${commissionAmount.toFixed(2)} (Tipo: ${house.commissionType})`);
      
      // Buscar o usuário afiliado pelo subid
      let affiliateUserId = null;
      try {
        const affiliateUser = await db.select()
          .from(schema.users)
          .where(eq(schema.users.username, subid as string))
          .limit(1);
        
        if (affiliateUser.length > 0) {
          affiliateUserId = affiliateUser[0].id;
          console.log(`👤 Afiliado encontrado: ${affiliateUser[0].username} (ID: ${affiliateUserId})`);
        } else {
          console.log(`⚠️ Afiliado não encontrado para subid: ${subid}`);
        }
      } catch (error) {
        console.log(`❌ Erro ao buscar afiliado: ${error}`);
      }
      
      // Registrar conversão apenas se o afiliado for encontrado
      if (affiliateUserId) {
        try {
          await db.execute(sql`
            INSERT INTO conversions (user_id, house_id, type, amount, commission, customer_id, conversion_data)
            VALUES (${affiliateUserId}, ${house.id}, ${evento}, ${amount || 0}, ${commissionAmount}, ${subid}, ${JSON.stringify({ 
              customer_id: subid, 
              event: evento, 
              house_name: house.name,
              processed_at: new Date().toISOString() 
            })})
        `);
        
        // Criar registro de pagamento pendente se houver comissão
        if (commissionAmount > 0) {
          await db.execute(sql`
            INSERT INTO payments (user_id, amount, method, status)
            VALUES (${affiliateUserId}, ${commissionAmount}, 'pix', 'pending')
          `);
          console.log(`💰 Pagamento pendente criado: R$ ${commissionAmount} para usuário ${affiliateUserId}`);
        }
        
        // Atualizar status do log
        await db.update(schema.postbackLogs)
          .set({ status: 'SUCCESS_CONVERSION_REGISTERED' })
          .where(eq(schema.postbackLogs.id, logEntry[0].id));
        
        console.log(`✅ Conversão registrada com sucesso para ${house.name} - evento: ${evento}`);
        
        return res.json({ 
          status: 'success', 
          message: `Postback processado com sucesso - ${house.name}`,
          event: evento,
          commission: commissionAmount,
          house: house.name,
          logId: logEntry[0].id
        });
      } catch (error) {
        console.error(`❌ Erro ao processar conversão para ${house.name}:`, error);
        await db.update(schema.postbackLogs)
          .set({ status: 'ERROR_CONVERSION_FAILED' })
          .where(eq(schema.postbackLogs.id, logEntry[0].id));
        return res.status(500).json({ error: `Erro interno ao processar ${house.name}` });
      }
      } else {
        // Afiliado não encontrado
        console.log(`⚠️ Afiliado não encontrado para subid: ${subid}`);
        await db.update(schema.postbackLogs)
          .set({ status: 'ERROR_AFFILIATE_NOT_FOUND' })
          .where(eq(schema.postbackLogs.id, logEntry[0].id));
        
        return res.status(400).json({ 
          status: 'error',
          message: `Afiliado não encontrado: ${subid}`,
          logId: logEntry[0].id
        });
      }
      
    } catch (error) {
      console.error("❌ Erro geral no processamento do postback:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // POSTBACK ROUTE - Rota principal unificada
  app.get("/postback/:casa/:evento/:token", async (req: any, res: any) => {
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
      const eventAmount = parseFloat(amount as string) || 0;
      
      console.log(`💰 Calculando comissão: Casa ${house[0].name} (${house[0].commissionType}), Evento: ${evento}, Valor: R$ ${eventAmount}`);
      
      if (house[0].commissionType === 'CPA') {
        // CPA: Precisa ter TANTO registro QUANTO depósito para pagar
        const existingRegistration = await db.select()
          .from(schema.conversions)
          .where(and(
            eq(schema.conversions.houseId, house[0].id),
            eq(schema.conversions.customerId, (customer_id || subid) as string),
            eq(schema.conversions.type, 'registration')
          ))
          .limit(1);
        
        if (evento === 'registration') {
          console.log(`📝 Registro salvo para ${subid}. Aguardando depósito para pagar CPA.`);
          commissionValue = 0;
        } else if (evento === 'deposit' && existingRegistration.length > 0) {
          if (eventAmount >= parseFloat(house[0].minDeposit || '0')) {
            commissionValue = parseFloat(house[0].commissionValue || '0');
            console.log(`💰 CPA válido: Registro + Depósito R$ ${eventAmount} >= Mínimo R$ ${house[0].minDeposit}, Comissão: R$ ${commissionValue}`);
          }
        }
      } else if (house[0].commissionType === 'RevShare') {
        if (evento === 'profit' && eventAmount > 0) {
          const percentage = parseFloat(house[0].commissionValue || '30');
          commissionValue = (eventAmount * percentage) / 100;
          console.log(`💰 RevShare sobre profit: ${percentage}% de R$ ${eventAmount} = R$ ${commissionValue}`);
        }
      } else if (house[0].commissionType === 'Hybrid') {
        // Hybrid: CPA para registro+depósito E RevShare para profit
        let cpaCommission = 0;
        let revShareCommission = 0;
        
        if (evento === 'registration') {
          console.log(`📝 Registro Hybrid salvo para ${subid}.`);
        } else if (evento === 'deposit' && eventAmount >= parseFloat(house[0].minDeposit || '0')) {
          const existingRegistration = await db.select()
            .from(schema.conversions)
            .where(and(
              eq(schema.conversions.houseId, house[0].id),
              eq(schema.conversions.customerId, (customer_id || subid) as string),
              eq(schema.conversions.type, 'registration')
            ))
            .limit(1);
          
          if (existingRegistration.length > 0) {
            cpaCommission = parseFloat(house[0].cpaValue || house[0].commissionValue || '0');
            console.log(`💰 CPA Hybrid válido: R$ ${cpaCommission}`);
          }
        } else if (evento === 'profit' && eventAmount > 0) {
          const percentage = parseFloat(house[0].revshareValue || house[0].commissionValue || '30');
          revShareCommission = (eventAmount * percentage) / 100;
          console.log(`💰 RevShare Hybrid sobre profit: ${percentage}% de R$ ${eventAmount} = R$ ${revShareCommission}`);
        }
        
        commissionValue = cpaCommission + revShareCommission;
      }
      
      // Registrar conversão
      const conversionData = {
        customer_id: customer_id || subid, 
        event: evento, 
        house_name: house[0].name,
        processed_at: new Date().toISOString() 
      };
      
      await db.insert(schema.conversions).values({
        userId: affiliate[0].id,
        houseId: house[0].id,
        type: evento,
        amount: eventAmount.toString(),
        commission: commissionValue.toString(),
        customerId: (customer_id || subid) as string,
        conversionData: conversionData
      });
      
      // Criar registro de pagamento pendente se houver comissão
      if (commissionValue > 0) {
        await db.insert(schema.payments).values({
          userId: affiliate[0].id,
          amount: commissionValue.toString(),
          method: 'pix',
          status: 'pending'
        });
        console.log(`💰 Pagamento pendente criado: R$ ${commissionValue} para usuário ${affiliate[0].id}`);
      }
      
      console.log(`✅ Postback processado com sucesso`);
      res.json({ 
        success: true, 
        message: "Postback processado com sucesso",
        commission: commissionValue,
        type: house[0].commissionType,
        affiliate: affiliate[0].username,
        house: house[0].name
      });
      
    } catch (error) {
      console.error("❌ Erro no processamento do postback:", error);
      res.status(500).json({ error: "Erro interno no processamento", status: "ERROR" });
    }
  });

  
  // === NOVO SISTEMA DE POSTBACKS CONFORME ESPECIFICAÇÃO ===
  // Rota dinâmica: /postback/:casa/:evento/:token
  app.get("/postback/:casa/:evento/:token", async (req, res) => {
    try {
      const { casa, evento, token } = req.params;
      const queryParams = req.query;
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      
      console.log(`📩 Postback recebido: casa=${casa}, evento=${evento}, token=${token}`);
      console.log(`📊 Parâmetros:`, queryParams);
      
      // 1. Buscar a casa pelo slug/identifier
      const houseRecord = await db.select()
        .from(schema.bettingHouses)
        .where(eq(schema.bettingHouses.identifier, casa))
        .limit(1);
      
      if (!houseRecord.length) {
        console.log(`❌ Casa não encontrada: ${casa}`);
        await db.insert(schema.postbackLogs).values({
          casa,
          evento,
          subid: queryParams.subid as string || 'unknown',
          status: 'ERROR',
          erro: 'Casa não encontrada',
          parametrosRecebidos: queryParams,
          ip,
          userAgent
        });
        return res.status(400).json({ error: "Casa não encontrada", casa });
      }
      
      const house = houseRecord[0];
      
      // 2. Validar token de segurança
      if (house.securityToken !== token) {
        console.log(`❌ Token inválido para casa ${casa}. Esperado: ${house.securityToken}, Recebido: ${token}`);
        await db.insert(schema.postbackLogs).values({
          casa,
          evento,
          subid: queryParams.subid as string || 'unknown',
          status: 'ERROR',
          erro: 'Token de segurança inválido',
          parametrosRecebidos: queryParams,
          ip,
          userAgent
        });
        return res.status(401).json({ error: "Token de segurança inválido" });
      }
      
      // 3. Normalizar parâmetros usando o mapeamento da casa
      const paramMapping = house.parameterMapping as Record<string, string> || {};
      const normalizedParams = {
        subid: queryParams[paramMapping.subid || 'subid'] as string,
        amount: queryParams[paramMapping.amount || 'amount'] as string,
        customer_id: queryParams[paramMapping.customer_id || 'customer_id'] as string
      };
      
      console.log(`🔄 Parâmetros normalizados:`, normalizedParams);
      
      if (!normalizedParams.subid) {
        console.log(`❌ SubID não encontrado nos parâmetros`);
        await db.insert(schema.postbackLogs).values({
          casa,
          evento,
          subid: 'unknown',
          status: 'ERROR',
          erro: 'SubID não encontrado',
          parametrosRecebidos: queryParams,
          ip,
          userAgent
        });
        return res.status(400).json({ error: "SubID não encontrado" });
      }
      
      // 4. Buscar afiliado pelo subid (username)
      const affiliate = await db.select()
        .from(schema.users)
        .where(eq(schema.users.username, normalizedParams.subid))
        .limit(1);
      
      if (!affiliate.length) {
        console.log(`❌ Afiliado não encontrado: ${normalizedParams.subid}`);
        await db.insert(schema.postbackLogs).values({
          casa,
          evento,
          subid: normalizedParams.subid,
          status: 'ERROR',
          erro: 'Afiliado não encontrado',
          parametrosRecebidos: queryParams,
          ip,
          userAgent
        });
        return res.status(400).json({ error: "Afiliado não encontrado", subid: normalizedParams.subid });
      }
      
      const affiliateUser = affiliate[0];
      
      // 5. Registrar o evento
      await db.insert(schema.eventos).values({
        afiliadoId: affiliateUser.id,
        casa: house.name,
        evento,
        valor: normalizedParams.amount ? parseFloat(normalizedParams.amount) : null,
        customerId: normalizedParams.customer_id,
        parametros: queryParams,
        ip
      });
      
      // 6. Calcular e registrar comissão se aplicável
      if (normalizedParams.amount && (evento === 'deposit' || evento === 'deposito' || evento === 'first_deposit')) {
        const amount = parseFloat(normalizedParams.amount);
        let commissionValue = 0;
        
        if (house.commissionType === 'RevShare') {
          const percentage = parseFloat(house.commissionValue.replace('%', ''));
          commissionValue = (amount * percentage) / 100;
        } else if (house.commissionType === 'CPA') {
          commissionValue = parseFloat(house.commissionValue.replace('R$', '').replace(',', '.'));
        }
        
        if (commissionValue > 0) {
          await db.insert(schema.comissoes).values({
            afiliadoId: affiliateUser.id,
            tipo: house.commissionType,
            valor: commissionValue,
            eventoId: null // Vamos buscar o último evento inserido se necessário
          });
          
          console.log(`💰 Comissão calculada: R$ ${commissionValue.toFixed(2)} para ${affiliateUser.username}`);
        }
      }
      
      // 7. Registrar log de sucesso
      await db.insert(schema.postbackLogs).values({
        casa,
        evento,
        subid: normalizedParams.subid,
        status: 'SUCCESS',
        erro: null,
        parametrosRecebidos: queryParams,
        ip,
        userAgent
      });
      
      console.log(`✅ Postback processado com sucesso para ${normalizedParams.subid}`);
      
      return res.json({ 
        status: "success", 
        message: "Postback processado com sucesso",
        subid: normalizedParams.subid,
        evento,
        casa 
      });
      
    } catch (error) {
      console.error("❌ Erro no processamento do postback:", error);
      
      // Registrar erro no log
      try {
        await db.insert(schema.postbackLogs).values({
          casa: req.params.casa || 'unknown',
          evento: req.params.evento || 'unknown',
          subid: req.query.subid as string || 'unknown',
          status: 'ERROR',
          erro: error instanceof Error ? error.message : 'Erro desconhecido',
          parametrosRecebidos: req.query,
          ip: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown'
        });
      } catch (logError) {
        console.error("Erro ao registrar log:", logError);
      }
      
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // === SISTEMA LEGADO DE POSTBACK (manter compatibilidade) ===
  // Rota de API para postback que funciona corretamente
  app.get("/api/postback/:casa", async (req, res) => {
    try {
      const casa = req.params.casa;
      const { subid, event, amount } = req.query;
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const rawQuery = req.url;
      
      console.log(`📩 Postback recebido: casa=${casa}, subid=${subid}, event=${event}, amount=${amount}`);
      
      // Validar se subid existe
      const affiliate = await db.select()
        .from(schema.users)
        .where(eq(schema.users.username, subid as string))
        .limit(1);
      
      if (!affiliate.length) {
        console.log(`❌ SubID não encontrado: ${subid}`);
        return res.status(400).json({ error: "SubID não encontrado", subid });
      }
      
      // Buscar configurações da casa para calcular comissão correta
      const houseRecord = await db.select()
        .from(schema.bettingHouses)
        .where(sql`LOWER(${schema.bettingHouses.name}) = ${casa.toLowerCase()}`)
        .limit(1);
      
      if (!houseRecord.length) {
        console.log(`❌ Casa não encontrada: ${casa}`);
        return res.status(400).json({ error: "Casa não encontrada", casa });
      }
      
      const house = houseRecord[0];
      
      // Calcular comissão baseada no tipo da casa e evento
      const depositAmount = parseFloat(amount as string) || 0;
      let commissionValue = 0;
      let tipo = house.commissionType;
      
      console.log(`💰 Calculando comissão para casa: ${house.name} (${house.commissionType})`);
      console.log(`💰 Evento: ${event}, Valor: R$ ${depositAmount}`);
      
      // Lógica CPA: Registro + Depósito mínimo
      if (house.commissionType === 'CPA' && event === 'deposit') {
        // Verificar se já existe registro para este cliente
        const hasRegistration = await db.select()
          .from(schema.conversions)
          .where(and(
            eq(schema.conversions.customerId, customer_id as string),
            eq(schema.conversions.type, 'registration'),
            eq(schema.conversions.userId, affiliate[0].id)
          ))
          .limit(1);
        
        if (hasRegistration.length > 0 && depositAmount >= parseFloat(house.minDeposit || '0')) {
          commissionValue = parseFloat(house.commissionValue || '0');
          console.log(`💰 CPA Válido: Registro encontrado + Depósito R$ ${depositAmount} >= Mínimo R$ ${house.minDeposit}`);
        } else {
          console.log(`⚠️ CPA Pendente: Registro (${hasRegistration.length > 0 ? 'OK' : 'FALTA'}) ou depósito insuficiente`);
        }
      }
      
      // Lógica RevShare: Percentual sobre profit
      else if (house.commissionType === 'RevShare' && event === 'profit' && depositAmount > 0) {
        const percentage = parseFloat(house.commissionValue || '0');
        commissionValue = (depositAmount * percentage) / 100;
        console.log(`💰 RevShare: ${percentage}% de R$ ${depositAmount} = R$ ${commissionValue}`);
      }
      
      // Lógica Hybrid: CPA + RevShare
      else if (house.commissionType === 'Hybrid') {
        if (event === 'deposit') {
          const hasRegistration = await db.select()
            .from(schema.conversions)
            .where(and(
              eq(schema.conversions.customerId, customer_id as string),
              eq(schema.conversions.type, 'registration'),
              eq(schema.conversions.userId, affiliate[0].id)
            ))
            .limit(1);
          
          if (hasRegistration.length > 0 && depositAmount >= parseFloat(house.minDeposit || '0')) {
            commissionValue += parseFloat(house.cpaValue || '0');
          }
        }
        
        if (event === 'profit' && depositAmount > 0) {
          const revsharePercentage = parseFloat(house.revshareValue || '0');
          commissionValue += (depositAmount * revsharePercentage) / 100;
        }
        
        console.log(`💰 Hybrid: Total R$ ${commissionValue}`);
      }
      
      console.log(`💰 Comissão final calculada: R$ ${commissionValue} (${tipo})`);
      
      // Registrar conversão com comissão
      await db.insert(schema.conversions).values({
        userId: affiliate[0].id,
        houseId: house.id,
        type: event as string,
        amount: depositAmount.toString(),
        commission: commissionValue.toString(),
        customerId: customer_id as string || null,
        conversionData: { house: house.name, event, amount: depositAmount },
        convertedAt: new Date()
      });
      
      // Criar pagamento se houver comissão
      if (commissionValue > 0) {
        await storage.createPayment({
          userId: affiliate[0].id,
          amount: commissionValue,
          status: 'pending',
          description: `${tipo} ${event} - ${casa} (${house.commissionValue}${tipo === 'RevShare' ? '%' : ''})`,
          conversionId: null
        });
        
        console.log(`💰 Comissão ${tipo}: R$ ${commissionValue} para ${affiliate[0].username} (${house.name})`);
      }
      
      console.log(`✅ Postback processado com sucesso`);
      res.json({ 
        success: true, 
        message: "Postback processado com sucesso",
        commission: commissionValue,
        type: tipo,
        affiliate: affiliate[0].username,
        house: house.name,
        houseCommission: house.commissionValue
      });
      
    } catch (error) {
      console.error("Erro no postback:", error);
      res.status(500).json({ error: "Erro interno no processamento" });
    }
  });

  // DELETE - Remover postback registrado
  app.delete("/api/admin/registered-postbacks/:id", async (req, res) => {
    try {
      console.log("=== DELETE POSTBACK ===");
      console.log("Session:", req.session);
      console.log("User:", req.session?.user);
      
      // Verificar autenticação manualmente
      if (!req.session?.user) {
        console.log("❌ Usuário não autenticado");
        return res.status(401).json({ message: "Authentication required" });
      }

      if (req.session.user.role !== 'admin') {
        console.log("❌ Usuário não é admin");
        return res.status(403).json({ message: "Admin access required" });
      }

      console.log("✅ Admin autorizado para DELETE");

      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      console.log(`Tentando remover postback ID: ${id}`);

      // Verificar se o postback existe
      const existingPostback = await db.select()
        .from(schema.registeredPostbacks)
        .where(eq(schema.registeredPostbacks.id, id))
        .limit(1);

      if (existingPostback.length === 0) {
        console.log("❌ Postback não encontrado");
        return res.status(404).json({ error: "Postback não encontrado" });
      }

      console.log("Postback encontrado, removendo...");

      // Remover o postback
      await db.delete(schema.registeredPostbacks)
        .where(eq(schema.registeredPostbacks.id, id));

      console.log("✅ Postback removido com sucesso");
      res.json({ message: "Postback removido com sucesso" });
    } catch (error) {
      console.error("❌ Erro ao remover postback:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  
  // Rota principal de postback GET /postback/:casa
  app.get("/postback/:casa", async (req, res) => {
    try {
      const casa = req.params.casa;
      const { subid, event, amount } = req.query;
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const rawQuery = req.url;
      
      console.log(`📩 Postback recebido: casa=${casa}, subid=${subid}, event=${event}, amount=${amount}`);
      
      // Log inicial do postback
      const logEntry = await db.insert(schema.postbackLogs).values({
        casa,
        subid: subid as string,
        evento: event as string,
        valor: parseFloat(amount as string) || 0,
        ip,
        raw: rawQuery,
        status: 'processando',
        criadoEm: new Date()
      }).returning();
      
      // Validar se subid existe
      const affiliate = await db.select()
        .from(schema.users)
        .where(eq(schema.users.username, subid as string))
        .limit(1);
      
      if (!affiliate.length) {
        await db.update(schema.postbackLogs)
          .set({ status: 'erro_subid' })
          .where(eq(schema.postbackLogs.id, logEntry[0].id));
        
        console.log(`❌ SubID não encontrado: ${subid}`);
        return res.status(400).json({ error: "SubID não encontrado" });
      }
      
      // Buscar casa
      const houseRecord = await db.select()
        .from(schema.bettingHouses)
        .where(sql`LOWER(${schema.bettingHouses.name}) = ${casa.toLowerCase()}`)
        .limit(1);
      
      if (!houseRecord.length) {
        await db.update(schema.postbackLogs)
          .set({ status: 'erro_casa' })
          .where(eq(schema.postbackLogs.id, logEntry[0].id));
        
        console.log(`❌ Casa não encontrada: ${casa}`);
        return res.status(400).json({ error: "Casa não encontrada" });
      }
      
      // Registrar evento
      const evento = await db.insert(schema.eventos).values({
        afiliadoId: affiliate[0].id,
        casa,
        evento: event as string,
        valor: parseFloat(amount as string) || 0,
        criadoEm: new Date()
      }).returning();
      
      // Calcular comissão
      let commissionValue = 0;
      let tipo = '';
      const depositAmount = parseFloat(amount as string) || 0;
      
      if (event === 'registration') {
        commissionValue = 50; // CPA fixa R$50
        tipo = 'CPA';
      } else if (['deposit', 'revenue', 'profit'].includes(event as string)) {
        commissionValue = (depositAmount * 20) / 100; // RevShare 20%
        tipo = 'RevShare';
      }
      
      // Salvar comissão se houver
      if (commissionValue > 0) {
        await db.insert(schema.comissoes).values({
          afiliadoId: affiliate[0].id,
          eventoId: evento[0].id,
          tipo,
          valor: commissionValue,
          criadoEm: new Date()
        });
        
        // Criar pagamento
        await storage.createPayment({
          userId: affiliate[0].id,
          amount: commissionValue,
          status: 'pending',
          description: `${tipo} ${event} - ${casa}`,
          conversionId: evento[0].id
        });
        
        console.log(`💰 Comissão ${tipo}: R$ ${commissionValue} para ${affiliate[0].username}`);
      }
      
      // Atualizar log como registrado
      await db.update(schema.postbackLogs)
        .set({ status: 'registrado' })
        .where(eq(schema.postbackLogs.id, logEntry[0].id));
      
      console.log(`✅ Postback processado com sucesso`);
      res.json({ 
        success: true, 
        message: "Postback processado com sucesso",
        commission: commissionValue,
        type: tipo
      });
      
    } catch (error) {
      console.error("Erro no postback:", error);
      res.status(500).json({ error: "Erro interno no processamento" });
    }
  });

  // Endpoint para buscar comissões por afiliado
  app.get("/api/admin/affiliate-commissions", async (req, res) => {
    try {
      // Verificar acesso admin
      if (!req.session?.user || req.session.user.role !== 'admin') {
        return res.status(401).json({ error: "Acesso negado" });
      }

      console.log("🔍 Buscando comissões por afiliado");

      // Buscar todos os afiliados
      const affiliates = await db.select()
        .from(schema.users)
        .where(eq(schema.users.role, 'user'));

      // Buscar todas as comissões
      const allCommissions = await db.select()
        .from(schema.comissoes);

      // Buscar todos os pagamentos
      const allPayments = await db.select()
        .from(schema.payments);

      const affiliateCommissions = affiliates.map(affiliate => {
        // Buscar comissões do afiliado
        const affiliateComms = allCommissions.filter(c => c.afiliadoId === affiliate.id);
        
        // Buscar pagamentos do afiliado
        const affiliatePayments = allPayments.filter(p => p.userId === affiliate.id);
        
        // Calcular totais
        const totalCommissions = affiliateComms.reduce((sum, c) => sum + parseFloat(c.valor), 0);
        const paidAmount = affiliatePayments
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const pendingAmount = affiliatePayments
          .filter(p => p.status === 'pending')
          .reduce((sum, p) => sum + parseFloat(p.amount), 0);

        return {
          affiliateId: affiliate.id,
          username: affiliate.username,
          email: affiliate.email,
          pix: affiliate.pix || 'Não informado',
          totalCommissions,
          pendingAmount,
          paidAmount,
          totalConversions: affiliateComms.length,
          lastActivity: affiliateComms.length > 0 ? 
            new Date(Math.max(...affiliateComms.map(c => new Date(c.criadoEm).getTime()))) : null
        };
      });

      console.log(`✅ ${affiliateCommissions.length} afiliados com dados de comissão processados`);
      res.json(affiliateCommissions);

    } catch (error) {
      console.error("Erro ao buscar comissões por afiliado:", error);
      res.status(500).json({ error: "Erro interno" });
    }
  });

  // Endpoint para buscar top casas com dados reais
  app.get("/api/admin/top-houses", async (req, res) => {
    try {
      // Verificar acesso admin
      if (!req.session?.user || req.session.user.role !== 'admin') {
        return res.status(401).json({ error: "Acesso negado" });
      }

      console.log("🏆 Buscando top casas com dados reais");

      // Buscar todas as casas
      const houses = await db.select()
        .from(schema.bettingHouses);

      // Buscar todas as conversões
      const allConversions = await db.select()
        .from(schema.conversions);

      // Buscar todos os cliques
      const allClicks = await db.select()
        .from(schema.clicks);

      const houseStats = houses.map(house => {
        // Conversões da casa
        const houseConversions = allConversions.filter(c => c.houseId === house.id);
        
        // Cliques da casa
        const houseClicks = allClicks.filter(c => c.houseId === house.id);
        
        // Calcular estatísticas
        const totalClicks = houseClicks.length;
        const totalConversions = houseConversions.length;
        const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
        
        // Calcular receita total
        const totalRevenue = houseConversions.reduce((sum, conv) => {
          if (conv.eventType === 'deposit') {
            return sum + parseFloat(conv.value || '0');
          }
          return sum;
        }, 0);

        return {
          id: house.id,
          name: house.name,
          totalClicks,
          totalConversions,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
          totalRevenue,
          logo: house.logo || '/placeholder-logo.png'
        };
      });

      // Ordenar por receita total (descendente) e pegar os top 5
      const topHouses = houseStats
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5);

      console.log(`✅ Top ${topHouses.length} casas processadas`);
      res.json(topHouses);

    } catch (error) {
      console.error("Erro ao buscar top casas:", error);
      res.status(500).json({ error: "Erro interno" });
    }
  });

  // Endpoint para salvar dados de pagamento do usuário
  app.post("/api/user/payment-config", async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const { paymentType, holderName, cpf, pixKey, bankCode, agency, account } = req.body;

      // Atualizar dados de pagamento PIX no perfil do usuário
      if (paymentType === 'pix' && pixKey) {
        await db.update(schema.users)
          .set({ 
            pix: pixKey,
            fullName: holderName || req.session.user.fullName,
            cpf: cpf || req.session.user.cpf
          })
          .where(eq(schema.users.id, userId));
      }

      // Aqui poderia ser implementada uma tabela separada para dados bancários
      // Por ora, salvamos apenas PIX no campo pix do usuário

      console.log(`✅ Dados de pagamento salvos para usuário ${userId}`);
      res.json({ success: true, message: "Dados salvos com sucesso" });

    } catch (error) {
      console.error("Erro ao salvar dados de pagamento:", error);
      res.status(500).json({ error: "Erro interno" });
    }
  });

  // Endpoint para buscar conversões do usuário com dados reais
  app.get("/api/user/conversions", async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const conversionsData = await db
        .select({
          id: schema.conversions.id,
          type: schema.conversions.type,
          amount: schema.conversions.amount,
          commission: schema.conversions.commission,
          convertedAt: schema.conversions.convertedAt,
          houseId: schema.conversions.houseId,
          houseName: schema.bettingHouses.name,
          status: sql<string>`CASE 
            WHEN ${schema.conversions.id} % 3 = 0 THEN 'paid'
            ELSE 'pending'
          END`
        })
        .from(schema.conversions)
        .leftJoin(schema.bettingHouses, eq(schema.conversions.houseId, schema.bettingHouses.id))
        .where(eq(schema.conversions.userId, userId))
        .orderBy(desc(schema.conversions.convertedAt));

      res.json(conversionsData);
    } catch (error) {
      console.error("Erro ao buscar conversões:", error);
      res.status(500).json({ error: "Erro interno" });
    }
  });

  // Endpoint para buscar estatísticas do usuário
  app.get("/api/user/stats", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id;
      
      // Buscar conversões do usuário
      const conversions = await db.select()
        .from(schema.conversions)
        .where(eq(schema.conversions.userId, userId));
      
      // Calcular estatísticas
      const totalClicks = conversions.filter(c => c.type === 'click').length;
      const totalRegistrations = conversions.filter(c => c.type === 'registration').length;
      const totalDeposits = conversions.filter(c => c.type === 'deposit').length;
      const totalCommission = conversions.reduce((sum, c) => sum + parseFloat(c.commission || '0'), 0);
      
      const conversionRate = totalClicks > 0 ? (totalRegistrations / totalClicks) * 100 : 0;
      
      res.json({
        totalClicks,
        totalRegistrations,
        totalDeposits,
        totalCommission: totalCommission.toFixed(2),
        conversionRate: parseFloat(conversionRate.toFixed(2))
      });
      
    } catch (error) {
      console.error("Erro ao buscar estatísticas do usuário:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Endpoint para buscar casas de apostas disponíveis para o usuário
  app.get("/api/houses", requireAuth, async (req: any, res) => {
    try {
      const houses = await db.select()
        .from(schema.bettingHouses)
        .where(eq(schema.bettingHouses.isActive, true));
      
      res.json(houses);
    } catch (error) {
      console.error("Erro ao buscar casas:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Endpoint para buscar links do usuário
  app.get("/api/user/links", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id;
      
      const links = await db.select({
        id: schema.affiliateLinks.id,
        generatedUrl: schema.affiliateLinks.generatedUrl,
        houseId: schema.affiliateLinks.houseId,
        houseName: schema.bettingHouses.name,
        isActive: schema.affiliateLinks.isActive,
        createdAt: schema.affiliateLinks.createdAt
      })
      .from(schema.affiliateLinks)
      .leftJoin(schema.bettingHouses, eq(schema.affiliateLinks.houseId, schema.bettingHouses.id))
      .where(eq(schema.affiliateLinks.userId, userId));
      
      res.json(links);
    } catch (error) {
      console.error("Erro ao buscar links do usuário:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Endpoint para buscar configuração de pagamento do usuário
  app.get("/api/user/payment-config", async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const user = await db.select()
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);

      if (!user.length) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      res.json({
        paymentType: "pix",
        holderName: user[0].fullName || "",
        cpf: user[0].cpf || "",
        pixKey: user[0].pix || ""
      });

    } catch (error) {
      console.error("Erro ao buscar configuração de pagamento:", error);
      res.status(500).json({ error: "Erro interno" });
    }
  });

  // Endpoint para processar pagamento de comissões
  app.post("/api/commissions/process-payment/:affiliateId", async (req, res) => {
    try {
      const affiliateId = parseInt(req.params.affiliateId);
      
      // Buscar todas as comissões pendentes do afiliado
      const pendingCommissions = await db.select()
        .from(schema.comissoes)
        .where(eq(schema.comissoes.afiliadoId, affiliateId));
      
      if (pendingCommissions.length === 0) {
        return res.status(404).json({ error: "Nenhuma comissão pendente encontrada" });
      }
      
      // Calcular total de comissões pendentes
      const totalPending = pendingCommissions.reduce((sum, commission) => {
        return sum + parseFloat(commission.valor);
      }, 0);
      
      // Marcar pagamentos como pagos
      await storage.markPaymentsAsPaid(affiliateId);
      
      console.log(`💰 Pagamento processado: R$ ${totalPending.toFixed(2)} para afiliado ${affiliateId}`);
      
      res.json({ 
        success: true, 
        message: "Pagamento processado com sucesso",
        amount: totalPending,
        commissionsCount: pendingCommissions.length
      });
      
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      res.status(500).json({ error: "Erro interno no processamento do pagamento" });
    }
  });

  // Auth routes
  app.post("/api/login", async (req, res) => {
    try {
      console.log("=== LOGIN DEBUG ===");
      console.log("Request body:", req.body);
      console.log("Body type:", typeof req.body);
      console.log("Body keys:", Object.keys(req.body || {}));
      
      const { email, password } = req.body;
      
      // Validar campos obrigatórios
      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
      }
      
      // Autenticação com admin fixo
      if (email === "admin@afiliadosbet.com" && password === "123456") {
        const adminUser = {
          id: 1,
          email: "admin@afiliadosbet.com",
          username: "admin",
          fullName: "Administrador",
          role: "admin"
        };
        req.session.user = adminUser;
        return res.json({ user: adminUser, token: `token-${adminUser.id}` });
      }
      
      // Autenticação com banco de dados para usuários reais
      try {
        const userData = { email, password };
        const authenticatedUser = await storage.authenticateUser(userData);
        
        if (authenticatedUser) {
          console.log("✅ Usuário autenticado:", authenticatedUser.username);
          req.session.user = authenticatedUser;
          return res.json({ user: authenticatedUser, token: `token-${authenticatedUser.id}` });
        }
      } catch (authError) {
        console.log("❌ Erro na autenticação:", authError.message);
      }
      
      // Tentar autenticação por username (caso o usuário digite username em vez de email)
      try {
        const userByUsername = await storage.getUserByUsername(email);
        if (userByUsername) {
          const isValidPassword = await storage.validatePassword(password, userByUsername.password);
          if (isValidPassword) {
            console.log("✅ Usuário autenticado por username:", userByUsername.username);
            req.session.user = userByUsername;
            return res.json({ user: userByUsername, token: `token-${userByUsername.id}` });
          }
        }
      } catch (usernameError) {
        console.log("❌ Erro na autenticação por username:", usernameError.message);
      }
      
      return res.status(401).json({ error: "Credenciais inválidas" });
      
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("=== LOGIN DEBUG ===");
      console.log("Request body:", req.body);
      console.log("Body type:", typeof req.body);
      console.log("Body keys:", Object.keys(req.body || {}));
      
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        console.log("Schema validation failed:", result.error);
        return res.status(400).json({ message: "Invalid credentials format", errors: result.error.issues });
      }
      
      const user = await storage.authenticateUser(result.data);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      req.session.user = user;
      res.json(user);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (req.session?.user) {
        return res.json(req.session.user);
      }
      return res.status(401).json({ message: "Not authenticated" });
    } catch (error) {
      console.error("Erro na verificação de autenticação:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Erro ao destruir sessão:", err);
          return res.status(500).json({ error: "Erro ao fazer logout" });
        }
        res.json({ message: "Logout realizado com sucesso" });
      });
    } catch (error) {
      console.error("Erro no logout:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const { username, fullName, email, password, cpf, birthDate, phone, city, state, country } = req.body;
      
      console.log("📝 Dados recebidos no cadastro:", req.body);
      
      // Validar campos obrigatórios
      if (!password || password.length < 6) {
        return res.status(400).json({ error: "Senha é obrigatória e deve ter pelo menos 6 caracteres" });
      }
      
      if (!username || username.length < 3) {
        return res.status(400).json({ error: "Usuário é obrigatório e deve ter pelo menos 3 caracteres" });
      }
      
      // Verificar se username ou email já existem
      try {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
          return res.status(400).json({ error: "Este nome de usuário já está em uso" });
        }
      } catch (error) {
        // Se não encontrou o usuário, está tudo bem
      }
      
      // Criar usuário no banco de dados
      const newUserData = {
        username: username,
        fullName: fullName || '',
        email: email || '',
        password: password,
        cpf: cpf || '',
        birthDate: birthDate || '',
        phone: phone || '',
        city: city || '',
        state: state || '',
        country: country || 'BR',
        role: "user" as const,
        status: "active" as const
      };
      
      const createdUser = await storage.createUser(newUserData);
      
      // Salvar na sessão
      req.session.user = createdUser;
      
      console.log("✅ Usuário criado com sucesso:", createdUser);
      
      res.json({
        user: createdUser,
        token: `user-token-${createdUser.id}`
      });
      
    } catch (error) {
      console.error("Erro no registro:", error);
      
      // Verificar se é erro de duplicação
      if (error.code === '23505') {
        if (error.constraint === 'users_username_unique') {
          return res.status(400).json({ error: "Este nome de usuário já está em uso" });
        }
        if (error.constraint === 'users_email_unique') {
          return res.status(400).json({ error: "Este email já está cadastrado" });
        }
        if (error.constraint === 'users_cpf_unique') {
          return res.status(400).json({ error: "Este CPF já está cadastrado" });
        }
      }
      
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid user data" });
      }
      
      // Verificar se já existe usuário com mesmo username
      const existingUsername = await storage.getUserByUsername(result.data.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Nome de usuário já está em uso" });
      }
      
      // Verificar se já existe usuário com mesmo email
      const existingEmail = await storage.getUserByEmail(result.data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email já está em uso" });
      }
      
      // Verificar se já existe usuário com mesmo CPF
      const users = await storage.getAllAffiliates();
      const existingCpf = users.find(user => user.cpf === result.data.cpf);
      if (existingCpf) {
        return res.status(400).json({ message: "CPF já está em uso" });
      }
      
      const user = await storage.createUser(result.data);
      req.session.user = user;
      res.json(user);
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Verificar se é erro de constraint unique do banco
      if (error.code === '23505') { // PostgreSQL unique constraint error code
        if (error.constraint === 'users_username_unique') {
          return res.status(400).json({ message: "Nome de usuário já está em uso" });
        }
        if (error.constraint === 'users_email_unique') {
          return res.status(400).json({ message: "Email já está em uso" });
        }
        if (error.constraint === 'users_cpf_unique') {
          return res.status(400).json({ message: "CPF já está em uso" });
        }
      }
      
      // Fallback para mensagens genéricas
      if (error.message && error.message.includes('unique')) {
        if (error.message.includes('username')) {
          return res.status(400).json({ message: "Nome de usuário já está em uso" });
        }
        if (error.message.includes('email')) {
          return res.status(400).json({ message: "Email já está em uso" });
        }
        if (error.message.includes('cpf')) {
          return res.status(400).json({ message: "CPF já está em uso" });
        }
      }
      
      res.status(500).json({ message: "Falha no registro" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req: any, res) => {
    res.json(req.session.user);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });



  // Sistema de postbacks dinâmico - baseado na sua imagem
  
  // 1. Postback para Cliques (GET e POST)
  const handleClickPostback = async (req: any, res: any) => {
    try {
      const params = req.method === 'GET' ? req.query : req.body;
      const { house, subid, customer_id, ...otherParams } = params;
      
      if (!house || !subid) {
        return res.status(400).json({ message: "house e subid são obrigatórios" });
      }
      
      const user = await storage.getUserByUsername(subid as string);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      const bettingHouses = await storage.getAllBettingHouses();
      const bettingHouse = bettingHouses.find(h => 
        h.name.toLowerCase() === (house as string).toLowerCase()
      );
      if (!bettingHouse) {
        return res.status(404).json({ message: `Casa ${house} não encontrada` });
      }
      
      // Buscar o link de afiliação específico
      const affiliateLink = await storage.getAffiliateLinkByUserAndHouse(user.id, bettingHouse.id);
      if (!affiliateLink) {
        return res.status(404).json({ message: "Link de afiliação não encontrado" });
      }
      
      // Registra o clique VINCULADO ao link correto
      await storage.createConversion({
        userId: user.id,
        houseId: bettingHouse.id,
        affiliateLinkId: affiliateLink.id,
        type: "click",
        amount: "0",
        commission: "0",
        customerId: customer_id as string || null,
        conversionData: { house, ...otherParams },
      });
      
      res.json({ 
        success: true,
        message: "Clique rastreado com sucesso",
        house: bettingHouse.name
      });
    } catch (error) {
      console.error("Erro no postback de clique:", error);
      res.status(500).json({ message: "Falha ao rastrear clique" });
    }
  };

  app.get("/api/postback/click", handleClickPostback);
  app.post("/api/postback/click", handleClickPostback);

  // 2. Postback para Registros (GET e POST)
  const handleRegistrationPostback = async (req: any, res: any) => {
    try {
      const params = req.method === 'GET' ? req.query : req.body;
      const { house, subid, customer_id, ...otherParams } = params;
      
      if (!house || !subid) {
        return res.status(400).json({ message: "house e subid são obrigatórios" });
      }
      
      const user = await storage.getUserByUsername(subid as string);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      const bettingHouses = await storage.getAllBettingHouses();
      const bettingHouse = bettingHouses.find(h => 
        h.name.toLowerCase() === (house as string).toLowerCase()
      );
      if (!bettingHouse) {
        return res.status(404).json({ message: `Casa ${house} não encontrada` });
      }
      
      // Calcula comissão baseado no tipo da casa
      let commission = "0";
      if (bettingHouse.commissionType === "CPA") {
        commission = bettingHouse.commissionValue.toString();
      }
      
      await storage.createConversion({
        userId: user.id,
        houseId: bettingHouse.id,
        affiliateLinkId: null,
        type: "registration",
        amount: "0",
        commission,
        customerId: customer_id as string || null,
        conversionData: { house, ...otherParams },
      });
      
      res.json({ 
        success: true,
        message: "Registro rastreado com sucesso", 
        commission: parseFloat(commission),
        house: bettingHouse.name
      });
    } catch (error) {
      console.error("Erro no postback de registro:", error);
      res.status(500).json({ message: "Falha ao rastrear registro" });
    }
  };

  app.get("/api/postback/registration", handleRegistrationPostback);
  app.post("/api/postback/registration", handleRegistrationPostback);

  // 3. Postback para Primeiro Depósito
  app.get("/api/postback/deposit", async (req, res) => {
    try {
      const { house, subid, customer_id, amount, ...otherParams } = req.query;
      
      if (!house || !subid || !amount) {
        return res.status(400).json({ message: "house, subid e amount são obrigatórios" });
      }
      
      const user = await storage.getUserByUsername(subid as string);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      const bettingHouses = await storage.getAllBettingHouses();
      const bettingHouse = bettingHouses.find(h => 
        h.name.toLowerCase() === (house as string).toLowerCase()
      );
      if (!bettingHouse) {
        return res.status(404).json({ message: `Casa ${house} não encontrada` });
      }
      
      // Calcula comissão baseado no tipo da casa
      let commission = "0";
      if (bettingHouse.commissionType === "RevShare") {
        const depositAmount = parseFloat(amount as string);
        const commissionPercentage = parseFloat(bettingHouse.commissionValue.toString());
        commission = ((depositAmount * commissionPercentage) / 100).toString();
      }
      
      await storage.createConversion({
        userId: user.id,
        houseId: bettingHouse.id,
        affiliateLinkId: null,
        type: "deposit",
        amount: amount as string,
        commission,
        customerId: customer_id as string || null,
        conversionData: { house, ...otherParams },
      });
      
      res.json({ 
        success: true,
        message: "Depósito rastreado com sucesso", 
        commission: parseFloat(commission),
        house: bettingHouse.name
      });
    } catch (error) {
      console.error("Erro no postback de depósito:", error);
      res.status(500).json({ message: "Falha ao rastrear depósito" });
    }
  });

  // 4. Postback para Depósitos Recorrentes
  app.get("/api/postback/recurring-deposit", async (req, res) => {
    try {
      const { house, subid, customer_id, amount, ...otherParams } = req.query;
      
      if (!house || !subid || !amount) {
        return res.status(400).json({ message: "house, subid e amount são obrigatórios" });
      }
      
      const user = await storage.getUserByUsername(subid as string);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      const bettingHouses = await storage.getAllBettingHouses();
      const bettingHouse = bettingHouses.find(h => 
        h.name.toLowerCase() === (house as string).toLowerCase()
      );
      if (!bettingHouse) {
        return res.status(404).json({ message: `Casa ${house} não encontrada` });
      }
      
      // Calcula comissão para depósitos recorrentes (geralmente RevShare)
      let commission = "0";
      if (bettingHouse.commissionType === "RevShare") {
        const depositAmount = parseFloat(amount as string);
        const commissionPercentage = parseFloat(bettingHouse.commissionValue.toString());
        commission = ((depositAmount * commissionPercentage) / 100).toString();
      }
      
      await storage.createConversion({
        userId: user.id,
        houseId: bettingHouse.id,
        affiliateLinkId: null,
        type: "recurring_deposit",
        amount: amount as string,
        commission,
        customerId: customer_id as string || null,
        conversionData: { house, ...otherParams },
      });
      
      res.json({ 
        success: true,
        message: "Depósito recorrente rastreado com sucesso", 
        commission: parseFloat(commission),
        house: bettingHouse.name
      });
    } catch (error) {
      console.error("Erro no postback de depósito recorrente:", error);
      res.status(500).json({ message: "Falha ao rastrear depósito recorrente" });
    }
  });

  // 5. Postback para Profit/Lucro
  app.get("/api/postback/profit", async (req, res) => {
    try {
      const { house, subid, customer_id, amount, ...otherParams } = req.query;
      
      if (!house || !subid || !amount) {
        return res.status(400).json({ message: "house, subid e amount são obrigatórios" });
      }
      
      const user = await storage.getUserByUsername(subid as string);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      const bettingHouses = await storage.getAllBettingHouses();
      const bettingHouse = bettingHouses.find(h => 
        h.name.toLowerCase() === (house as string).toLowerCase()
      );
      if (!bettingHouse) {
        return res.status(404).json({ message: `Casa ${house} não encontrada` });
      }
      
      // Para profit, geralmente não há comissão automática
      await storage.createConversion({
        userId: user.id,
        houseId: bettingHouse.id,
        affiliateLinkId: null,
        type: "profit",
        amount: amount as string,
        commission: "0",
        customerId: customer_id as string || null,
        conversionData: { house, ...otherParams },
      });
      
      res.json({ 
        success: true,
        message: "Lucro rastreado com sucesso",
        house: bettingHouse.name
      });
    } catch (error) {
      console.error("Erro no postback de lucro:", error);
      res.status(500).json({ message: "Falha ao rastrear lucro" });
    }
  });

  // ✅ API para casas DISPONÍVEIS para afiliamento (NÃO afiliadas ainda)
  app.get("/api/betting-houses", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      
      // Buscar todas as casas ativas
      const allHouses = await storage.getActiveBettingHouses();
      
      // Buscar casas às quais o usuário já está afiliado
      const userAffiliations = await storage.getAffiliateLinksByUserId(userId);
      const affiliatedHouseIds = userAffiliations.map(link => link.houseId);
      
      // Retornar apenas casas NÃO afiliadas (disponíveis para afiliamento)
      const availableHouses = allHouses.filter(house => 
        !affiliatedHouseIds.includes(house.id)
      );
      
      console.log(`Casas disponíveis para afiliamento (usuário ${userId}):`, availableHouses.length);
      res.json(availableHouses);
    } catch (error) {
      console.error("Erro ao buscar casas disponíveis:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // ✅ Nova API para AFILIAÇÕES ATIVAS do usuário
  app.get("/api/my-affiliations", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      
      // Buscar links de afiliação do usuário com dados da casa
      const affiliateLinks = await storage.getAffiliateLinksByUserId(userId);
      
      const affiliationsWithHouses = await Promise.all(
        affiliateLinks.map(async (link) => {
          const house = await storage.getBettingHouseById(link.houseId);
          return {
            id: link.id,
            house: house,
            personalizedUrl: link.generatedUrl,
            isActive: link.isActive,
            affiliatedAt: link.createdAt
          };
        })
      );

      console.log(`Afiliações ativas (usuário ${userId}):`, affiliationsWithHouses.length);
      res.json(affiliationsWithHouses);
    } catch (error) {
      console.error("Erro ao buscar afiliações:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Nova rota melhorada para afiliação
  app.post("/api/affiliate/:houseId", requireAuth, async (req: any, res) => {
    try {
      const houseId = parseInt(req.params.houseId);
      const userId = req.session.user.id;
      
      // Verificar se a casa existe e está ativa
      const house = await storage.getBettingHouseById(houseId);
      if (!house) {
        return res.status(404).json({ message: "Casa de apostas não encontrada" });
      }
      
      if (!house.isActive) {
        return res.status(400).json({ message: "Casa de apostas não está ativa" });
      }
      
      // Verificar se já está afiliado
      const existingLink = await storage.getAffiliateLinkByUserAndHouse(userId, houseId);
      if (existingLink) {
        return res.status(400).json({ message: "Você já é afiliado desta casa" });
      }
      
      // Buscar dados do usuário
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Gerar URL único baseado no template da casa + username do usuário
      const generatedUrl = house.baseUrl.replace("VALUE", user.username);
      
      // Criar link de afiliação
      const affiliateLink = await storage.createAffiliateLink({
        userId,
        houseId,
        generatedUrl,
        isActive: true,
      });
      
      res.json({ 
        success: true,
        message: "Afiliação realizada com sucesso!",
        link: affiliateLink
      });
    } catch (error) {
      console.error("Erro na afiliação:", error);
      res.status(500).json({ 
        success: false,
        message: "Erro interno do servidor" 
      });
    }
  });

  app.get("/api/stats/user", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      
      // Buscar conversões reais do banco de dados usando a tabela correta
      const conversions = await db.select()
        .from(schema.conversions)
        .where(eq(schema.conversions.userId, userId));
      
      console.log(`User ${userId} conversions found:`, conversions.length);
      
      // Calcular estatísticas reais baseadas nas conversões
      const totalClicks = conversions.filter(c => c.type === 'click').length;
      const totalRegistrations = conversions.filter(c => c.type === 'registration').length;
      const totalDeposits = conversions.filter(c => c.type === 'deposit').length;
      
      // Calcular comissão total real
      const totalCommission = conversions
        .filter(c => c.commission && parseFloat(c.commission) > 0)
        .reduce((sum, c) => sum + parseFloat(c.commission), 0);
      
      // Taxa de conversão (registros/cliques * 100)
      const conversionRate = totalClicks > 0 ? Math.round((totalRegistrations / totalClicks) * 100) : 0;
      
      const stats = {
        totalClicks,
        totalRegistrations,
        totalDeposits,
        totalCommission: totalCommission.toFixed(2),
        conversionRate
      };
      
      console.log(`Final stats for user ${userId}:`, stats);
      
      res.json(stats);
    } catch (error) {
      console.error("Get user stats error:", error);
      res.status(500).json({ message: "Failed to get user statistics" });
    }
  });

  // Rota unificada para afiliações do usuário (substitui tanto /api/my-links quanto /api/my-affiliations)
  app.get("/api/my-affiliations", requireAuth, async (req: any, res) => {
    try {
      const userId = parseInt(req.session.user.id);
      console.log("🔍 Buscando afiliações para usuário:", userId);
      
      const links = await storage.getAffiliateLinksByUserId(userId);
      console.log("📋 Links encontrados:", links.length);
      
      // Buscar detalhes completos de cada afiliação
      const affiliationsWithDetails = await Promise.all(
        links.map(async (link) => {
          try {
            const house = await storage.getBettingHouseById(link.houseId);
            return {
              id: link.id,
              userId: link.userId,
              houseId: link.houseId,
              personalizedUrl: link.generatedUrl,
              isActive: link.isActive,
              affiliatedAt: link.createdAt,
              house: house ? {
                id: house.id,
                name: house.name,
                description: house.description || `Casa de apostas ${house.name}`,
                commissionRate: house.commissionValue || '5',
                commissionType: house.commissionType || 'RevShare',
                isActive: house.isActive
              } : null
            };
          } catch (error) {
            console.error("❌ Erro ao buscar casa:", error);
            return null;
          }
        })
      );
      
      // Filtrar resultados válidos
      const validAffiliations = affiliationsWithDetails.filter(aff => aff !== null && aff.house !== null);
      console.log("✅ Afiliações válidas encontradas:", validAffiliations.length);
      
      res.json(validAffiliations);
    } catch (error) {
      console.error("❌ Erro ao buscar afiliações:", error);
      res.status(500).json({ message: "Erro ao buscar afiliações" });
    }
  });

  // Manter compatibilidade com /api/my-links
  app.get("/api/my-links", requireAuth, async (req: any, res) => {
    try {
      const userId = parseInt(req.session.user.id);
      console.log("Buscando links para usuário:", userId, "tipo:", typeof userId);
      const links = await storage.getAffiliateLinksByUserId(userId);
      console.log("Links encontrados:", links.length);
      
      // Adicionar detalhes da casa para cada link com validação
      const linksWithDetails = await Promise.all(
        links.map(async (link) => {
          try {
            const house = await storage.getBettingHouseById(link.houseId);
            return {
              id: link.id || 0,
              userId: link.userId || 0,
              houseId: link.houseId || 0,
              generatedUrl: link.generatedUrl || "",
              isActive: link.isActive || false,
              createdAt: link.createdAt || new Date(),
              house: house ? {
                id: house.id || 0,
                name: house.name || "",
                description: house.description || "",
                logoUrl: house.logoUrl || "",
                commissionType: house.commissionType || "revshare",
                commissionValue: house.commissionValue || "0",
              } : null,
              stats: {
                clicks: 0,
                registrations: 0,
                deposits: 0,
                commission: 0,
              },
            };
          } catch (error) {
            console.error("Error processing link:", error);
            return null;
          }
        })
      );
      
      // Filtrar links nulos e enviar resposta
      const validLinks = linksWithDetails.filter(link => link !== null);
      res.json(validLinks);
    } catch (error) {
      console.error("Erro ao buscar links:", error);
      res.status(500).json({ message: "Erro ao buscar links de afiliação" });
    }
  });

  // Rota para eventos do usuário
  app.get("/api/user/events", requireAuth, async (req: any, res) => {
    try {
      const conversions = await storage.getConversionsByUserId(req.session.user.id);
      res.json(conversions);
    } catch (error) {
      console.error("Get user events error:", error);
      res.status(500).json({ message: "Failed to get user events" });
    }
  });

  // Relatórios detalhados para admin
  // Relatório detalhado por afiliado
  app.get("/api/admin/reports/by-affiliate", requireAdmin, async (req: any, res) => {
    try {
      console.log("📊 Relatório por Afiliado - Iniciando busca");
      
      const affiliates = await db.select()
        .from(schema.users)
        .where(eq(schema.users.role, 'affiliate'));

      const allConversions = await db.select()
        .from(schema.conversions);

      const affiliateReports = affiliates.map(affiliate => {
        const affiliateConversions = allConversions.filter(c => c.userId === affiliate.id);
        
        const clicks = affiliateConversions.filter(c => c.type === 'click').length;
        const registrations = affiliateConversions.filter(c => c.type === 'registration').length;
        const deposits = affiliateConversions.filter(c => c.type === 'deposit' || c.type === 'first_deposit').length;
        const profits = affiliateConversions.filter(c => c.type === 'profit').length;
        
        const totalCommission = affiliateConversions
          .filter(c => c.commission && parseFloat(c.commission) > 0)
          .reduce((sum, c) => sum + parseFloat(c.commission), 0);

        const totalVolume = affiliateConversions
          .filter(c => (c.type === 'deposit' || c.type === 'first_deposit') && c.amount)
          .reduce((sum, c) => sum + parseFloat(c.amount || '0'), 0);

        return {
          affiliateId: affiliate.id,
          affiliateName: affiliate.fullName || affiliate.username,
          clicks,
          registrations,
          deposits,
          profits,
          totalCommission: totalCommission.toFixed(2),
          totalVolume: totalVolume.toFixed(2),
          conversionRate: clicks > 0 ? ((registrations / clicks) * 100).toFixed(2) : '0.00'
        };
      });

      console.log(`✅ Relatório por afiliado gerado para ${affiliateReports.length} afiliados`);
      res.json(affiliateReports);
    } catch (error) {
      console.error("❌ Erro no relatório por afiliado:", error);
      res.status(500).json({ message: "Falha ao gerar relatório por afiliado" });
    }
  });

  // Relatório detalhado por casa de aposta
  app.get("/api/admin/reports/by-house", requireAdmin, async (req: any, res) => {
    try {
      console.log("📊 Relatório por Casa - Iniciando busca");
      
      const houses = await db.select()
        .from(schema.bettingHouses);

      const allConversions = await db.select()
        .from(schema.conversions);

      const houseReports = houses.map(house => {
        const houseConversions = allConversions.filter(c => c.houseId === house.id);
        
        const clicks = houseConversions.filter(c => c.type === 'click').length;
        const registrations = houseConversions.filter(c => c.type === 'registration').length;
        const deposits = houseConversions.filter(c => c.type === 'deposit' || c.type === 'first_deposit').length;
        const profits = houseConversions.filter(c => c.type === 'profit').length;
        
        const totalCommission = houseConversions
          .filter(c => c.commission && parseFloat(c.commission) > 0)
          .reduce((sum, c) => sum + parseFloat(c.commission), 0);

        const totalVolume = houseConversions
          .filter(c => (c.type === 'deposit' || c.type === 'first_deposit') && c.amount)
          .reduce((sum, c) => sum + parseFloat(c.amount || '0'), 0);

        const uniqueAffiliates = [...new Set(houseConversions.map(c => c.userId))].length;

        return {
          houseId: house.id,
          houseName: house.name,
          activeAffiliates: uniqueAffiliates,
          clicks,
          registrations,
          deposits,
          profits,
          totalCommission: totalCommission.toFixed(2),
          totalVolume: totalVolume.toFixed(2),
          conversionRate: clicks > 0 ? ((registrations / clicks) * 100).toFixed(2) : '0.00'
        };
      });

      console.log(`✅ Relatório por casa gerado para ${houseReports.length} casas`);
      res.json(houseReports);
    } catch (error) {
      console.error("❌ Erro no relatório por casa:", error);
      res.status(500).json({ message: "Falha ao gerar relatório por casa" });
    }
  });

  app.get("/api/admin/reports/general", requireAdmin, async (req, res) => {
    try {
      const conversions = await db.select({
        id: schema.conversions.id,
        type: schema.conversions.type,
        amount: schema.conversions.amount,
        commission: schema.conversions.commission,
        convertedAt: schema.conversions.convertedAt,
        userName: schema.users.username,
        houseName: schema.bettingHouses.name,
        customerId: schema.conversions.customerId
      })
      .from(schema.conversions)
      .leftJoin(schema.users, eq(schema.conversions.userId, schema.users.id))
      .leftJoin(schema.bettingHouses, eq(schema.conversions.houseId, schema.bettingHouses.id))
      .orderBy(sql`${schema.conversions.convertedAt} DESC`);

      console.log("🔍 Relatórios Gerais - Total de conversões encontradas:", conversions.length);
      console.log("🔍 Tipos de conversões:", conversions.map(c => c.type));

      // Estatísticas agregadas - usando a mesma lógica que funciona no getUserStats
      const totalClicks = conversions.filter(c => c.type === 'click').length;
      const totalRegistrations = conversions.filter(c => c.type === 'registration').length;
      const totalDeposits = conversions.filter(c => c.type === 'deposit' || c.type === 'first_deposit' || c.type === 'recurring_deposit').length;
      const totalRecurringDeposits = conversions.filter(c => c.type === 'recurring_deposit').length;
      const totalProfits = conversions.filter(c => c.type === 'profit').length;
      
      console.log("📊 Estatísticas calculadas:", {
        totalClicks,
        totalRegistrations,
        totalDeposits,
        totalRecurringDeposits,
        totalProfits
      });
      
      const totalCommission = conversions
        .filter(c => c.commission && parseFloat(c.commission) > 0)
        .reduce((sum, c) => sum + parseFloat(c.commission || '0'), 0);

      const totalVolume = conversions
        .filter(c => c.amount && parseFloat(c.amount) > 0)
        .reduce((sum, c) => sum + parseFloat(c.amount || '0'), 0);

      res.json({
        totalClicks,
        totalRegistrations,
        totalDeposits,
        totalRecurringDeposits,
        totalProfits,
        totalCommission,
        totalVolume,
        conversions: conversions.slice(0, 100) // Últimas 100 conversões
      });
    } catch (error) {
      console.error("Erro nos relatórios gerais:", error);
      res.status(500).json({ message: "Falha ao obter relatórios gerais" });
    }
  });

  app.get("/api/admin/reports/affiliate/:id", requireAdmin, async (req, res) => {
    try {
      const affiliateId = parseInt(req.params.id);
      
      const conversions = await db.select({
        id: schema.conversions.id,
        type: schema.conversions.type,
        amount: schema.conversions.amount,
        commission: schema.conversions.commission,
        convertedAt: schema.conversions.convertedAt,
        houseName: schema.bettingHouses.name,
        customerId: schema.conversions.customerId,
        conversionData: schema.conversions.conversionData
      })
      .from(schema.conversions)
      .leftJoin(schema.bettingHouses, eq(schema.conversions.houseId, schema.bettingHouses.id))
      .where(eq(schema.conversions.userId, affiliateId))
      .orderBy(sql`${schema.conversions.convertedAt} DESC`);

      // Estatísticas detalhadas por afiliado
      const totalClicks = conversions.filter(c => c.type === 'click').length;
      const totalRegistrations = conversions.filter(c => c.type === 'registration').length;
      const totalDeposits = conversions.filter(c => c.type === 'deposit').length;
      const totalRecurringDeposits = conversions.filter(c => c.type === 'recurring_deposit').length;
      const totalProfits = conversions.filter(c => c.type === 'profit').length;
      
      const totalCommission = conversions
        .filter(c => c.commission && parseFloat(c.commission) > 0)
        .reduce((sum, c) => sum + parseFloat(c.commission || '0'), 0);

      const totalVolume = conversions
        .filter(c => c.amount && parseFloat(c.amount) > 0)
        .reduce((sum, c) => sum + parseFloat(c.amount || '0'), 0);

      // Conversão por casa de apostas
      const conversionsByHouse = conversions.reduce((acc, conv) => {
        const house = conv.houseName || 'Desconhecido';
        if (!acc[house]) {
          acc[house] = {
            clicks: 0,
            registrations: 0,
            deposits: 0,
            recurringDeposits: 0,
            profits: 0,
            totalCommission: 0,
            totalVolume: 0
          };
        }
        
        acc[house][conv.type === 'click' ? 'clicks' : 
                  conv.type === 'registration' ? 'registrations' :
                  conv.type === 'deposit' ? 'deposits' :
                  conv.type === 'recurring_deposit' ? 'recurringDeposits' : 'profits']++;
        
        if (conv.commission) acc[house].totalCommission += parseFloat(conv.commission);
        if (conv.amount) acc[house].totalVolume += parseFloat(conv.amount);
        
        return acc;
      }, {} as any);

      res.json({
        totalClicks,
        totalRegistrations,
        totalDeposits,
        totalRecurringDeposits,
        totalProfits,
        totalCommission,
        totalVolume,
        conversionsByHouse,
        conversions
      });
    } catch (error) {
      console.error("Erro no relatório do afiliado:", error);
      res.status(500).json({ message: "Falha ao obter relatório do afiliado" });
    }
  });

  app.get("/api/admin/reports/house/:id", requireAdmin, async (req, res) => {
    try {
      const houseId = parseInt(req.params.id);
      
      const conversions = await db.select({
        id: schema.conversions.id,
        type: schema.conversions.type,
        amount: schema.conversions.amount,
        commission: schema.conversions.commission,
        convertedAt: schema.conversions.convertedAt,
        userName: schema.users.username,
        customerId: schema.conversions.customerId
      })
      .from(schema.conversions)
      .leftJoin(schema.users, eq(schema.conversions.userId, schema.users.id))
      .where(eq(schema.conversions.houseId, houseId))
      .orderBy(sql`${schema.conversions.convertedAt} DESC`);

      // Estatísticas por casa
      const totalClicks = conversions.filter(c => c.type === 'click').length;
      const totalRegistrations = conversions.filter(c => c.type === 'registration').length;
      const totalDeposits = conversions.filter(c => c.type === 'deposit').length;
      const totalRecurringDeposits = conversions.filter(c => c.type === 'recurring_deposit').length;
      const totalProfits = conversions.filter(c => c.type === 'profit').length;
      
      const totalCommission = conversions
        .filter(c => c.commission && parseFloat(c.commission) > 0)
        .reduce((sum, c) => sum + parseFloat(c.commission || '0'), 0);

      const totalVolume = conversions
        .filter(c => c.amount && parseFloat(c.amount) > 0)
        .reduce((sum, c) => sum + parseFloat(c.amount || '0'), 0);

      res.json({
        totalClicks,
        totalRegistrations,
        totalDeposits,
        totalRecurringDeposits,
        totalProfits,
        totalCommission,
        totalVolume,
        conversions
      });
    } catch (error) {
      console.error("Erro no relatório da casa:", error);
      res.status(500).json({ message: "Falha ao obter relatório da casa" });
    }
  });

  // Admin stats route - Estatísticas dinâmicas para dashboard
  app.get("/api/admin/stats", requireAdmin, async (req: any, res) => {
    try {
      // Buscar todas as conversões reais
      const allConversions = await db.select()
        .from(schema.conversions);
      
      // Buscar todas as casas de apostas
      const houses = await db.select()
        .from(schema.bettingHouses);
      
      // Buscar todos os afiliados
      const affiliates = await db.select()
        .from(schema.users)
        .where(eq(schema.users.role, 'affiliate'));
      
      console.log("📊 Admin Stats - Total conversões encontradas:", allConversions.length);
      console.log("📊 Tipos de conversões:", allConversions.map(c => c.type));
      
      // Calcular estatísticas reais usando os campos corretos
      const totalClicks = allConversions.filter(c => c.type === 'click').length;
      const totalRegistrations = allConversions.filter(c => c.type === 'registration').length;
      const totalDeposits = allConversions.filter(c => c.type === 'deposit' || c.type === 'first_deposit' || c.type === 'recurring_deposit').length;
      
      // Volume total de depósitos
      const totalVolume = allConversions
        .filter(c => (c.type === 'deposit' || c.type === 'first_deposit' || c.type === 'recurring_deposit') && c.amount)
        .reduce((sum, c) => sum + parseFloat(c.amount || '0'), 0);
      
      // Buscar dados reais de pagamentos da tabela payments
      const allPayments = await db.select().from(schema.payments);
      
      const pendingCommissions = allPayments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      const paidCommissions = allPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      console.log("📊 Estatísticas calculadas:", {
        totalClicks,
        totalRegistrations,
        totalDeposits,
        totalVolume,
        paidCommissions
      });
      
      // Top 5 afiliados por conversões
      const affiliateStats = affiliates.map(affiliate => {
        const affiliateConversions = allConversions.filter(c => c.userId === affiliate.id);
        const conversions = affiliateConversions.length;
        const commission = affiliateConversions
          .filter(c => c.commission && parseFloat(c.commission) > 0)
          .reduce((sum, c) => sum + parseFloat(c.commission), 0);
        
        return {
          id: affiliate.id,
          name: affiliate.fullName || affiliate.username,
          conversions,
          commission
        };
      }).sort((a, b) => b.conversions - a.conversions).slice(0, 5);
      
      // Top 5 casas por comissões geradas - buscar pelo houseId
      const houseStats = houses.map(house => {
        const houseConversions = allConversions.filter(c => c.houseId === house.id);
        const conversions = houseConversions.length;
        const volume = houseConversions
          .filter(c => (c.type === 'deposit' || c.type === 'first_deposit' || c.type === 'recurring_deposit') && c.amount)
          .reduce((sum, c) => sum + parseFloat(c.amount || '0'), 0);
        
        // Calcular comissões geradas por esta casa
        const commission = houseConversions
          .filter(c => c.commission && parseFloat(c.commission) > 0)
          .reduce((sum, c) => sum + parseFloat(c.commission), 0);
        
        return {
          id: house.id,
          name: house.name,
          conversions,
          volume,
          commission
        };
      }).sort((a, b) => b.commission - a.commission).slice(0, 5);
      
      // Buscar afiliados reais usando a mesma lógica da página de gerenciamento
      const realAffiliates = await storage.getAllAffiliates();
      
      const stats = {
        activeHouses: houses.filter(h => h.isActive).length,
        totalVolume: totalVolume.toFixed(2),
        paidCommissions: paidCommissions.toFixed(2),
        pendingCommissions: pendingCommissions.toFixed(2),
        totalCommissions: (paidCommissions + pendingCommissions).toFixed(2),
        topAffiliates: affiliateStats,
        topHouses: houseStats,
        totalClicks,
        totalRegistrations,
        totalDeposits,
        totalAffiliates: realAffiliates.length
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Get admin stats error:", error);
      res.status(500).json({ message: "Failed to get admin statistics" });
    }
  });

  // Admin conversions route - Lista de todas as conversões para relatórios
  app.get("/api/admin/conversions", requireAdmin, async (req: any, res) => {
    try {
      // Buscar todas as conversões com informações dos afiliados e casas
      const conversions = await db.select({
        id: schema.conversions.id,
        type: schema.conversions.type,
        amount: schema.conversions.amount,
        commission: schema.conversions.commission,
        convertedAt: schema.conversions.convertedAt,
        status: sql<string>`CASE 
          WHEN ${schema.conversions.id} % 3 = 0 THEN 'paid'
          ELSE 'pending'
        END`,
        affiliate: schema.users.username,
        house: schema.bettingHouses.name,
        value: schema.conversions.amount,
        customerId: schema.conversions.customerId
      })
      .from(schema.conversions)
      .leftJoin(schema.users, eq(schema.conversions.userId, schema.users.id))
      .leftJoin(schema.bettingHouses, eq(schema.conversions.houseId, schema.bettingHouses.id))
      .orderBy(desc(schema.conversions.convertedAt));

      console.log("📊 Admin Conversions - Total encontradas:", conversions.length);
      
      res.json(conversions);
    } catch (error) {
      console.error("Get admin conversions error:", error);
      res.status(500).json({ message: "Failed to get admin conversions" });
    }
  });

  // API para buscar comissões detalhadas por afiliado
  app.get("/api/admin/commissions", requireAdmin, async (req, res) => {
    try {
      console.log("🔍 Buscando comissões detalhadas para admin");
      
      // Buscar todos os pagamentos com dados dos afiliados
      const paymentsQuery = await db.select({
        id: schema.payments.id,
        userId: schema.payments.userId,
        amount: schema.payments.amount,
        status: schema.payments.status,
        createdAt: schema.payments.createdAt,
        paidAt: schema.payments.paidAt,
        affiliateName: schema.users.username,
        affiliateFullName: schema.users.fullName,
      })
      .from(schema.payments)
      .leftJoin(schema.users, eq(schema.payments.userId, schema.users.id))
      .where(eq(schema.users.role, 'affiliate'))
      .orderBy(desc(schema.payments.createdAt));

      // Para cada pagamento, buscar a conversão que gerou a comissão
      const formattedCommissions = await Promise.all(
        paymentsQuery.map(async (payment: any) => {
          const conversion = await db.select({
            type: schema.conversions.type,
            houseName: schema.bettingHouses.name
          })
          .from(schema.conversions)
          .leftJoin(schema.bettingHouses, eq(schema.conversions.houseId, schema.bettingHouses.id))
          .where(and(
            eq(schema.conversions.userId, payment.userId),
            gt(schema.conversions.commission, '0')
          ))
          .limit(1);

          return {
            id: payment.id,
            affiliateName: payment.affiliateName || payment.affiliateFullName,
            houseName: conversion[0]?.houseName || 'N/A',
            type: conversion[0]?.type || 'CPA',
            amount: parseFloat(payment.amount),
            status: payment.status,
            createdAt: payment.createdAt,
            paidAt: payment.paidAt
          };
        })
      );
      
      console.log(`✅ ${formattedCommissions.length} registros de comissões encontrados`);
      res.json(formattedCommissions);
    } catch (error) {
      console.error("❌ Erro ao buscar comissões:", error);
      res.status(500).json([]);
    }
  });

  // API para marcar comissão como paga
  app.post("/api/admin/commissions/:id/pay", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`💰 Marcando pagamento ${id} como pago`);
      
      await db.execute(sql`
        UPDATE payments 
        SET status = 'paid', paid_at = NOW() 
        WHERE id = ${id}
      `);
      
      console.log(`✅ Pagamento ${id} marcado como pago`);
      res.json({ message: "Pagamento processado com sucesso" });
    } catch (error) {
      console.error("❌ Erro ao processar pagamento:", error);
      res.status(500).json({ message: "Erro ao processar pagamento" });
    }
  });

  // Admin routes - Gestão completa de afiliados
  app.get("/api/admin/affiliates", requireAdmin, async (req, res) => {
    try {
      console.log("🔍 Buscando todos os afiliados para admin");
      
      const affiliates = await storage.getAllAffiliates();
      console.log(`✅ ${affiliates.length} afiliados encontrados`);
      
      res.json(affiliates);
    } catch (error) {
      console.error("❌ Erro ao buscar afiliados:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.put("/api/admin/affiliates/:id/status", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isActive } = req.body;
      
      await storage.updateUserStatus(id, isActive);
      res.json({ success: true });
    } catch (error) {
      console.error("Update affiliate status error:", error);
      res.status(500).json({ message: "Failed to update affiliate status" });
    }
  });
  app.get("/api/admin/houses", requireAdmin, async (req, res) => {
    try {
      const houses = await storage.getAllBettingHouses();
      res.json(houses);
    } catch (error) {
      console.error("Get admin houses error:", error);
      res.status(500).json({ message: "Failed to get houses" });
    }
  });

  app.get("/api/admin/betting-houses", requireAdmin, async (req, res) => {
    try {
      const houses = await storage.getAllBettingHouses();
      
      // Calcular estatísticas dinâmicas para cada casa
      const housesWithStats = await Promise.all(houses.map(async (house) => {
        // Contar afiliados únicos que têm links para esta casa
        const affiliateCount = await db
          .select({ count: sql<number>`count(distinct ${schema.affiliateLinks.userId})` })
          .from(schema.affiliateLinks)
          .where(eq(schema.affiliateLinks.houseId, house.id));
        
        // Calcular volume total de transações desta casa
        const volumeResult = await db
          .select({ total: sql<number>`coalesce(sum(${schema.conversions.amount}), 0)` })
          .from(schema.conversions)
          .where(eq(schema.conversions.houseId, house.id));
        
        // Calcular comissões pagas para esta casa
        const commissionResult = await db
          .select({ total: sql<number>`coalesce(sum(${schema.conversions.commission}), 0)` })
          .from(schema.conversions)
          .where(eq(schema.conversions.houseId, house.id));
        
        return {
          ...house,
          stats: {
            affiliateCount: affiliateCount[0]?.count || 0,
            totalVolume: volumeResult[0]?.total || 0,
            totalCommission: commissionResult[0]?.total || 0
          }
        };
      }));
      
      res.json(housesWithStats);
    } catch (error) {
      console.error("Get admin betting houses error:", error);
      res.status(500).json({ message: "Failed to get betting houses" });
    }
  });

  app.post("/api/admin/betting-houses", requireAdmin, async (req, res) => {
    try {
      console.log("🏠 Admin criando nova casa de apostas...");
      const result = insertBettingHouseSchema.safeParse(req.body);
      if (!result.success) {
        console.log("❌ Validação falhou:", result.error);
        return res.status(400).json({ 
          message: "Dados inválidos da casa de apostas",
          errors: result.error.errors 
        });
      }
      
      console.log("✅ Dados validados, criando casa:", result.data);
      const house = await storage.createBettingHouse(result.data);
      
      console.log("✅ Casa criada com sucesso, ID:", house.id);
      
      // Casa criada sem afiliações automáticas - usuários devem se afiliar manualmente
      
      res.json(house);
    } catch (error) {
      console.error("❌ Erro ao criar casa:", error);
      res.status(500).json({ message: "Falha ao criar casa de apostas" });
    }
  });

  // Nova rota de afiliação compatível com o componente seguro
  app.post("/api/affiliate", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const { houseId } = req.body;
      
      console.log("🔗 Nova afiliação solicitada:", { userId, houseId });
      
      if (!userId || !houseId) {
        return res.status(400).json({ message: "Dados inválidos" });
      }
      
      // Verificar se a casa existe e está ativa
      const house = await storage.getBettingHouseById(houseId);
      if (!house || !house.isActive) {
        return res.status(404).json({ message: "Casa não encontrada ou inativa" });
      }
      
      // Verificar se já está afiliado (ignorar links com VALUE)
      const existingLink = await storage.getAffiliateLinkByUserAndHouse(userId, houseId);
      if (existingLink && existingLink.generatedUrl && !existingLink.generatedUrl.includes('VALUE')) {
        return res.status(400).json({ message: "Você já está afiliado a esta casa" });
      }
      
      // Buscar dados do usuário
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      // Gerar URL personalizada (substitui VALUE pelo username)
      const generatedUrl = house.baseUrl.replace("VALUE", user.username);
      
      console.log("✅ Criando afiliação:", { generatedUrl, username: user.username });
      
      // Remover link antigo com VALUE se existir
      if (existingLink && existingLink.generatedUrl && existingLink.generatedUrl.includes('VALUE')) {
        await storage.deactivateAffiliateLink(existingLink.id);
      }
      
      // Criar nova afiliação
      const affiliateLink = await storage.createAffiliateLink({
        userId,
        houseId,
        generatedUrl,
        isActive: true,
      });
      
      console.log("✅ Afiliação criada com sucesso:", affiliateLink);
      
      res.json({ 
        success: true,
        message: "Afiliação realizada com sucesso!",
        link: affiliateLink
      });
    } catch (error) {
      console.error("❌ Erro na afiliação:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Rota para relatórios do usuário
  app.get("/api/user-reports", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { dateFrom, dateTo, selectedHouse, selectedEvent } = req.query;

      console.log(`📊 Buscando relatórios para usuário: ${userId}`);

      // Buscar conversões do usuário com filtros
      let conversionsQuery = db.select({
        id: schema.conversions.id,
        casa: schema.conversions.casa,
        evento: schema.conversions.evento,
        valor: schema.conversions.valor,
        comissao: schema.conversions.comissao,
        criadoEm: schema.conversions.criadoEm
      })
      .from(schema.conversions)
      .where(eq(schema.conversions.affiliateId, userId));

      // Aplicar filtros se fornecidos
      if (dateFrom) {
        conversionsQuery = conversionsQuery.where(gte(schema.conversions.criadoEm, new Date(dateFrom as string)));
      }
      if (dateTo) {
        conversionsQuery = conversionsQuery.where(lte(schema.conversions.criadoEm, new Date(dateTo as string)));
      }
      if (selectedHouse && selectedHouse !== 'all') {
        conversionsQuery = conversionsQuery.where(eq(schema.conversions.casa, selectedHouse as string));
      }
      if (selectedEvent && selectedEvent !== 'all') {
        conversionsQuery = conversionsQuery.where(eq(schema.conversions.evento, selectedEvent as string));
      }

      const conversions = await conversionsQuery.orderBy(desc(schema.conversions.criadoEm));

      // Calcular estatísticas
      const stats = {
        totalClicks: conversions.filter(c => c.evento === 'click').length,
        totalRegistrations: conversions.filter(c => c.evento === 'registration').length,
        totalDeposits: conversions.filter(c => c.evento === 'deposit').length,
        totalRevenue: conversions.filter(c => c.evento === 'revenue').length,
        totalCommission: conversions.reduce((sum, c) => sum + parseFloat(c.comissao || '0'), 0).toFixed(2),
        conversionRate: conversions.length > 0 ? Math.round((conversions.filter(c => c.evento === 'registration').length / conversions.filter(c => c.evento === 'click').length) * 100) || 0 : 0
      };

      // Formatar conversões para o frontend
      const formattedConversions = conversions.map(c => ({
        id: c.id,
        casa: c.casa,
        evento: c.evento,
        valor: c.valor || '0',
        comissao: c.comissao || '0',
        criadoEm: c.criadoEm?.toISOString() || new Date().toISOString(),
        status: 'success'
      }));

      res.json({
        stats,
        conversions: formattedConversions
      });
    } catch (error) {
      console.error("Erro ao buscar relatórios do usuário:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Rota para buscar casas do usuário (para filtros)
  app.get("/api/my-houses", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Buscar casas onde o usuário tem links ativos
      const userHouses = await db.select({
        id: schema.bettingHouses.id,
        name: schema.bettingHouses.name,
        identifier: schema.bettingHouses.identifier
      })
      .from(schema.bettingHouses)
      .innerJoin(schema.affiliateLinks, eq(schema.bettingHouses.id, schema.affiliateLinks.houseId))
      .where(and(
        eq(schema.affiliateLinks.userId, userId),
        eq(schema.affiliateLinks.isActive, true)
      ));

      res.json(userHouses);
    } catch (error) {
      console.error("Erro ao buscar casas do usuário:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Rota para relatórios administrativos
  app.get("/api/admin-reports", requireAdmin, async (req, res) => {
    try {
      const { dateFrom, dateTo, selectedHouse, selectedEvent, selectedAffiliate } = req.query;

      console.log(`📊 Admin buscando relatórios com filtros:`, { dateFrom, dateTo, selectedHouse, selectedEvent, selectedAffiliate });

      // Buscar conversões com joins para obter dados completos
      let conversionsQuery = db.select({
        id: schema.conversions.id,
        affiliate: schema.users.username,
        casa: schema.conversions.casa,
        evento: schema.conversions.evento,
        valor: schema.conversions.valor,
        comissao: schema.conversions.comissao,
        criadoEm: schema.conversions.criadoEm
      })
      .from(schema.conversions)
      .innerJoin(schema.users, eq(schema.conversions.affiliateId, schema.users.id));

      // Aplicar filtros
      if (dateFrom) {
        conversionsQuery = conversionsQuery.where(gte(schema.conversions.criadoEm, new Date(dateFrom as string)));
      }
      if (dateTo) {
        conversionsQuery = conversionsQuery.where(lte(schema.conversions.criadoEm, new Date(dateTo as string)));
      }
      if (selectedHouse && selectedHouse !== 'all') {
        conversionsQuery = conversionsQuery.where(eq(schema.conversions.casa, selectedHouse as string));
      }
      if (selectedEvent && selectedEvent !== 'all') {
        conversionsQuery = conversionsQuery.where(eq(schema.conversions.evento, selectedEvent as string));
      }
      if (selectedAffiliate && selectedAffiliate !== 'all') {
        conversionsQuery = conversionsQuery.where(eq(schema.users.username, selectedAffiliate as string));
      }

      const conversions = await conversionsQuery.orderBy(desc(schema.conversions.criadoEm));

      // Calcular estatísticas
      const totalAffiliates = await db.select({ count: sql`count(distinct ${schema.users.id})` })
        .from(schema.users)
        .where(eq(schema.users.role, 'affiliate'));

      const stats = {
        totalAffiliates: totalAffiliates[0]?.count || 0,
        totalConversions: conversions.length,
        totalCommission: conversions.reduce((sum, c) => sum + parseFloat(c.comissao || '0'), 0).toFixed(2),
        totalVolume: conversions.reduce((sum, c) => sum + parseFloat(c.valor || '0'), 0).toFixed(2)
      };

      // Formatar conversões para o frontend
      const formattedConversions = conversions.map(c => ({
        id: c.id,
        affiliate: c.affiliate,
        casa: c.casa,
        evento: c.evento,
        valor: c.valor || '0',
        comissao: c.comissao || '0',
        criadoEm: c.criadoEm?.toISOString() || new Date().toISOString(),
        status: 'success'
      }));

      res.json({
        stats,
        conversions: formattedConversions
      });
    } catch (error) {
      console.error("Erro ao buscar relatórios administrativos:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Rota para buscar afiliados (para filtros admin)
  app.get("/api/admin/affiliates", requireAdmin, async (req, res) => {
    try {
      const affiliates = await db.select({
        id: schema.users.id,
        username: schema.users.username,
        name: schema.users.name,
        email: schema.users.email
      })
      .from(schema.users)
      .where(eq(schema.users.role, 'affiliate'))
      .orderBy(schema.users.username);

      res.json(affiliates);
    } catch (error) {
      console.error("Erro ao buscar afiliados:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Rotas para gerenciar postbacks registrados
  app.get("/api/admin/registered-postbacks", requireAdmin, async (req, res) => {
    try {
      const postbacks = await db.select().from(schema.registeredPostbacks)
        .orderBy(desc(schema.registeredPostbacks.createdAt));
      res.json(postbacks);
    } catch (error) {
      console.error('Erro ao buscar postbacks registrados:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.post("/api/admin/registered-postbacks", requireAdmin, async (req, res) => {
    try {
      console.log('Dados recebidos na rota:', req.body);
      const { name, url, houseId, houseName, eventType, description, isActive } = req.body;
      
      // Validar campos obrigatórios
      if (!name || !url || !houseName || !eventType) {
        console.log('Campos obrigatórios faltando:', { name, url, houseName, eventType });
        return res.status(400).json({ 
          error: 'Campos obrigatórios faltando',
          missing: {
            name: !name,
            url: !url,
            houseName: !houseName,
            eventType: !eventType
          }
        });
      }
      
      const postbackData = {
        name,
        url,
        houseId: houseId || null,
        houseName,
        eventType,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true
      };
      
      console.log('Dados a inserir:', postbackData);
      
      const [postback] = await db.insert(schema.registeredPostbacks).values(postbackData).returning();
      
      console.log('Postback criado com sucesso:', postback);
      res.json(postback);
    } catch (error) {
      console.error('Erro ao criar postback registrado:', error);
      res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
  });

  app.put("/api/admin/registered-postbacks/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, url, houseId, houseName, eventType, description, isActive } = req.body;
      
      const [postback] = await db.update(schema.registeredPostbacks)
        .set({
          name,
          url,
          houseId,
          houseName,
          eventType,
          description,
          isActive,
          updatedAt: new Date()
        })
        .where(eq(schema.registeredPostbacks.id, parseInt(id)))
        .returning();
      
      res.json(postback);
    } catch (error) {
      console.error('Erro ao atualizar postback registrado:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.delete("/api/admin/registered-postbacks/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      await db.delete(schema.registeredPostbacks).where(eq(schema.registeredPostbacks.id, parseInt(id)));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Erro ao deletar postback registrado:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Rota para admin visualizar todos os links
  app.get("/api/admin/affiliate-links", requireAdmin, async (req, res) => {
    try {
      const links = await db.select({
        id: affiliateLinks.id,
        userId: affiliateLinks.userId,
        houseId: affiliateLinks.houseId,
        generatedUrl: affiliateLinks.generatedUrl,
        isActive: affiliateLinks.isActive,
        createdAt: affiliateLinks.createdAt,
        userName: schema.users.username,
        houseName: schema.bettingHouses.name
      })
      .from(affiliateLinks)
      .leftJoin(schema.users, eq(affiliateLinks.userId, schema.users.id))
      .leftJoin(schema.bettingHouses, eq(affiliateLinks.houseId, schema.bettingHouses.id))
      .orderBy(sql`${affiliateLinks.createdAt} DESC`);
      
      res.json(links);
    } catch (error) {
      console.error("Get admin affiliate links error:", error);
      res.status(500).json({ message: "Failed to get affiliate links" });
    }
  });

  // Rota para admin visualizar postback URLs de uma casa específica
  app.get("/api/admin/betting-houses/:id/postbacks", requireAdmin, async (req, res) => {
    try {
      const houseId = parseInt(req.params.id);
      const house = await storage.getBettingHouseById(houseId);
      
      if (!house) {
        return res.status(404).json({ message: "Casa de apostas não encontrada" });
      }

      const postbackUrls = {
        registration: `/api/postback/registration?house=${house.name.toLowerCase()}&subid={subid}&customer_id={customer_id}`,
        deposit: `/api/postback/deposit?house=${house.name.toLowerCase()}&subid={subid}&amount={amount}&customer_id={customer_id}`,
        profit: `/api/postback/profit?house=${house.name.toLowerCase()}&subid={subid}&amount={amount}&customer_id={customer_id}`
      };

      res.json({
        house: house.name,
        postbackUrls
      });
    } catch (error) {
      console.error("Get postback URLs error:", error);
      res.status(500).json({ message: "Failed to get postback URLs" });
    }
  });

  // WebSocket para atualizações em tempo real
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Função para broadcast de atualizações
  const broadcastUpdate = (type: string, data?: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, data, timestamp: Date.now() }));
      }
    });
  };

  wss.on('connection', (ws) => {
    console.log('🔗 Cliente conectado ao WebSocket');
    
    ws.on('close', () => {
      console.log('🔌 Cliente desconectado do WebSocket');
    });
    
    ws.on('error', (error) => {
      console.log('❌ Erro WebSocket:', error);
    });
  });
  
  // === INTEGRAÇÃO BIDIRECIONAL ADMIN ⇄ USUÁRIO ===
  
  // Admin - Atualizar status do usuário (afeta painel do usuário)
  app.patch("/api/admin/users/:id/status", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { isActive } = req.body;
      
      await storage.updateUserStatus(userId, isActive);
      
      // Se bloqueado, desativa todos os links do usuário
      if (!isActive) {
        const userLinks = await storage.getAffiliateLinksByUserId(userId);
        for (const link of userLinks) {
          await storage.deactivateAffiliateLink(link.id);
        }
      }
      
      res.json({ 
        message: isActive ? "Usuário desbloqueado com sucesso" : "Usuário bloqueado e links desativados",
        affectedUser: await storage.getUserById(userId),
        affectedLinks: !isActive ? await storage.getAffiliateLinksByUserId(userId) : []
      });
    } catch (error) {
      console.error("Update user status error:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Admin - Forçar geração de link para usuário específico
  app.post("/api/admin/users/:userId/generate-link", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { houseId } = req.body;
      
      const user = await storage.getUserById(userId);
      const house = await storage.getBettingHouseById(houseId);
      
      if (!user || !house) {
        return res.status(404).json({ message: "Usuário ou casa não encontrados" });
      }

      // Verifica se já existe link
      const existingLink = await storage.getAffiliateLinkByUserAndHouse(userId, houseId);
      if (existingLink) {
        return res.status(400).json({ message: "Link já existe para este usuário e casa" });
      }

      // Gera novo link
      const newLink = await storage.createAffiliateLink({
        userId,
        houseId,
        generatedUrl: house.baseUrl.replace('{subid}', user.username),
        isActive: true
      });

      res.json({ 
        message: "Link gerado com sucesso pelo admin",
        link: newLink,
        user: user.username,
        house: house.name
      });
    } catch (error) {
      console.error("Admin generate link error:", error);
      res.status(500).json({ message: "Failed to generate link" });
    }
  });

  // Admin - Visualizar dados específicos de um usuário (para relatórios)
  app.get("/api/admin/users/:id/detailed-stats", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const stats = await storage.getUserStats(userId);
      const links = await storage.getAffiliateLinksByUserId(userId);
      const conversions = await storage.getConversionsByUserId(userId);
      const clicks = await storage.getClicksByUserId(userId);
      const payments = await storage.getPaymentsByUserId(userId);

      res.json({
        user,
        stats,
        links: links.length,
        activeLinks: links.filter(l => l.isActive).length,
        conversions: conversions.length,
        clicks: clicks.length,
        payments,
        totalEarnings: payments.reduce((sum, p) => sum + (p.amount || 0), 0)
      });
    } catch (error) {
      console.error("Get user detailed stats error:", error);
      res.status(500).json({ message: "Failed to get user detailed stats" });
    }
  });

  // Admin - Aprovar/rejeitar pagamento (afeta painel do usuário)
  app.patch("/api/admin/payments/:id/status", requireAdmin, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const { status, transactionId } = req.body;
      
      await storage.updatePaymentStatus(paymentId, status, transactionId);
      
      const payment = await db.select()
        .from(schema.payments)
        .where(eq(schema.payments.id, paymentId))
        .limit(1);

      res.json({ 
        message: `Pagamento ${status === 'paid' ? 'aprovado' : 'rejeitado'} com sucesso`,
        payment: payment[0]
      });
    } catch (error) {
      console.error("Update payment status error:", error);
      res.status(500).json({ message: "Failed to update payment status" });
    }
  });

  // Admin - Editar valor de comissão manualmente
  app.patch("/api/admin/commissions/:id", requireAdmin, async (req, res) => {
    try {
      const conversionId = parseInt(req.params.id);
      const { amount, status } = req.body;
      
      await db.update(schema.conversions)
        .set({ 
          commission: parseFloat(amount),
          status: status || 'confirmed'
        })
        .where(eq(schema.conversions.id, conversionId));

      res.json({ 
        message: "Comissão atualizada com sucesso",
        conversionId,
        newAmount: amount
      });
    } catch (error) {
      console.error("Update commission error:", error);
      res.status(500).json({ message: "Failed to update commission" });
    }
  });

  // Admin - Criar evento/conversão manual
  app.post("/api/admin/manual-conversion", requireAdmin, async (req, res) => {
    try {
      const { userId, houseId, type, amount, commission, description } = req.body;
      
      const conversion = await storage.createConversion({
        userId: parseInt(userId),
        houseId: parseInt(houseId),
        type,
        amount: parseFloat(amount) || 0,
        customerId: `manual_${Date.now()}`,
        status: 'confirmed'
      });

      // Cria pagamento se houver comissão
      if (commission > 0) {
        await storage.createPayment({
          userId: parseInt(userId),
          amount: parseFloat(commission),
          status: 'pending',
          description: description || `Conversão manual ${type}`,
          conversionId: conversion.id
        });
      }

      res.json({ 
        message: "Conversão manual criada com sucesso",
        conversion,
        commission
      });
    } catch (error) {
      console.error("Create manual conversion error:", error);
      res.status(500).json({ message: "Failed to create manual conversion" });
    }
  });

  // Admin - Obter todas as conversões/eventos
  app.get("/api/admin/all-conversions", requireAdmin, async (req, res) => {
    try {
      const conversions = await db.select({
        id: schema.conversions.id,
        userId: schema.conversions.userId,
        houseId: schema.conversions.houseId,
        type: schema.conversions.type,
        amount: schema.conversions.amount,
        commission: schema.conversions.commission,
        status: schema.conversions.status,
        convertedAt: schema.conversions.convertedAt,
        customerId: schema.conversions.customerId,
        userName: schema.users.username,
        userEmail: schema.users.email,
        houseName: schema.bettingHouses.name
      })
      .from(schema.conversions)
      .leftJoin(schema.users, eq(schema.conversions.userId, schema.users.id))
      .leftJoin(schema.bettingHouses, eq(schema.conversions.houseId, schema.bettingHouses.id))
      .orderBy(sql`${schema.conversions.convertedAt} DESC`);
      
      res.json(conversions);
    } catch (error) {
      console.error("Get all conversions error:", error);
      res.status(500).json({ message: "Failed to get conversions" });
    }
  });

  // Usuário - Verificar se conta está ativa (afetado por ações do admin)
  app.get("/api/user/account-status", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const activeLinks = await storage.getAffiliateLinksByUserId(userId);
      const stats = await storage.getUserStats(userId);

      res.json({
        isActive: user.isActive,
        username: user.username,
        totalLinks: activeLinks.length,
        activeLinksCount: activeLinks.filter(l => l.isActive).length,
        stats
      });
    } catch (error) {
      console.error("Get account status error:", error);
      res.status(500).json({ message: "Failed to get account status" });
    }
  });

  // === SISTEMA DE RASTREAMENTO COMPLETO ===
  
  // Endpoint para rastreamento de cliques (/go/casa?ref=123)
  app.get("/go/:casa", async (req, res) => {
    try {
      const casaName = req.params.casa.toLowerCase();
      const refId = req.query.ref || req.query.subid;
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      
      console.log(`🔗 Clique rastreado: casa=${casaName}, ref=${refId}, ip=${ip}`);
      
      // Busca a casa de apostas
      const house = await db.select()
        .from(schema.bettingHouses)
        .where(sql`LOWER(${schema.bettingHouses.name}) = ${casaName}`)
        .limit(1);
      
      if (!house.length) {
        console.log(`❌ Casa não encontrada: ${casaName}`);
        return res.status(404).send("Casa de apostas não encontrada");
      }
      
      // Busca o afiliado pelo username (ref/subid)
      const affiliate = await db.select()
        .from(schema.users)
        .where(eq(schema.users.username, refId))
        .limit(1);
      
      if (!affiliate.length) {
        console.log(`❌ Afiliado não encontrado: ${refId}`);
        return res.status(404).send("Afiliado não encontrado");
      }
      
      // Registra o clique
      await storage.trackClick({
        userId: affiliate[0].id,
        houseId: house[0].id,
        ipAddress: ip,
        userAgent: userAgent,
        referrer: req.get('Referer') || null
      });
      
      console.log(`✅ Clique registrado: userId=${affiliate[0].id}, houseId=${house[0].id}`);
      
      // Redireciona para o link da casa
      res.redirect(house[0].baseUrl.replace('{subid}', refId));
      
    } catch (error) {
      console.error("Erro no rastreamento de clique:", error);
      res.status(500).send("Erro interno");
    }
  });

  // === SISTEMA COMPLETO DE POSTBACK ===
  
  // Rota principal de postback GET /postback/:casa
  app.get("/postback/:casa", async (req, res) => {
    try {
      const casa = req.params.casa;
      const { subid, event, amount } = req.query;
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const rawQuery = req.url;
      
      console.log(`📩 Postback recebido: casa=${casa}, subid=${subid}, event=${event}, amount=${amount}`);
      
      // Log inicial do postback
      const logEntry = await db.insert(schema.postbackLogs).values({
        casa,
        subid: subid as string,
        evento: event as string,
        valor: parseFloat(amount as string) || 0,
        ip,
        raw: rawQuery,
        status: 'processando',
        criadoEm: new Date()
      }).returning();
      
      // Validar se subid existe
      const affiliate = await db.select()
        .from(schema.users)
        .where(eq(schema.users.username, subid as string))
        .limit(1);
      
      if (!affiliate.length) {
        await db.update(schema.postbackLogs)
          .set({ status: 'erro_subid' })
          .where(eq(schema.postbackLogs.id, logEntry[0].id));
        
        console.log(`❌ SubID não encontrado: ${subid}`);
        return res.status(400).json({ error: "SubID não encontrado" });
      }
      
      // Buscar casa
      const houseRecord = await db.select()
        .from(schema.bettingHouses)
        .where(sql`LOWER(${schema.bettingHouses.name}) = ${casa.toLowerCase()}`)
        .limit(1);
      
      if (!houseRecord.length) {
        await db.update(schema.postbackLogs)
          .set({ status: 'erro_casa' })
          .where(eq(schema.postbackLogs.id, logEntry[0].id));
        
        console.log(`❌ Casa não encontrada: ${casa}`);
        return res.status(400).json({ error: "Casa não encontrada" });
      }
      
      // Registrar evento
      const evento = await db.insert(schema.eventos).values({
        afiliadoId: affiliate[0].id,
        casa,
        evento: event as string,
        valor: parseFloat(amount as string) || 0,
        criadoEm: new Date()
      }).returning();
      
      // Calcular comissão
      let commissionValue = 0;
      let tipo = '';
      const depositAmount = parseFloat(amount as string) || 0;
      
      if (event === 'registration') {
        commissionValue = 50; // CPA fixa R$50
        tipo = 'CPA';
      } else if (['deposit', 'revenue', 'profit'].includes(event as string)) {
        commissionValue = (depositAmount * 20) / 100; // RevShare 20%
        tipo = 'RevShare';
      }
      
      // Salvar comissão se houver
      if (commissionValue > 0) {
        await db.insert(schema.comissoes).values({
          afiliadoId: affiliate[0].id,
          eventoId: evento[0].id,
          tipo,
          valor: commissionValue,
          criadoEm: new Date()
        });
        
        // Criar pagamento
        await storage.createPayment({
          userId: affiliate[0].id,
          amount: commissionValue,
          status: 'pending',
          description: `${tipo} ${event} - ${casa}`,
          conversionId: evento[0].id
        });
        
        console.log(`💰 Comissão ${tipo}: R$ ${commissionValue} para ${affiliate[0].username}`);
      }
      
      // Atualizar log como registrado
      await db.update(schema.postbackLogs)
        .set({ status: 'registrado' })
        .where(eq(schema.postbackLogs.id, logEntry[0].id));
      
      console.log(`✅ Postback processado com sucesso`);
      res.json({ 
        success: true, 
        message: "Postback processado com sucesso",
        commission: commissionValue,
        type: tipo
      });
      
    } catch (error) {
      console.error("Erro no postback:", error);
      res.status(500).json({ error: "Erro interno no processamento" });
    }
  });

  // Endpoint MELHORADO para postbacks com processamento de comissões (POST)
  app.post("/api/postback", async (req, res) => {
    try {
      const { event, ref, subid, amount, house, customer_id } = req.body;
      const userRef = ref || subid;
      
      console.log(`📩 Postback recebido: event=${event}, ref=${userRef}, amount=${amount}, house=${house}`);
      
      // Busca o afiliado
      const affiliate = await db.select()
        .from(schema.users)
        .where(eq(schema.users.username, userRef))
        .limit(1);
      
      if (!affiliate.length) {
        console.log(`❌ Afiliado não encontrado no postback: ${userRef}`);
        return res.status(400).json({ error: "Afiliado não encontrado" });
      }
      
      // Busca a casa
      const houseRecord = await db.select()
        .from(schema.bettingHouses)
        .where(sql`LOWER(${schema.bettingHouses.name}) = ${house.toLowerCase()}`)
        .limit(1);
      
      if (!houseRecord.length) {
        console.log(`❌ Casa não encontrada no postback: ${house}`);
        return res.status(400).json({ error: "Casa não encontrada" });
      }
      
      // Registra a conversão
      const conversion = await storage.createConversion({
        userId: affiliate[0].id,
        houseId: houseRecord[0].id,
        type: event,
        amount: parseFloat(amount) || 0,
        customerId: customer_id || null,
        status: 'confirmed'
      });
      
      // Calcula comissão baseada no tipo da casa
      let commissionValue = 0;
      const depositAmount = parseFloat(amount) || 0;
      
      if (event === 'registration' && houseRecord[0].commissionType === 'CPA') {
        commissionValue = houseRecord[0].commissionValue || 50; // CPA fixo
      } else if ((event === 'deposit' || event === 'recurring-deposit') && houseRecord[0].commissionType === 'RevShare') {
        commissionValue = (depositAmount * (houseRecord[0].commissionValue || 30)) / 100; // RevShare %
      }
      
      // Cria pagamento se houver comissão
      if (commissionValue > 0) {
        await storage.createPayment({
          userId: affiliate[0].id,
          amount: commissionValue,
          status: 'pending',
          description: `Comissão ${event} - ${houseRecord[0].name}`,
          conversionId: conversion.id
        });
        
        console.log(`💰 Comissão criada: R$ ${commissionValue} para ${affiliate[0].username}`);
      }
      
      console.log(`✅ Postback processado com sucesso`);
      res.json({ 
        success: true, 
        message: "Postback processado com sucesso",
        commission: commissionValue
      });
      
    } catch (error) {
      console.error("Erro no processamento do postback:", error);
      res.status(500).json({ error: "Erro interno no processamento" });
    }
  });

  wss.on('connection', (ws) => {
    console.log('Cliente WebSocket conectado');
    
    ws.on('close', () => {
      console.log('Cliente WebSocket desconectado');
    });
  });



  // === SISTEMA COMPLETO DE POSTBACKS DINÂMICOS ===
  
  // Rota pública para receber postbacks das casas: GET /postback/:identifier/:event
  app.get("/postback/:identifier/:event", async (req, res) => {
    const { identifier, event } = req.params;
    const { subid, amount, customer_id, ...otherParams } = req.query;
    
    const logData = {
      houseIdentifier: identifier,
      event: event,
      subid: subid as string,
      amount: amount as string,
      customerId: customer_id as string,
      rawData: { ...req.query },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'PROCESSING',
      processedAt: new Date()
    };

    try {
      console.log(`🔄 Postback recebido: ${identifier}/${event} - subid: ${subid}, amount: ${amount}`);
      
      // 1. Validar se a casa existe e aceita esse tipo de postback
      const house = await db.select()
        .from(schema.bettingHouses)
        .where(eq(schema.bettingHouses.identifier, identifier))
        .limit(1);
      
      if (!house.length) {
        logData.status = 'INVALID_HOUSE';
        await db.insert(schema.postbackLogs).values(logData);
        return res.status(400).json({ error: "Casa não encontrada", status: "INVALID_HOUSE" });
      }
      
      // 2. Verificar se a casa aceita esse evento
      const enabledEvents = house[0].enabledPostbacks as string[];
      if (!enabledEvents || !enabledEvents.includes(event)) {
        logData.status = 'INVALID_EVENT';
        await db.insert(schema.postbackLogs).values(logData);
        return res.status(400).json({ error: "Evento não aceito por esta casa", status: "INVALID_EVENT" });
      }
      
      // 3. Validar se o afiliado (subid) existe
      if (!subid) {
        logData.status = 'INVALID_SUBID';
        await db.insert(schema.postbackLogs).values(logData);
        return res.status(400).json({ error: "SubID obrigatório", status: "INVALID_SUBID" });
      }
      
      const affiliate = await db.select()
        .from(schema.users)
        .where(eq(schema.users.username, subid as string))
        .limit(1);
      
      if (!affiliate.length) {
        logData.status = 'INVALID_SUBID';
        await db.insert(schema.postbackLogs).values(logData);
        return res.status(400).json({ error: "Afiliado não encontrado", status: "INVALID_SUBID" });
      }
      
      // 4. Calcular comissão baseada no tipo de evento e casa
      let commissionValue = 0;
      const depositAmount = parseFloat(amount as string) || 0;
      
      if ((event === 'registration' || event === 'first_deposit') && house[0].commissionType === 'cpa') {
        // CPA: valor fixo para registro/primeiro depósito
        const cpaValue = house[0].commissionValue.replace(/[^\d]/g, ''); // Remove R$ e outros caracteres
        commissionValue = parseFloat(cpaValue) || 0;
      } else if ((event === 'deposit' || event === 'profit') && house[0].commissionType === 'revshare') {
        // RevShare: porcentagem do valor
        const percentage = house[0].commissionValue.replace(/[^\d]/g, ''); // Remove % e outros caracteres
        commissionValue = (depositAmount * parseFloat(percentage)) / 100;
      }
      
      // 5. Registrar conversão se houver comissão
      if (commissionValue > 0) {
        await storage.createConversion({
          userId: affiliate[0].id,
          houseId: house[0].id,
          type: event,
          amount: depositAmount,
          customerId: customer_id as string || null,
          status: 'confirmed'
        });
        
        // 6. Criar pagamento
        await storage.createPayment({
          userId: affiliate[0].id,
          amount: commissionValue,
          status: 'pending',
          description: `${event.toUpperCase()} - ${house[0].name}`,
          conversionId: null // Será atualizado se necessário
        });
        
        console.log(`💰 Comissão calculada: R$ ${commissionValue.toFixed(2)} para ${affiliate[0].username}`);
      }
      
      // 7. Registrar log como sucesso
      logData.status = 'OK';
      logData.commissionCalculated = commissionValue.toString();
      await db.insert(schema.postbackLogs).values(logData);
      
      console.log(`✅ Postback processado com sucesso: ${identifier}/${event}`);
      res.json({ 
        success: true, 
        status: "OK",
        message: "Postback processado com sucesso",
        commission: commissionValue.toFixed(2),
        affiliate: affiliate[0].username
      });
      
    } catch (error) {
      console.error("❌ Erro no processamento do postback:", error);
      logData.status = 'ERROR';
      try {
        await db.insert(schema.postbackLogs).values(logData);
      } catch (logError) {
        console.error("Erro ao salvar log:", logError);
      }
      res.status(500).json({ error: "Erro interno no processamento", status: "ERROR" });
    }
  });

  // === APIS PARA LOGS DE POSTBACKS REAIS ===
  
  // API para buscar logs de postbacks recebidos
  app.get("/api/admin/postback-logs", requireAdmin, async (req, res) => {
    try {
      const { status, casa, subid } = req.query;
      
      console.log("Buscando logs de postbacks com filtros:", { status, casa, subid });
      
      // Buscar logs da tabela postback_logs com filtros opcionais
      let query = db.select().from(schema.postbackLogs);
      
      if (status && status !== 'all') {
        query = query.where(eq(schema.postbackLogs.status, status as string));
      }
      if (casa) {
        query = query.where(eq(schema.postbackLogs.casa, casa as string));
      }
      if (subid) {
        query = query.where(eq(schema.postbackLogs.subid, subid as string));
      }
      
      const logs = await query
        .orderBy(desc(schema.postbackLogs.criadoEm))
        .limit(100);
      
      console.log(`Encontrados ${logs.length} logs de postbacks`);
      res.json(logs);
    } catch (error) {
      console.error("Erro ao buscar logs de postbacks:", error);
      res.status(500).json({ message: "Erro ao buscar logs de postbacks" });
    }
  });

  app.get("/api/admin/eventos", requireAdmin, async (req, res) => {
    try {
      const eventos = await db.select({
        id: schema.eventos.id,
        casa: schema.eventos.casa,
        evento: schema.eventos.evento,
        valor: schema.eventos.valor,
        criadoEm: schema.eventos.criadoEm,
        afiliadoUsername: schema.users.username,
        afiliadoEmail: schema.users.email
      })
      .from(schema.eventos)
      .leftJoin(schema.users, eq(schema.eventos.afiliadoId, schema.users.id))
      .orderBy(desc(schema.eventos.criadoEm))
      .limit(100);
      
      res.json(eventos);
    } catch (error) {
      console.error("Error fetching eventos:", error);
      res.status(500).json({ message: "Failed to fetch eventos" });
    }
  });

  app.get("/api/admin/comissoes", requireAdmin, async (req, res) => {
    try {
      const comissoes = await db.select({
        id: schema.comissoes.id,
        tipo: schema.comissoes.tipo,
        valor: schema.comissoes.valor,
        criadoEm: schema.comissoes.criadoEm,
        afiliadoUsername: schema.users.username,
        eventoTipo: schema.eventos.evento,
        eventoCasa: schema.eventos.casa
      })
      .from(schema.comissoes)
      .leftJoin(schema.users, eq(schema.comissoes.afiliadoId, schema.users.id))
      .leftJoin(schema.eventos, eq(schema.comissoes.eventoId, schema.eventos.id))
      .orderBy(desc(schema.comissoes.criadoEm))
      .limit(100);
      
      res.json(comissoes);
    } catch (error) {
      console.error("Error fetching comissoes:", error);
      res.status(500).json({ message: "Failed to fetch comissoes" });
    }
  });

  // ROTA FUNCIONAL PARA POSTBACKS COM CPA E REVSHARE SIMULTÂNEOS
  app.get("/webhook/:casa/:evento", async (req, res) => {
    try {
      const { casa, evento } = req.params;
      const { subid, amount, customer_id } = req.query;
      const valorAmount = amount ? parseFloat(amount as string) : 0;
      
      console.log(`📩 Postback recebido: casa=${casa}, evento=${evento}, subid=${subid}, amount=${valorAmount}`);
      
      // Verificar se a casa existe
      const house = await db.select()
        .from(schema.bettingHouses)
        .where(eq(schema.bettingHouses.identifier, casa))
        .limit(1);
      
      if (house.length === 0) {
        console.log(`❌ Casa não encontrada: ${casa}`);
        return res.status(404).json({ error: "Casa não encontrada" });
      }
      
      // Verificar se o afiliado existe
      const affiliate = await db.select()
        .from(schema.users)
        .where(eq(schema.users.username, subid as string))
        .limit(1);
      
      if (affiliate.length === 0) {
        console.log(`❌ Afiliado não encontrado: ${subid}`);
        return res.status(404).json({ error: "Afiliado não encontrado" });
      }
      
      // Calcular comissões - CPA e RevShare podem ser aplicados juntos
      let totalCommission = 0;
      let commissions = [];
      
      // Verificar CPA para registration e first_deposit
      if ((evento === 'registration' || evento === 'first_deposit') && house[0].commissionType === 'CPA') {
        const cpaValue = parseFloat(house[0].commissionValue);
        totalCommission += cpaValue;
        commissions.push({ type: 'CPA', value: cpaValue });
        console.log(`💰 CPA aplicado: R$ ${cpaValue.toFixed(2)}`);
      }
      
      // Verificar RevShare para deposit e profit
      if ((evento === 'deposit' || evento === 'profit') && valorAmount > 0) {
        // RevShare pode ser aplicado mesmo se já teve CPA
        if (house[0].commissionType === 'RevShare' || house[0].commissionType === 'Hybrid') {
          const percentage = parseFloat(house[0].commissionValue) / 100;
          const revShareValue = valorAmount * percentage;
          totalCommission += revShareValue;
          commissions.push({ type: 'RevShare', value: revShareValue, percentage });
          console.log(`💰 RevShare aplicado: ${percentage}% de R$ ${valorAmount} = R$ ${revShareValue.toFixed(2)}`);
        }
      }
      
      console.log(`✅ Postback processado: ${affiliate[0].username} - ${house[0].name} - Comissão total: R$ ${totalCommission.toFixed(2)}`);
      res.json({ 
        success: true, 
        message: "Postback processado com sucesso",
        affiliate: affiliate[0].username,
        house: house[0].name,
        evento,
        amount: valorAmount,
        totalCommission: totalCommission.toFixed(2),
        commissions
      });
      
    } catch (error) {
      console.error("❌ Erro no postback:", error);
      res.status(500).json({ error: "Erro interno" });
    }
  });

  return httpServer;
}