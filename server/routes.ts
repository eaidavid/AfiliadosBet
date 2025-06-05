import express from 'express';
import { db } from "./db";
import * as schema from "../shared/schema";
import { eq, desc, and, or, ilike, gte, lt, inArray } from "drizzle-orm";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

// Authentication configuration
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email));

      if (!user) {
        return done(null, false, { message: 'Email não encontrado' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return done(null, false, { message: 'Senha incorreta' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: any, done) => {
  try {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    done(null, user);
  } catch (error) {
    done(error);
  }
});

function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
}

function requireAdmin(req: any, res: any, next: any) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user?.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: "Admin access required" });
}

function requireAffiliate(req: any, res: any, next: any) {
  if (req.isAuthenticated && req.isAuthenticated() && (req.user?.role === 'affiliate' || req.user?.role === 'admin')) {
    return next();
  }
  res.status(403).json({ error: "Affiliate access required" });
}

export async function registerRoutes(app: express.Application) {
  
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
      }

      // Find user by email or username
      const [user] = await db
        .select()
        .from(schema.users)
        .where(or(
          eq(schema.users.email, email),
          eq(schema.users.username, email)
        ));

      if (!user) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      // Create session manually
      req.login(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ error: "Erro interno do servidor" });
        }

        res.json({ 
          success: true, 
          user: { 
            id: user.id, 
            email: user.email, 
            role: user.role,
            fullName: user.fullName 
          } 
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Erro no logout" });
      }
      
      // Destroy session completely
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ error: "Erro ao destruir sessão" });
        }
        
        // Clear session cookie
        res.clearCookie('connect.sid');
        res.json({ success: true });
      });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      res.json({ 
        user: { 
          id: (req.user as any).id, 
          email: (req.user as any).email, 
          role: (req.user as any).role,
          fullName: (req.user as any).fullName 
        } 
      });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // Register route
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, fullName, cpf, birthDate } = req.body;

      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email));

      if (existingUser) {
        return res.status(400).json({ error: "Email já cadastrado" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [newUser] = await db
        .insert(schema.users)
        .values({
          username,
          email,
          password: hashedPassword,
          fullName,
          cpf,
          birthDate,
          role: 'affiliate', // Sempre criar como afiliado
          isActive: true
        })
        .returning();

      res.json({ 
        success: true, 
        user: { 
          id: newUser.id, 
          email: newUser.email, 
          role: newUser.role,
          fullName: newUser.fullName 
        } 
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // User profile routes with PIX data
  app.get("/api/user/profile", requireAffiliate, async (req, res) => {
    try {
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, (req.user as any).id));

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      res.json({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        cpf: user.cpf,
        phone: user.phone,
        pixKeyType: user.pixKeyType,
        pixKeyValue: user.pixKeyValue,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.put("/api/user/profile", requireAffiliate, async (req, res) => {
    try {
      const { fullName, cpf, phone } = req.body;

      await db
        .update(schema.users)
        .set({ fullName, cpf, phone })
        .where(eq(schema.users.id, (req.user as any).id));

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.put("/api/user/pix", requireAffiliate, async (req, res) => {
    try {
      const { pixKeyType, pixKeyValue } = req.body;

      await db
        .update(schema.users)
        .set({ pixKeyType, pixKeyValue })
        .where(eq(schema.users.id, (req.user as any).id));

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating PIX:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Admin stats with FIXED affiliate counting
  app.get("/api/stats/admin", async (req, res) => {
    try {
      // FIXED: Count users with role='affiliate' for consistency
      const affiliateUsers = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.role, 'affiliate'));

      const allHouses = await db.select().from(schema.bettingHouses);
      const allLinks = await db.select().from(schema.affiliateLinks);
      const allConversions = await db.select().from(schema.conversions);

      const totalAffiliates = affiliateUsers.length;
      const totalHouses = allHouses.length;
      const totalLinks = allLinks.length;
      const totalConversions = allConversions.length;

      const totalVolume = allConversions.reduce((sum, conversion) => {
        return sum + parseFloat(conversion.amount || '0');
      }, 0);

      const totalCommissions = allConversions.reduce((sum, conversion) => {
        return sum + parseFloat(conversion.commission || '0');
      }, 0);

      const stats = {
        totalAffiliates, // Now correctly counting only affiliate role users
        totalHouses,
        totalLinks,
        totalConversions,
        totalVolume: totalVolume.toFixed(2),
        totalCommissions: totalCommissions.toFixed(2)
      };

      console.log(`📊 Admin stats - Afiliados: ${totalAffiliates}`);
      res.json(stats);

    } catch (error) {
      console.error("Erro ao buscar estatísticas do admin:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Admin affiliates route with FIXED counting logic
  app.get("/api/admin/affiliates", requireAdmin, async (req, res) => {
    try {
      const { search, status, house, date } = req.query;
      
      console.log('🔍 Listando afiliados com filtros:', { search, status, house, date });
      
      // Base condition: only affiliate users
      let baseCondition = eq(schema.users.role, 'affiliate');
      let finalCondition = baseCondition;
      
      if (search) {
        const searchCondition = or(
          ilike(schema.users.email, `%${search}%`),
          ilike(schema.users.fullName, `%${search}%`)
        );
        finalCondition = and(finalCondition, searchCondition!);
      }
      
      if (status === 'active') {
        finalCondition = and(finalCondition, eq(schema.users.isActive, true))!;
      } else if (status === 'inactive') {
        finalCondition = and(finalCondition, eq(schema.users.isActive, false))!;
      }
      
      if (date) {
        const targetDate = new Date(date as string);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        finalCondition = and(
          finalCondition,
          gte(schema.users.createdAt, targetDate)!,
          lt(schema.users.createdAt, nextDay)!
        )!;
      }
      
      const users = await db
        .select({
          id: schema.users.id,
          username: schema.users.username,
          email: schema.users.email,
          fullName: schema.users.fullName,
          isActive: schema.users.isActive,
          createdAt: schema.users.createdAt,
        })
        .from(schema.users)
        .where(finalCondition)
        .orderBy(desc(schema.users.createdAt));
      
      // Para cada usuário, buscar estatísticas
      const affiliatesWithStats = await Promise.all(
        users.map(async (user) => {
          // Buscar links do usuário
          const userLinks = await db
            .select()
            .from(schema.affiliateLinks)
            .where(eq(schema.affiliateLinks.userId, user.id));
          
          // Buscar conversões do usuário
          const conversions = await db
            .select()
            .from(schema.conversions)
            .where(eq(schema.conversions.userId, user.id));
          
          // Calcular estatísticas
          const totalClicks = conversions.filter(c => c.type === 'click').length;
          const totalRegistrations = conversions.filter(c => c.type === 'registration').length;
          const totalDeposits = conversions.filter(c => c.type === 'deposit').length;
          const totalCommissions = conversions.reduce((sum, c) => sum + parseFloat(c.commission || '0'), 0);
          
          // Buscar casas relacionadas
          const houseIds = Array.from(new Set(userLinks.map(link => link.houseId)));
          const houses = houseIds.length > 0 ? await db
            .select({ name: schema.bettingHouses.name })
            .from(schema.bettingHouses)
            .where(inArray(schema.bettingHouses.id, houseIds)) : [];
          
          return {
            ...user,
            totalClicks,
            totalRegistrations,
            totalDeposits,
            totalCommissions: totalCommissions.toFixed(2),
            houses: houses.map(h => h.name)
          };
        })
      );
      
      // Filtrar por casa se especificado
      const finalResults = house && house !== 'all' 
        ? affiliatesWithStats.filter(user => user.houses.includes(house as string))
        : affiliatesWithStats;
      
      console.log(`✅ Encontrados ${finalResults.length} afiliados`);
      res.json(finalResults);
      
    } catch (error) {
      console.error('❌ Erro ao listar afiliados:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // User stats
  app.get("/api/stats/user", requireAffiliate, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      const userLinks = await db
        .select()
        .from(schema.affiliateLinks)
        .where(eq(schema.affiliateLinks.userId, userId));

      const userConversions = await db
        .select()
        .from(schema.conversions)
        .where(eq(schema.conversions.userId, userId));

      const totalClicks = userLinks.length;
      const totalRegistrations = userConversions.filter(c => c.type === 'registration').length;
      const totalDeposits = userConversions.filter(c => c.type === 'deposit').length;
      
      const totalCommission = userConversions.reduce((sum, conversion) => {
        return sum + parseFloat(conversion.commission || '0');
      }, 0);

      const conversionRate = totalClicks > 0 ? (totalRegistrations / totalClicks) * 100 : 0;

      const stats = {
        totalClicks,
        totalRegistrations,
        totalDeposits,
        totalCommission: totalCommission.toFixed(2),
        conversionRate: Math.round(conversionRate)
      };

      res.json(stats);
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Betting houses (accessible by affiliates and admins)
  app.get("/api/betting-houses", requireAffiliate, async (req, res) => {
    try {
      const houses = await db.select().from(schema.bettingHouses);
      res.json(houses);
    } catch (error) {
      console.error("Erro ao buscar casas:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get user links (affiliate route)
  app.get("/api/my-links", requireAffiliate, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      const links = await db
        .select({
          id: schema.affiliateLinks.id,
          generatedUrl: schema.affiliateLinks.generatedUrl,
          createdAt: schema.affiliateLinks.createdAt,
          houseName: schema.bettingHouses.name,
        })
        .from(schema.affiliateLinks)
        .leftJoin(schema.bettingHouses, eq(schema.affiliateLinks.houseId, schema.bettingHouses.id))
        .where(eq(schema.affiliateLinks.userId, userId))
        .orderBy(desc(schema.affiliateLinks.createdAt));

      res.json(links);
    } catch (error) {
      console.error("Erro ao buscar links:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  console.log("✅ Rotas registradas com sucesso");
}