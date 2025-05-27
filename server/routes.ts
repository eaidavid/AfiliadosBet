import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { db } from "./db";
import { affiliateLinks } from "@shared/schema";
import * as schema from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { 
  insertUserSchema, 
  loginSchema, 
  insertBettingHouseSchema, 
  insertAffiliateLinkSchema 
} from "@shared/schema";

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
  if (!req.session?.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(getSession());

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid credentials format" });
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
  
  // 1. Postback para Cliques
  app.get("/api/postback/click", async (req, res) => {
    try {
      const { house, subid, customer_id, ...otherParams } = req.query;
      
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
      
      // Registra o clique
      await storage.createConversion({
        userId: user.id,
        houseId: bettingHouse.id,
        affiliateLinkId: null,
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
  });

  // 2. Postback para Registros
  app.get("/api/postback/registration", async (req, res) => {
    try {
      const { house, subid, customer_id, ...otherParams } = req.query;
      
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
  });

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

  // User routes
  app.get("/api/betting-houses", requireAuth, async (req: any, res) => {
    try {
      const houses = await storage.getActiveBettingHouses();
      const userId = req.session.user.id;
      
      // Para cada casa, verificar se o usuário já está afiliado
      const housesWithAffiliationStatus = await Promise.all(
        houses.map(async (house) => {
          const existingLink = await storage.getAffiliateLinkByUserAndHouse(userId, house.id);
          return {
            ...house,
            isAffiliated: !!existingLink,
            affiliateLink: existingLink?.generatedUrl || null,
          };
        })
      );
      
      res.json(housesWithAffiliationStatus);
    } catch (error) {
      console.error("Get betting houses error:", error);
      res.status(500).json({ message: "Failed to get betting houses" });
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
      const stats = await storage.getUserStats(req.session.user.id);
      res.json(stats);
    } catch (error) {
      console.error("Get user stats error:", error);
      res.status(500).json({ message: "Failed to get user statistics" });
    }
  });

  // Nova rota para buscar links de afiliação do usuário
  app.get("/api/my-affiliate-links", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const links = await storage.getAffiliateLinksByUserId(userId);
      
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

      // Estatísticas agregadas
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

  // Admin routes
  app.get("/api/admin/betting-houses", requireAdmin, async (req, res) => {
    try {
      const houses = await storage.getAllBettingHouses();
      res.json(houses);
    } catch (error) {
      console.error("Get admin betting houses error:", error);
      res.status(500).json({ message: "Failed to get betting houses" });
    }
  });

  app.post("/api/admin/betting-houses", requireAdmin, async (req, res) => {
    try {
      const result = insertBettingHouseSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid betting house data" });
      }
      
      const house = await storage.createBettingHouse(result.data);
      
      // Gerar links de afiliados para todos os usuários existentes
      const users = await storage.getAllAffiliates();
      for (const user of users) {
        if (user.role !== 'admin') {
          await storage.createAffiliateLink({
            userId: user.id,
            houseId: house.id,
            generatedUrl: house.baseUrl.replace('{subid}', user.username),
            isActive: true
          });
        }
      }
      
      res.json(house);
    } catch (error) {
      console.error("Create betting house error:", error);
      res.status(500).json({ message: "Failed to create betting house" });
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

  const httpServer = createServer(app);
  
  // WebSocket
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Cliente WebSocket conectado');
    
    ws.on('close', () => {
      console.log('Cliente WebSocket desconectado');
    });
  });

  return httpServer;
}