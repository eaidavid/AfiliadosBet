import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { 
  insertUserSchema, 
  loginSchema, 
  insertBettingHouseSchema,
  type User,
  type BettingHouse,
} from "@shared/schema";

// Session configuration
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

// Auth middleware
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
  // Session middleware
  app.use(getSession());

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(userData.username) || 
                          await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ 
          message: existingUser.username === userData.username ? 
            "Username already exists" : "Email already exists" 
        });
      }

      const user = await storage.createUser(userData);
      
      // Auto-login after registration
      req.session.user = { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        fullName: user.fullName,
        role: user.role 
      };
      
      res.status(201).json({ 
        message: "User created successfully", 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          fullName: user.fullName,
          role: user.role 
        } 
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ 
        message: error.message || "Registration failed",
        errors: error.issues || undefined
      });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await storage.authenticateUser(credentials);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.user = { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        fullName: user.fullName,
        role: user.role 
      };
      
      res.json({ 
        message: "Login successful", 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          fullName: user.fullName,
          role: user.role 
        } 
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ 
        message: error.message || "Login failed" 
      });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUserById(req.session.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // Betting Houses routes
  app.get("/api/betting-houses", requireAuth, async (req: any, res) => {
    try {
      const houses = await storage.getActiveBettingHouses();
      
      // For each house, check if current user is already affiliated
      const userId = req.session.user.id;
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

  app.post("/api/betting-houses/:id/affiliate", requireAuth, async (req: any, res) => {
    try {
      const houseId = parseInt(req.params.id);
      const userId = req.session.user.id;
      
      // Check if already affiliated
      const existingLink = await storage.getAffiliateLinkByUserAndHouse(userId, houseId);
      if (existingLink) {
        return res.status(400).json({ message: "Already affiliated with this house" });
      }
      
      const house = await storage.getBettingHouseById(houseId);
      if (!house) {
        return res.status(404).json({ message: "Betting house not found" });
      }
      
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Generate affiliate URL
      const generatedUrl = house.baseUrl.replace("VALUE", user.username);
      
      const affiliateLink = await storage.createAffiliateLink({
        userId,
        houseId,
        generatedUrl,
        isActive: true,
      });
      
      res.status(201).json({ 
        message: "Successfully affiliated", 
        link: affiliateLink 
      });
    } catch (error) {
      console.error("Affiliate error:", error);
      res.status(500).json({ message: "Failed to create affiliate link" });
    }
  });

  // User affiliate links
  app.get("/api/my-links", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const links = await storage.getAffiliateLinksByUserId(userId);
      
      // Get house details and stats for each link
      const linksWithDetails = await Promise.all(
        links.map(async (link) => {
          const house = await storage.getBettingHouseById(link.houseId);
          const clicks = await storage.getClicksByUserId(userId);
          const conversions = await storage.getConversionsByUserId(userId);
          
          const linkClicks = clicks.filter(c => c.linkId === link.id);
          const linkConversions = conversions.filter(c => c.linkId === link.id);
          const linkCommission = linkConversions.reduce((sum, c) => sum + Number(c.commission || 0), 0);
          
          return {
            ...link,
            house,
            stats: {
              clicks: linkClicks.length,
              registrations: linkConversions.filter(c => c.type === 'registration').length,
              deposits: linkConversions.filter(c => c.type === 'deposit').length,
              commission: linkCommission,
            },
          };
        })
      );
      
      res.json(linksWithDetails);
    } catch (error) {
      console.error("Get my links error:", error);
      res.status(500).json({ message: "Failed to get affiliate links" });
    }
  });

  // User statistics
  app.get("/api/stats/user", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Get user stats error:", error);
      res.status(500).json({ message: "Failed to get user statistics" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      const topAffiliates = await storage.getTopAffiliates(5);
      const topHouses = await storage.getTopHouses(5);
      
      res.json({
        ...stats,
        topAffiliates,
        topHouses,
      });
    } catch (error) {
      console.error("Get admin stats error:", error);
      res.status(500).json({ message: "Failed to get admin statistics" });
    }
  });

  app.get("/api/admin/betting-houses", requireAdmin, async (req, res) => {
    try {
      const houses = await storage.getAllBettingHouses();
      
      // Get additional stats for each house
      const housesWithStats = await Promise.all(
        houses.map(async (house) => {
          const conversions = await storage.getConversionsByHouseId(house.id);
          const links = await storage.getAffiliateLinksByUserId(0); // This needs to be fixed to get all links for house
          
          return {
            ...house,
            stats: {
              affiliateCount: links.length, // This should be corrected
              totalVolume: conversions.reduce((sum, c) => sum + Number(c.amount || 0), 0),
              totalCommissions: conversions.reduce((sum, c) => sum + Number(c.commission || 0), 0),
            },
          };
        })
      );
      
      res.json(housesWithStats);
    } catch (error) {
      console.error("Get admin betting houses error:", error);
      res.status(500).json({ message: "Failed to get betting houses" });
    }
  });

  app.post("/api/admin/betting-houses", requireAdmin, async (req, res) => {
    try {
      const houseData = insertBettingHouseSchema.parse(req.body);
      const house = await storage.createBettingHouse(houseData);
      res.status(201).json(house);
    } catch (error: any) {
      console.error("Create betting house error:", error);
      res.status(400).json({ 
        message: error.message || "Failed to create betting house",
        errors: error.issues || undefined
      });
    }
  });

  app.put("/api/admin/betting-houses/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertBettingHouseSchema.partial().parse(req.body);
      const house = await storage.updateBettingHouse(id, updates);
      res.json(house);
    } catch (error: any) {
      console.error("Update betting house error:", error);
      res.status(400).json({ 
        message: error.message || "Failed to update betting house" 
      });
    }
  });

  app.delete("/api/admin/betting-houses/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBettingHouse(id);
      res.json({ message: "Betting house deleted successfully" });
    } catch (error) {
      console.error("Delete betting house error:", error);
      res.status(500).json({ message: "Failed to delete betting house" });
    }
  });

  // Postback routes for betting houses
  app.get("/api/postback/registration", async (req, res) => {
    try {
      const { house, subid, ...otherParams } = req.query;
      
      if (!house || !subid) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      // Find user by username (subid)
      const user = await storage.getUserByUsername(subid as string);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Find betting house
      const bettingHouse = await storage.getAllBettingHouses();
      const targetHouse = bettingHouse.find(h => h.name.toLowerCase().replace(/\s+/g, '') === house);
      if (!targetHouse) {
        return res.status(404).json({ message: "Betting house not found" });
      }
      
      // Create conversion
      await storage.createConversion({
        userId: user.id,
        houseId: targetHouse.id,
        type: "registration",
        amount: "0",
        commission: "0", // Will be calculated based on house commission rules
        conversionData: otherParams,
      });
      
      res.json({ message: "Registration tracked successfully" });
    } catch (error) {
      console.error("Postback registration error:", error);
      res.status(500).json({ message: "Failed to track registration" });
    }
  });

  app.get("/api/postback/deposit", async (req, res) => {
    try {
      const { house, subid, amount, ...otherParams } = req.query;
      
      if (!house || !subid || !amount) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      // Find user by username (subid)
      const user = await storage.getUserByUsername(subid as string);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Find betting house
      const bettingHouse = await storage.getAllBettingHouses();
      const targetHouse = bettingHouse.find(h => h.name.toLowerCase().replace(/\s+/g, '') === house);
      if (!targetHouse) {
        return res.status(404).json({ message: "Betting house not found" });
      }
      
      // Calculate commission based on house rules
      let commission = 0;
      if (targetHouse.commissionType === "revshare") {
        const percentage = parseFloat(targetHouse.commissionValue.replace("%", ""));
        commission = (parseFloat(amount as string) * percentage) / 100;
      } else if (targetHouse.commissionType === "cpa") {
        commission = parseFloat(targetHouse.commissionValue.replace("R$", "").trim());
      }
      
      // Create conversion
      await storage.createConversion({
        userId: user.id,
        houseId: targetHouse.id,
        type: "deposit",
        amount: amount as string,
        commission: commission.toString(),
        conversionData: otherParams,
      });
      
      res.json({ message: "Deposit tracked successfully" });
    } catch (error) {
      console.error("Postback deposit error:", error);
      res.status(500).json({ message: "Failed to track deposit" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
