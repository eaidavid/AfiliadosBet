import express from 'express';
import { db } from "./db";
import * as schema from "../shared/schema";
import { eq, desc, and, or, ilike, gte, lt, inArray, asc } from "drizzle-orm";
import { Server as WSServer } from "ws";
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

      const isValid = await bcrypt.compare(password, user.passwordHash);
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

function getSession(req: any) {
  return req.session?.passport?.user;
}

function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
}

function requireAdmin(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user?.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: "Admin access required" });
}

export async function registerRoutes(app: express.Application): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, fullName, cpf, phone } = req.body;

      const existingUser = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        return res.status(400).json({ error: "Email já está em uso" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const [newUser] = await db
        .insert(schema.users)
        .values({
          email,
          passwordHash: hashedPassword,
          fullName,
          cpf,
          phone,
          role: 'affiliate',
          isActive: true,
        })
        .returning();

      res.json({ success: true, user: { id: newUser.id, email: newUser.email, role: newUser.role } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/login", passport.authenticate('local'), (req, res) => {
    res.json({ 
      success: true, 
      user: { 
        id: req.user.id, 
        email: req.user.email, 
        role: req.user.role,
        fullName: req.user.fullName 
      } 
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ 
        user: { 
          id: req.user.id, 
          email: req.user.email, 
          role: req.user.role,
          fullName: req.user.fullName 
        } 
      });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // User profile routes
  app.get("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, req.user.id));

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

  app.put("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const { fullName, cpf, phone } = req.body;

      await db
        .update(schema.users)
        .set({ fullName, cpf, phone })
        .where(eq(schema.users.id, req.user.id));

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.put("/api/user/pix", requireAuth, async (req, res) => {
    try {
      const { pixKeyType, pixKeyValue } = req.body;

      await db
        .update(schema.users)
        .set({ pixKeyType, pixKeyValue })
        .where(eq(schema.users.id, req.user.id));

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating PIX:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Affiliate routes with CORRECTED count logic
  app.get("/api/admin/affiliates", requireAdmin, async (req, res) => {
    try {
      const { search, status, house, date } = req.query;
      
      console.log('🔍 Listando afiliados com filtros:', { search, status, house, date });
      
      // FIXED: Use role='affiliate' instead of role='user' for consistent counting
      let baseCondition = eq(schema.users.role, 'affiliate');
      let whereCondition = baseCondition;
      
      if (search) {
        const searchCondition = or(
          ilike(schema.users.username, `%${search}%`),
          ilike(schema.users.email, `%${search}%`),
          ilike(schema.users.fullName, `%${search}%`)
        );
        whereCondition = and(whereCondition, searchCondition);
      }
      
      if (status === 'active') {
        whereCondition = and(whereCondition, eq(schema.users.isActive, true));
      } else if (status === 'inactive') {
        whereCondition = and(whereCondition, eq(schema.users.isActive, false));
      }
      
      if (date) {
        const targetDate = new Date(date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const dateCondition = and(
          gte(schema.users.createdAt, targetDate),
          lt(schema.users.createdAt, nextDay)
        );
        whereCondition = and(whereCondition, dateCondition);
      }
      
      const users = await db
        .select({
          id: schema.users.id,
          username: schema.users.username,
          email: schema.users.email,
          fullName: schema.users.fullName,
          isActive: schema.users.isActive,
          createdAt: schema.users.createdAt,
          lastAccess: schema.users.lastAccess,
        })
        .from(schema.users)
        .where(whereCondition)
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
          const houseIds = [...new Set(userLinks.map(link => link.houseId))];
          const houses = await db
            .select({ name: schema.bettingHouses.name })
            .from(schema.bettingHouses)
            .where(inArray(schema.bettingHouses.id, houseIds.length > 0 ? houseIds : [0]));
          
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
        ? affiliatesWithStats.filter(user => user.houses.includes(house))
        : affiliatesWithStats;
      
      console.log(`✅ Encontrados ${finalResults.length} afiliados`);
      res.json(finalResults);
      
    } catch (error) {
      console.error('❌ Erro ao listar afiliados:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Admin stats route with CORRECTED affiliate count
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

      // Calculate totals with correct affiliate count
      const totalAffiliates = affiliateUsers.length;
      const totalHouses = allHouses.length;
      const totalLinks = allLinks.length;
      const totalConversions = allConversions.length;

      // Calculate volume and commissions
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

  // User stats
  app.get("/api/stats/user", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      
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

  // Betting houses
  app.get("/api/betting-houses", async (req, res) => {
    try {
      const houses = await db.select().from(schema.bettingHouses);
      res.json(houses);
    } catch (error) {
      console.error("Erro ao buscar casas:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Create affiliate link
  app.post("/api/affiliate-links", requireAuth, async (req, res) => {
    try {
      const { houseId } = req.body;
      const userId = req.user.id;

      const [house] = await db
        .select()
        .from(schema.bettingHouses)
        .where(eq(schema.bettingHouses.id, houseId));

      if (!house) {
        return res.status(404).json({ error: "Casa não encontrada" });
      }

      const subid = `${userId}_${Date.now()}`;
      
      const [newLink] = await db
        .insert(schema.affiliateLinks)
        .values({
          userId,
          houseId,
          subid,
          generatedUrl: `${house.baseUrl}?${house.primaryParam}=${subid}`,
        })
        .returning();

      res.json(newLink);
    } catch (error) {
      console.error("Erro ao criar link:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get user links
  app.get("/api/my-links", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      
      const links = await db
        .select({
          id: schema.affiliateLinks.id,
          subid: schema.affiliateLinks.subid,
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

  // Simple postback route
  app.get("/api/postback/:casa/:evento", async (req, res) => {
    try {
      const { casa, evento } = req.params;
      const { subid, valor = 0, customer_id } = req.query;

      console.log(`📋 Postback recebido: casa=${casa}, evento=${evento}, subid=${subid}`);

      // Find the affiliate link
      const [link] = await db
        .select()
        .from(schema.affiliateLinks)
        .where(eq(schema.affiliateLinks.subid, subid as string))
        .limit(1);

      if (!link) {
        console.log(`❌ Link não encontrado para subid: ${subid}`);
        return res.status(404).json({ error: "Link não encontrado" });
      }

      // Create conversion record
      const [conversion] = await db
        .insert(schema.conversions)
        .values({
          userId: link.userId,
          houseId: link.houseId,
          affiliateLinkId: link.id,
          type: evento as string,
          amount: valor.toString(),
          commission: (parseFloat(valor.toString()) * 0.5).toString(), // 50% commission
          customerId: customer_id as string,
          conversionData: { casa, evento, subid, valor, customer_id },
        })
        .returning();

      console.log(`✅ Conversão criada: ID ${conversion.id}`);
      res.json({ success: true, conversionId: conversion.id });

    } catch (error) {
      console.error("Erro no postback:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  console.log("✅ Rotas registradas com sucesso");
  
  return {} as Server; // Return placeholder WebSocket server
}