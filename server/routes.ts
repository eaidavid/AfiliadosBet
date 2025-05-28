import { Express } from "express";
import { createServer, type Server } from "http";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { 
  users, 
  loginSchema,
  insertUserSchema 
} from "@shared/schema";
import { storage } from "./storage";
import bcrypt from "bcrypt";

const SESSION_SECRET = process.env.REPL_ID || "fallback-secret";

function getSession() {
  return {
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };
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
  const server = createServer(app);

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid input",
          errors: result.error.errors 
        });
      }

      const user = await storage.authenticateUser(result.data);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      (req.session as any).user = user;
      res.json({ user });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid input",
          errors: result.error.errors 
        });
      }

      const user = await storage.createUser(result.data);
      (req.session as any).user = user;
      res.json({ user });
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.message?.includes("unique constraint")) {
        res.status(400).json({ message: "Username or email already exists" });
      } else {
        res.status(500).json({ message: "Registration failed" });
      }
    }
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    res.json((req.session as any).user);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Clean user stats endpoint (no affiliate dependencies)
  app.get("/api/stats/user", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).user?.id;
      
      // Return clean stats without affiliate data
      const stats = {
        totalClicks: 0,
        totalRegistrations: 0,
        totalDeposits: 0,
        totalCommission: 0,
        conversionRate: 0
      };

      res.json(stats);
    } catch (error) {
      console.error("Get user stats error:", error);
      res.status(500).json({ message: "Failed to get user statistics" });
    }
  });

  // Clean admin stats endpoint
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      // Return clean admin stats without affiliate data
      const stats = {
        totalAffiliates: await storage.getTotalAffiliatesCount(),
        activeHouses: 0,
        totalVolume: 0,
        paidCommissions: 0
      };

      res.json(stats);
    } catch (error) {
      console.error("Admin stats error:", error);
      res.status(500).json({ message: "Failed to get admin statistics" });
    }
  });

  // Clean admin affiliates endpoint
  app.get("/api/admin/affiliates", requireAdmin, async (req, res) => {
    try {
      const affiliates = await storage.getAllAffiliates();
      res.json(affiliates);
    } catch (error) {
      console.error("Get affiliates error:", error);
      res.status(500).json({ message: "Failed to get affiliates" });
    }
  });

  return server;
}