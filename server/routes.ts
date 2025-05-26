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
      
      const user = await storage.createUser(result.data);
      req.session.user = user;
      res.json(user);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
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
  
  // Postback para Registration
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

  // Postback para Deposit
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

  // Postback para Profit
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
  app.get("/api/betting-houses", async (req, res) => {
    try {
      const houses = await storage.getActiveBettingHouses();
      res.json(houses);
    } catch (error) {
      console.error("Get betting houses error:", error);
      res.status(500).json({ message: "Failed to get betting houses" });
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
      res.json(house);
    } catch (error) {
      console.error("Create betting house error:", error);
      res.status(500).json({ message: "Failed to create betting house" });
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