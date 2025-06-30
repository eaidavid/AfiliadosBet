import express from 'express';
import { db, safeDbQuery } from "./db";
import * as schema from "../shared/schema";
import { eq, desc, and, or, ilike, gte, lt, inArray, sql, ne, count } from "drizzle-orm";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import { webhookRouter } from './webhook-endpoints';
import { handlePostback } from './postback-simple';

// Authentication configuration
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const userResult = await safeDbQuery(async () => {
        return await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, email));
      });

      if (!userResult || userResult.length === 0) {
        return done(null, false, { message: 'Email não encontrado' });
      }

      const user = userResult[0];
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return done(null, false, { message: 'Senha incorreta' });
      }

      return done(null, user);
    } catch (error) {
      console.error("Login error:", error);
      return done(error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: any, done) => {
  try {
    const userResult = await safeDbQuery(async () => {
      return await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, id));
    });

    if (!userResult || userResult.length === 0) {
      return done(null, false);
    }

    done(null, userResult[0]);
  } catch (error) {
    console.error("Deserialize user error:", error);
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
  // In development mode, temporarily bypass auth for admin operations
  if (process.env.NODE_ENV === "development") {
    console.log("🔓 Development mode: bypassing admin auth");
    return next();
  }
  
  // Check if user is authenticated and is admin
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

      // Find user by email or username with enhanced error handling
      let userResult;
      try {
        userResult = await safeDbQuery(async () => {
          return await db
            .select()
            .from(schema.users)
            .where(or(
              eq(schema.users.email, email),
              eq(schema.users.username, email)
            ));
        });
      } catch (error: any) {
        console.error("Database connection error during login:", error.message);
        
        // Handle specific database connection errors
        if (error.message === 'DATABASE_ENDPOINT_DISABLED') {
          return res.status(503).json({ 
            error: "Banco de dados temporariamente indisponível. Aguarde alguns minutos e tente novamente.",
            code: "DATABASE_UNAVAILABLE"
          });
        }
        
        if (error.message === 'DATABASE_CONNECTION_FAILED') {
          return res.status(503).json({ 
            error: "Falha na conexão com o banco de dados. Tente novamente.",
            code: "CONNECTION_ERROR"
          });
        }
        
        return res.status(500).json({ 
          error: "Erro interno do servidor. Contate o suporte se o problema persistir." 
        });
      }

      if (!userResult || userResult.length === 0) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      const user = userResult[0];

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

  // Session check endpoint for data persistence
  app.get("/api/user/session", (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      res.json({
        authenticated: true,
        user: {
          id: (req.user as any).id,
          email: (req.user as any).email,
          fullName: (req.user as any).fullName,
          role: (req.user as any).role
        }
      });
    } else {
      res.json({ authenticated: false });
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
      
      // Simple query without complex conditions for now
      let whereClause = eq(schema.users.role, 'affiliate');
      
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
        .where(whereClause)
        .orderBy(desc(schema.users.createdAt));
      
      // Para cada afiliado, buscar estatísticas
      const affiliatesWithStats = await Promise.all(
        users.map(async (affiliate) => {
          // Buscar links do afiliado
          const affiliateLinks = await db
            .select()
            .from(schema.affiliateLinks)
            .where(eq(schema.affiliateLinks.userId, affiliate.id));
          
          // Buscar conversões do afiliado
          const conversions = await db
            .select()
            .from(schema.conversions)
            .where(eq(schema.conversions.userId, affiliate.id));
          
          // Calcular estatísticas
          const totalClicks = conversions.filter(c => c.type === 'click').length;
          const totalRegistrations = conversions.filter(c => c.type === 'registration').length;
          const totalDeposits = conversions.filter(c => c.type === 'deposit').length;
          const totalCommissions = conversions.reduce((sum, c) => sum + parseFloat(c.commission || '0'), 0);
          
          // Buscar casas relacionadas ao afiliado
          const houseIds = Array.from(new Set(affiliateLinks.map((link: any) => link.houseId)));
          const houses = houseIds.length > 0 ? await db
            .select({ name: schema.bettingHouses.name })
            .from(schema.bettingHouses)
            .where(inArray(schema.bettingHouses.id, houseIds as number[])) : [];
          
          return {
            ...affiliate,
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

  // Delete affiliate
  app.delete("/api/admin/affiliates/:id", requireAdmin, async (req, res) => {
    try {
      const affiliateId = parseInt(req.params.id);
      
      if (isNaN(affiliateId)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      // Verificar se o afiliado existe
      const existingAffiliate = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, affiliateId))
        .limit(1);

      if (existingAffiliate.length === 0) {
        return res.status(404).json({ error: 'Afiliado não encontrado' });
      }

      // Deletar links do afiliado primeiro (referências)
      await db
        .delete(schema.affiliateLinks)
        .where(eq(schema.affiliateLinks.userId, affiliateId));

      // Deletar conversões do afiliado
      await db
        .delete(schema.conversions)
        .where(eq(schema.conversions.userId, affiliateId));

      // Deletar o afiliado
      await db
        .delete(schema.users)
        .where(eq(schema.users.id, affiliateId));

      console.log(`✅ Afiliado ${affiliateId} excluído com sucesso`);
      res.json({ success: true, message: 'Afiliado excluído com sucesso' });
      
    } catch (error) {
      console.error('❌ Erro ao excluir afiliado:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Get single affiliate
  app.get("/api/admin/affiliates/:id", requireAdmin, async (req, res) => {
    try {
      const affiliateId = parseInt(req.params.id);
      
      if (isNaN(affiliateId)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const affiliate = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, affiliateId))
        .limit(1);

      if (affiliate.length === 0) {
        return res.status(404).json({ error: 'Afiliado não encontrado' });
      }

      // Get statistics
      const userLinks = await db
        .select()
        .from(schema.affiliateLinks)
        .where(eq(schema.affiliateLinks.userId, affiliateId));

      const userConversions = await db
        .select()
        .from(schema.conversions)
        .where(eq(schema.conversions.userId, affiliateId));

      const totalClicks = userLinks.length;
      const totalRegistrations = userConversions.filter(c => c.type === 'registration').length;
      const totalDeposits = userConversions.filter(c => c.type === 'deposit').length;
      
      const totalCommission = userConversions.reduce((sum, conversion) => {
        return sum + parseFloat(conversion.commission || '0');
      }, 0);

      const result = {
        ...affiliate[0],
        totalClicks,
        totalRegistrations,
        totalDeposits,
        totalCommissions: totalCommission.toFixed(2),
        houses: []
      };

      res.json(result);
      
    } catch (error) {
      console.error('❌ Erro ao buscar afiliado:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Update affiliate
  app.patch("/api/admin/affiliates/:id", requireAdmin, async (req, res) => {
    try {
      const affiliateId = parseInt(req.params.id);
      
      if (isNaN(affiliateId)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const { fullName, email, username, isActive } = req.body;

      // Verificar se o afiliado existe
      const existingAffiliate = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, affiliateId))
        .limit(1);

      if (existingAffiliate.length === 0) {
        return res.status(404).json({ error: 'Afiliado não encontrado' });
      }

      // Verificar se username e email são únicos (se foram alterados)
      if (username && username !== existingAffiliate[0].username) {
        const usernameExists = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.username, username))
          .limit(1);

        if (usernameExists.length > 0) {
          return res.status(400).json({ error: 'Username já está em uso' });
        }
      }

      if (email && email !== existingAffiliate[0].email) {
        const emailExists = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, email))
          .limit(1);

        if (emailExists.length > 0) {
          return res.status(400).json({ error: 'Email já está em uso' });
        }
      }

      // Atualizar afiliado
      await db
        .update(schema.users)
        .set({
          fullName: fullName || existingAffiliate[0].fullName,
          email: email || existingAffiliate[0].email,
          username: username || existingAffiliate[0].username,
          isActive: isActive !== undefined ? isActive : existingAffiliate[0].isActive,
        })
        .where(eq(schema.users.id, affiliateId));

      console.log(`✅ Afiliado ${affiliateId} atualizado com sucesso`);
      res.json({ success: true, message: 'Afiliado atualizado com sucesso' });
      
    } catch (error) {
      console.error('❌ Erro ao atualizar afiliado:', error);
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

  // Betting houses (accessible by affiliates and admins) - with fallback for unauthenticated users
  app.get("/api/betting-houses", async (req, res) => {
    try {
      const houses = await db.select().from(schema.bettingHouses);
      
      // If user is authenticated, get their affiliate status
      if (req.user) {
        const userId = (req.user as any).id;
        const userLinks = await db
          .select({ houseId: schema.affiliateLinks.houseId })
          .from(schema.affiliateLinks)
          .where(eq(schema.affiliateLinks.userId, userId));
        
        const affiliatedHouseIds = new Set(userLinks.map(link => link.houseId));
        
        const housesWithAffiliationStatus = houses.map(house => ({
          ...house,
          isAffiliated: affiliatedHouseIds.has(house.id)
        }));
        
        res.json(housesWithAffiliationStatus);
      } else {
        // Return houses without affiliation status for unauthenticated users
        const housesWithoutAffiliation = houses.map(house => ({
          ...house,
          isAffiliated: false
        }));
        
        res.json(housesWithoutAffiliation);
      }
    } catch (error) {
      console.error("Erro ao buscar casas:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Admin betting houses routes
  app.get("/api/admin/betting-houses", requireAdmin, async (req, res) => {
    try {
      const houses = await db.select().from(schema.bettingHouses);
      res.json(houses);
    } catch (error) {
      console.error("Erro ao buscar casas de apostas:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/admin/betting-houses", requireAdmin, async (req, res) => {
    try {
      console.log("📋 Dados recebidos para criar casa:", req.body);
      
      const { 
        name, description, logoUrl, baseUrl, primaryParam, additionalParams, 
        commissionType, commissionValue, cpaValue, revshareValue, minDeposit, 
        paymentMethods, isActive, identifier, securityToken, parameterMapping,
        // API Integration fields
        integrationType, apiBaseUrl, apiKey, apiSecret, apiVersion, 
        authType, syncInterval
      } = req.body;

      if (!name || !baseUrl) {
        return res.status(400).json({ error: "Nome e URL base são obrigatórios" });
      }

      // Generate identifier and security token if not provided
      const finalIdentifier = identifier || (name.toLowerCase().replace(/[^a-z0-9]/g, '') + Date.now());
      const finalSecurityToken = securityToken || `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const houseData = {
        name,
        description: description || null,
        logoUrl: logoUrl || null,
        baseUrl,
        identifier: finalIdentifier,
        securityToken: finalSecurityToken,
        primaryParam: primaryParam || "subid",
        additionalParams: additionalParams || null,
        commissionType: commissionType || "RevShare",
        commissionValue: commissionValue || "30",
        cpaValue: cpaValue ? String(cpaValue) : null,
        revshareValue: revshareValue ? String(revshareValue) : null,
        minDeposit: minDeposit ? String(minDeposit) : "100",
        paymentMethods: paymentMethods || "Pix",
        parameterMapping: parameterMapping || {
          subid: "subid",
          amount: "amount",
          customer_id: "customer_id"
        },
        enabledPostbacks: [],
        isActive: isActive !== undefined ? isActive : true,
        
        // API Integration fields
        integrationType: integrationType || "postback",
        apiBaseUrl: apiBaseUrl || null,
        apiKey: apiKey || null,
        apiSecret: apiSecret || null,
        apiVersion: apiVersion || "v1",
        authType: authType || "bearer",
        syncInterval: syncInterval || 30,
        syncStatus: (integrationType === 'api' || integrationType === 'hybrid') ? 'pending' : 'n/a',
        lastSyncAt: null,
        syncErrorMessage: null,
        apiConfig: {},
        endpointMapping: {},
        authHeaders: {}
      };

      console.log("💾 Dados que serão inseridos:", houseData);

      const [house] = await db
        .insert(schema.bettingHouses)
        .values(houseData)
        .returning();

      console.log("✅ Casa criada com sucesso:", house);
      res.json(house);
    } catch (error) {
      console.error("❌ Erro ao criar casa:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.put("/api/admin/betting-houses/:id", requireAdmin, async (req, res) => {
    try {
      const houseId = parseInt(req.params.id);
      
      if (isNaN(houseId)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const updateData = req.body;
      delete updateData.id; // Remove ID from update data

      const [updatedHouse] = await db
        .update(schema.bettingHouses)
        .set(updateData)
        .where(eq(schema.bettingHouses.id, houseId))
        .returning();

      if (!updatedHouse) {
        return res.status(404).json({ error: "Casa não encontrada" });
      }

      res.json(updatedHouse);
    } catch (error) {
      console.error("❌ Erro ao atualizar casa:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.delete("/api/admin/betting-houses/:id", requireAdmin, async (req, res) => {
    try {
      const houseId = parseInt(req.params.id);
      
      if (isNaN(houseId)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      // First, delete all related data to avoid foreign key constraints
      console.log(`🗑️ Iniciando exclusão da casa ID: ${houseId}`);

      // Delete conversions related to this house
      await db
        .delete(schema.conversions)
        .where(eq(schema.conversions.houseId, houseId));
      console.log(`✅ Conversões da casa ${houseId} removidas`);

      // Delete affiliate links related to this house
      await db
        .delete(schema.affiliateLinks)
        .where(eq(schema.affiliateLinks.houseId, houseId));
      console.log(`✅ Links de afiliados da casa ${houseId} removidos`);

      // Delete registered postbacks related to this house
      await db
        .delete(schema.registeredPostbacks)
        .where(eq(schema.registeredPostbacks.houseId, houseId));
      console.log(`✅ Postbacks registrados da casa ${houseId} removidos`);

      // Finally, delete the betting house itself
      const deletedRows = await db
        .delete(schema.bettingHouses)
        .where(eq(schema.bettingHouses.id, houseId));

      console.log(`✅ Casa de apostas ${houseId} excluída com sucesso`);
      res.json({ success: true, message: "Casa excluída com sucesso" });
    } catch (error) {
      console.error("❌ Erro ao excluir casa:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Registered postbacks routes
  app.get("/api/admin/registered-postbacks", requireAdmin, async (req, res) => {
    try {
      const postbacks = await db
        .select({
          id: schema.registeredPostbacks.id,
          name: schema.registeredPostbacks.name,
          url: schema.registeredPostbacks.url,
          house_id: schema.registeredPostbacks.houseId,
          houseName: schema.bettingHouses.name,
          event_type: schema.registeredPostbacks.eventType,
          description: schema.registeredPostbacks.description,
          is_active: schema.registeredPostbacks.isActive,
          created_at: schema.registeredPostbacks.createdAt,
          updated_at: schema.registeredPostbacks.updatedAt,
        })
        .from(schema.registeredPostbacks)
        .leftJoin(schema.bettingHouses, eq(schema.registeredPostbacks.houseId, schema.bettingHouses.id))
        .orderBy(desc(schema.registeredPostbacks.createdAt));

      res.json(postbacks);
    } catch (error) {
      console.error("❌ Erro ao buscar postbacks registrados:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/admin/registered-postbacks", requireAdmin, async (req, res) => {
    try {
      const { name, url, houseId, eventType, description, isActive } = req.body;

      if (!name || !url || !houseId || !eventType) {
        return res.status(400).json({ error: "Nome, URL, casa e tipo de evento são obrigatórios" });
      }

      const [postback] = await db
        .insert(schema.registeredPostbacks)
        .values({
          name,
          url,
          houseId: parseInt(houseId),
          eventType,
          description: description || null,
          isActive: isActive !== undefined ? isActive : true,
        })
        .returning();

      res.json(postback);
    } catch (error) {
      console.error("❌ Erro ao criar postback:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.put("/api/admin/registered-postbacks/:id", requireAdmin, async (req, res) => {
    try {
      const postbackId = parseInt(req.params.id);
      
      if (isNaN(postbackId)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const updateData = req.body;
      delete updateData.id;

      const [updatedPostback] = await db
        .update(schema.registeredPostbacks)
        .set(updateData)
        .where(eq(schema.registeredPostbacks.id, postbackId))
        .returning();

      if (!updatedPostback) {
        return res.status(404).json({ error: "Postback não encontrado" });
      }

      res.json(updatedPostback);
    } catch (error) {
      console.error("❌ Erro ao atualizar postback:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.delete("/api/admin/registered-postbacks/:id", requireAdmin, async (req, res) => {
    try {
      const postbackId = parseInt(req.params.id);
      
      if (isNaN(postbackId)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      await db
        .delete(schema.registeredPostbacks)
        .where(eq(schema.registeredPostbacks.id, postbackId));

      res.json({ success: true, message: "Postback excluído com sucesso" });
    } catch (error) {
      console.error("❌ Erro ao excluir postback:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Create affiliate link
  app.post("/api/affiliate/join/:houseId", requireAffiliate, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const houseId = parseInt(req.params.houseId);
      
      if (isNaN(houseId)) {
        return res.status(400).json({ error: "ID da casa inválido" });
      }

      // Check if house exists
      const [house] = await db
        .select()
        .from(schema.bettingHouses)
        .where(eq(schema.bettingHouses.id, houseId));

      if (!house) {
        return res.status(404).json({ error: "Casa não encontrada" });
      }

      // Check if user already has a link for this house
      const existingLink = await db
        .select()
        .from(schema.affiliateLinks)
        .where(and(
          eq(schema.affiliateLinks.userId, userId),
          eq(schema.affiliateLinks.houseId, houseId)
        ));

      if (existingLink.length > 0) {
        return res.status(400).json({ error: "Você já possui um link para esta casa" });
      }

      // Generate affiliate link
      const baseUrl = house.baseUrl;
      const userIdStr = userId.toString().padStart(6, '0');
      const generatedUrl = baseUrl.replace('VALUE', userIdStr);

      // Create affiliate link record
      const [newLink] = await db
        .insert(schema.affiliateLinks)
        .values({
          userId,
          houseId,
          generatedUrl,
          isActive: true,
        })
        .returning();

      console.log(`✅ Link de afiliação criado para usuário ${userId} na casa ${house.name}`);
      res.json({ success: true, link: newLink });
    } catch (error) {
      console.error("❌ Erro ao criar link de afiliação:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Join affiliate program - Create affiliate link
  app.post("/api/affiliate/join", requireAffiliate, async (req, res) => {
    try {
      const { houseId } = req.body;
      const userId = (req.user as any).id;

      if (!houseId) {
        return res.status(400).json({ error: "ID da casa é obrigatório" });
      }

      // Get user data for username as subid
      const [user] = await db
        .select({ username: schema.users.username })
        .from(schema.users)
        .where(eq(schema.users.id, userId));

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // Check if house exists
      const [house] = await db
        .select()
        .from(schema.bettingHouses)
        .where(eq(schema.bettingHouses.id, houseId));

      if (!house) {
        return res.status(404).json({ error: "Casa de apostas não encontrada" });
      }

      // Check if user already has a link for this house
      const existingLink = await db
        .select()
        .from(schema.affiliateLinks)
        .where(and(
          eq(schema.affiliateLinks.userId, userId),
          eq(schema.affiliateLinks.houseId, houseId)
        ));

      if (existingLink.length > 0) {
        return res.status(400).json({ error: "Você já possui um link para esta casa" });
      }

      // Generate affiliate link using username as subid
      const baseUrl = house.baseUrl;
      const generatedUrl = baseUrl.replace('VALUE', user.username);

      // Create affiliate link record
      const [newLink] = await db
        .insert(schema.affiliateLinks)
        .values({
          userId,
          houseId,
          generatedUrl,
          isActive: true,
        })
        .returning();

      console.log(`✅ Link de afiliação criado para usuário ${user.username} na casa ${house.name}`);
      res.json({ success: true, link: newLink });
    } catch (error) {
      console.error("❌ Erro ao criar link de afiliação:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Click tracking endpoint - registra cliques nos links de afiliados
  app.get("/track/:linkId", async (req, res) => {
    try {
      const { linkId } = req.params;
      
      // Buscar dados do link de afiliado
      const [linkData] = await db
        .select({
          id: schema.affiliateLinks.id,
          userId: schema.affiliateLinks.userId,
          houseId: schema.affiliateLinks.houseId,
          generatedUrl: schema.affiliateLinks.generatedUrl,
          isActive: schema.affiliateLinks.isActive,
          houseName: schema.bettingHouses.name,
          houseBaseUrl: schema.bettingHouses.baseUrl,
        })
        .from(schema.affiliateLinks)
        .leftJoin(schema.bettingHouses, eq(schema.affiliateLinks.houseId, schema.bettingHouses.id))
        .where(eq(schema.affiliateLinks.id, parseInt(linkId)));

      if (!linkData || !linkData.isActive) {
        return res.status(404).json({ error: "Link não encontrado ou inativo" });
      }

      // Get username for proper subid tracking
      const [user] = await db
        .select({ username: schema.users.username })
        .from(schema.users)
        .where(eq(schema.users.id, linkData.userId));

      // Capturar dados do clique
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      // Registrar o clique
      await db.insert(schema.clickTracking).values({
        linkId: linkData.id,
        userId: linkData.userId,
        houseId: linkData.houseId,
        ipAddress,
        userAgent,
      });

      // Registrar conversão de clique com subid correto
      await db.insert(schema.conversions).values({
        userId: linkData.userId,
        houseId: linkData.houseId,
        affiliateLinkId: linkData.id,
        type: 'click',
        amount: "0",
        commission: "0",
        conversionData: { 
          ipAddress, 
          userAgent, 
          source: 'affiliate_link',
          subid: user?.username || 'unknown',
          timestamp: new Date().toISOString()
        },
      });

      console.log(`📊 Clique registrado: Afiliado ${linkData.userId} → Casa ${linkData.houseName} (IP: ${ipAddress})`);

      // Redirecionar para a casa de apostas
      res.redirect(linkData.generatedUrl);
    } catch (error) {
      console.error("❌ Erro ao registrar clique:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get detailed click analytics for affiliate
  app.get("/api/affiliate/analytics", requireAffiliate, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { period = '7d' } = req.query;

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case '24h':
          startDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setDate(now.getDate() - 7);
      }

      // Get click data with details
      const clickData = await db
        .select({
          id: schema.clickTracking.id,
          linkId: schema.clickTracking.linkId,
          ipAddress: schema.clickTracking.ipAddress,
          userAgent: schema.clickTracking.userAgent,
          clickedAt: schema.clickTracking.clickedAt,
          houseName: schema.bettingHouses.name,
          houseId: schema.bettingHouses.id,
        })
        .from(schema.clickTracking)
        .leftJoin(schema.bettingHouses, eq(schema.clickTracking.houseId, schema.bettingHouses.id))
        .where(and(
          eq(schema.clickTracking.userId, userId),
          gte(schema.clickTracking.clickedAt, startDate)
        ))
        .orderBy(desc(schema.clickTracking.clickedAt));

      // Get conversion data
      const conversionData = await db
        .select({
          id: schema.conversions.id,
          type: schema.conversions.type,
          amount: schema.conversions.amount,
          commission: schema.conversions.commission,
          convertedAt: schema.conversions.convertedAt,
          houseName: schema.bettingHouses.name,
          customerId: schema.conversions.customerId,
        })
        .from(schema.conversions)
        .leftJoin(schema.bettingHouses, eq(schema.conversions.houseId, schema.bettingHouses.id))
        .where(and(
          eq(schema.conversions.userId, userId),
          gte(schema.conversions.convertedAt, startDate)
        ))
        .orderBy(desc(schema.conversions.convertedAt));

      // Group clicks by day for chart data
      const clicksByDay = clickData.reduce((acc, click) => {
        if (click.clickedAt) {
          const day = click.clickedAt.toISOString().split('T')[0];
          acc[day] = (acc[day] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Group clicks by house
      const clicksByHouse = clickData.reduce((acc, click) => {
        const house = click.houseName || 'Unknown';
        acc[house] = (acc[house] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate summary stats
      const stats = {
        totalClicks: clickData.length,
        totalConversions: conversionData.filter(c => c.type !== 'click').length,
        totalCommission: conversionData.reduce((sum, c) => sum + parseFloat(c.commission || '0'), 0),
        conversionRate: clickData.length > 0 ? 
          (conversionData.filter(c => c.type !== 'click').length / clickData.length * 100) : 0,
        clicksByDay,
        clicksByHouse,
        recentClicks: clickData.slice(0, 20), // Last 20 clicks
        recentConversions: conversionData.slice(0, 10), // Last 10 conversions
      };

      res.json(stats);
    } catch (error) {
      console.error("Erro ao buscar analytics:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get affiliate links with complete data and click statistics
  app.get("/api/affiliate/links", requireAffiliate, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      const links = await db
        .select({
          id: schema.affiliateLinks.id,
          userId: schema.affiliateLinks.userId,
          houseId: schema.affiliateLinks.houseId,
          generatedUrl: schema.affiliateLinks.generatedUrl,
          isActive: schema.affiliateLinks.isActive,
          createdAt: schema.affiliateLinks.createdAt,
          houseName: schema.bettingHouses.name,
        })
        .from(schema.affiliateLinks)
        .leftJoin(schema.bettingHouses, eq(schema.affiliateLinks.houseId, schema.bettingHouses.id))
        .where(eq(schema.affiliateLinks.userId, userId))
        .orderBy(desc(schema.affiliateLinks.createdAt));

      // Get click counts for each link
      const linksWithStats = await Promise.all(
        links.map(async (link) => {
          const clickCount = await db
            .select({ count: count() })
            .from(schema.clickTracking)
            .where(eq(schema.clickTracking.linkId, link.id));

          const conversionCount = await db
            .select({ count: count() })
            .from(schema.conversions)
            .where(and(
              eq(schema.conversions.userId, userId),
              eq(schema.conversions.houseId, link.houseId)
            ));

          return {
            ...link,
            clickCount: clickCount[0]?.count || 0,
            conversionCount: conversionCount[0]?.count || 0,
          };
        })
      );

      res.json(linksWithStats);
    } catch (error) {
      console.error("Erro ao buscar links:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get affiliate stats
  app.get("/api/affiliate/stats", requireAffiliate, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Get conversions for this user
      const conversions = await db
        .select()
        .from(schema.conversions)
        .where(eq(schema.conversions.userId, userId));

      const totalClicks = conversions.filter(c => c.type === 'click').length;
      const totalRegistrations = conversions.filter(c => c.type === 'registration').length;
      const totalDeposits = conversions.filter(c => c.type === 'deposit').length;
      const totalCommission = conversions.reduce((sum, c) => sum + parseFloat(c.commission || '0'), 0);
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
      console.error("Erro ao buscar estatísticas do afiliado:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get affiliate conversions
  app.get("/api/affiliate/conversions", requireAffiliate, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      const conversions = await db
        .select({
          id: schema.conversions.id,
          type: schema.conversions.type,
          commission: schema.conversions.commission,
          customerId: schema.conversions.customerId,
          convertedAt: schema.conversions.convertedAt,
          houseName: schema.bettingHouses.name,
        })
        .from(schema.conversions)
        .leftJoin(schema.bettingHouses, eq(schema.conversions.houseId, schema.bettingHouses.id))
        .where(eq(schema.conversions.userId, userId))
        .orderBy(desc(schema.conversions.convertedAt))
        .limit(10);

      res.json(conversions);
    } catch (error) {
      console.error("Erro ao buscar conversões:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get affiliate postbacks
  app.get("/api/affiliate/postbacks", requireAffiliate, async (req, res) => {
    try {
      // Return empty array for now to avoid database errors
      // This will be populated when postback data is available
      res.json([]);
    } catch (error) {
      console.error("Erro ao buscar postbacks:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get house-specific statistics for affiliate
  app.get("/api/stats/house/:houseId", requireAffiliate, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const houseId = parseInt(req.params.houseId);

      // Get affiliate link for this house
      const affiliateLink = await db
        .select()
        .from(schema.affiliateLinks)
        .where(and(
          eq(schema.affiliateLinks.userId, userId),
          eq(schema.affiliateLinks.houseId, houseId)
        ))
        .limit(1);

      if (!affiliateLink.length) {
        return res.status(404).json({ error: "Link de afiliado não encontrado" });
      }

      const link = affiliateLink[0];

      // Get clicks for this house
      const clicks = await db
        .select()
        .from(schema.clickTracking)
        .where(and(
          eq(schema.clickTracking.userId, userId),
          eq(schema.clickTracking.houseId, houseId)
        ));

      // Get conversions for this house
      const conversions = await db
        .select()
        .from(schema.conversions)
        .where(and(
          eq(schema.conversions.userId, userId),
          eq(schema.conversions.houseId, houseId)
        ));

      // Calculate metrics
      const totalClicks = clicks.length;
      const totalRegistrations = conversions.filter(c => c.type === 'registration').length;
      const totalDeposits = conversions.filter(c => c.type === 'deposit').length;
      const totalCommission = conversions.reduce((sum, c) => sum + parseFloat(c.commission || '0'), 0);

      // Get last 30 days data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentClicks = clicks.filter(c => c.clickedAt && new Date(c.clickedAt) >= thirtyDaysAgo).length;
      const recentConversions = conversions.filter(c => c.convertedAt && new Date(c.convertedAt) >= thirtyDaysAgo).length;

      // Calculate growth (mock calculation for demonstration)
      const monthlyGrowth = recentConversions > 0 ? 15.5 : 0;

      // Generate daily stats for the last 7 days
      const dailyStats = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayClicks = clicks.filter(c => {
          if (!c.clickedAt) return false;
          const clickDate = new Date(c.clickedAt.toString());
          return clickDate.toDateString() === date.toDateString();
        }).length;
        
        dailyStats.push({
          date: date.toISOString().split('T')[0],
          clicks: dayClicks,
          conversions: Math.floor(dayClicks * 0.03) // 3% conversion rate simulation
        });
      }

      res.json({
        totalClicks,
        totalRegistrations,
        totalDeposits,
        totalCommission,
        conversionRate: totalClicks > 0 ? (totalRegistrations / totalClicks * 100) : 0,
        avgCommission: totalRegistrations > 0 ? (totalCommission / totalRegistrations) : 0,
        monthlyGrowth,
        linkCreatedAt: link.createdAt,
        recentClicks,
        recentConversions,
        dailyStats,
        topPerformingDays: dailyStats.sort((a, b) => b.clicks - a.clicks).slice(0, 3)
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas da casa:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get user links (affiliate route) - Legacy endpoint
  app.get("/api/my-links", requireAffiliate, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      const links = await db
        .select({
          id: schema.affiliateLinks.id,
          generatedUrl: schema.affiliateLinks.generatedUrl,
          createdAt: schema.affiliateLinks.createdAt,
          houseName: schema.bettingHouses.name,
          houseId: schema.affiliateLinks.houseId,
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

  // Postback routes for betting houses
  app.get("/postback/click", async (req, res) => {
    try {
      const { token, subid, customer_id, value } = req.query;
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      
      console.log(`🔔 POSTBACK CLICK: token=${token}, subid=${subid}, customer_id=${customer_id}, value=${value}`);
      
      if (!token || !subid) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Token e subid são obrigatórios' 
        });
      }

      // Find affiliate by username (subid)
      const [affiliate] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.username, subid as string))
        .limit(1);

      if (!affiliate) {
        console.log(`❌ Afiliado não encontrado: ${subid}`);
        return res.status(404).json({ 
          status: 'error', 
          message: 'Afiliado não encontrado' 
        });
      }

      // Find house by security token
      const [house] = await db
        .select()
        .from(schema.bettingHouses)
        .where(eq(schema.bettingHouses.securityToken, token as string))
        .limit(1);

      if (!house) {
        console.log(`❌ Casa não encontrada para token: ${token}`);
        return res.status(404).json({ 
          status: 'error', 
          message: 'Token de segurança inválido' 
        });
      }

      // Register click conversion
      await db.insert(schema.conversions).values({
        userId: affiliate.id,
        houseId: house.id,
        type: 'click',
        amount: (value as string) || "0",
        commission: "0",
        customerId: customer_id as string,
        conversionData: {
          source: 'postback_click',
          ip,
          token,
          timestamp: new Date().toISOString(),
          houseName: house.name,
        },
      });

      console.log(`✅ Click registrado para ${affiliate.username}`);
      res.json({ 
        status: 'ok', 
        event: 'click',
        message: 'Click registrado com sucesso',
        affiliate: affiliate.username
      });

    } catch (error) {
      console.error("❌ Erro no postback click:", error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Erro interno do servidor' 
      });
    }
  });

  app.get("/postback/register", async (req, res) => {
    try {
      const { token, subid, customer_id, value } = req.query;
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      
      console.log(`🔔 POSTBACK REGISTER: token=${token}, subid=${subid}, customer_id=${customer_id}`);
      
      if (!token || !subid) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Token e subid são obrigatórios' 
        });
      }

      // Find affiliate by username (subid)
      const [affiliate] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.username, subid as string))
        .limit(1);

      if (!affiliate) {
        console.log(`❌ Afiliado não encontrado: ${subid}`);
        return res.status(404).json({ 
          status: 'error', 
          message: 'Afiliado não encontrado' 
        });
      }

      // Find house by security token
      const [house] = await db
        .select()
        .from(schema.bettingHouses)
        .where(eq(schema.bettingHouses.securityToken, token as string))
        .limit(1);

      if (!house) {
        console.log(`❌ Casa não encontrada para token: ${token}`);
        return res.status(404).json({ 
          status: 'error', 
          message: 'Token de segurança inválido' 
        });
      }

      // Register registration conversion
      await db.insert(schema.conversions).values({
        userId: affiliate.id,
        houseId: house.id,
        type: 'registration',
        amount: "0",
        commission: "0",
        customerId: customer_id as string,
        conversionData: {
          source: 'postback_register',
          ip,
          token,
          timestamp: new Date().toISOString(),
          houseName: house.name,
        },
      });

      console.log(`✅ Registro registrado para ${affiliate.username}`);
      res.json({ 
        status: 'ok', 
        event: 'register',
        message: 'Registro registrado com sucesso',
        affiliate: affiliate.username
      });

    } catch (error) {
      console.error("❌ Erro no postback register:", error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Erro interno do servidor' 
      });
    }
  });

  app.get("/postback/deposit", async (req, res) => {
    try {
      const { token, subid, customer_id, value } = req.query;
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      
      console.log(`🔔 POSTBACK DEPOSIT: token=${token}, subid=${subid}, customer_id=${customer_id}, value=${value}`);
      
      if (!token || !subid) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Token e subid são obrigatórios' 
        });
      }

      // Find affiliate by username (subid)
      const [affiliate] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.username, subid as string))
        .limit(1);

      if (!affiliate) {
        console.log(`❌ Afiliado não encontrado: ${subid}`);
        return res.status(404).json({ 
          status: 'error', 
          message: 'Afiliado não encontrado' 
        });
      }

      const depositAmount = parseFloat(value as string || '0');
      
      // Calculate commission (example: R$ 150 CPA for deposits >= R$ 10)
      let commission = 0;
      if (depositAmount >= 10) {
        commission = 150; // CPA value
      }

      // Find house by security token
      const [house] = await db
        .select()
        .from(schema.bettingHouses)
        .where(eq(schema.bettingHouses.securityToken, token as string))
        .limit(1);

      if (!house) {
        console.log(`❌ Casa não encontrada para token: ${token}`);
        return res.status(404).json({ 
          status: 'error', 
          message: 'Token de segurança inválido' 
        });
      }

      // Register deposit conversion
      await db.insert(schema.conversions).values({
        userId: affiliate.id,
        houseId: house.id,
        type: 'deposit',
        amount: depositAmount.toString(),
        commission: commission.toString(),
        customerId: customer_id as string,
        conversionData: {
          source: 'postback_deposit',
          ip,
          token,
          timestamp: new Date().toISOString(),
          houseName: house.name,
        },
      });

      console.log(`✅ Depósito registrado para ${affiliate.username} - Valor: R$ ${depositAmount} - Comissão: R$ ${commission}`);
      res.json({ 
        status: 'ok', 
        event: 'deposit',
        message: 'Depósito registrado com sucesso',
        affiliate: affiliate.username,
        amount: depositAmount,
        commission: commission
      });

    } catch (error) {
      console.error("❌ Erro no postback deposit:", error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Erro interno do servidor' 
      });
    }
  });

  app.get("/postback/revenue", async (req, res) => {
    try {
      const { token, subid, customer_id, value } = req.query;
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      
      console.log(`🔔 POSTBACK REVENUE: token=${token}, subid=${subid}, customer_id=${customer_id}, value=${value}`);
      
      if (!token || !subid) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Token e subid são obrigatórios' 
        });
      }

      // Find affiliate by username (subid)
      const [affiliate] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.username, subid as string))
        .limit(1);

      if (!affiliate) {
        console.log(`❌ Afiliado não encontrado: ${subid}`);
        return res.status(404).json({ 
          status: 'error', 
          message: 'Afiliado não encontrado' 
        });
      }

      const revenueAmount = parseFloat(value as string || '0');
      
      // Calculate commission (example: 30% RevShare)
      const commission = revenueAmount * 0.30;

      // Find house by security token
      const [house] = await db
        .select()
        .from(schema.bettingHouses)
        .where(eq(schema.bettingHouses.securityToken, token as string))
        .limit(1);

      if (!house) {
        console.log(`❌ Casa não encontrada para token: ${token}`);
        return res.status(404).json({ 
          status: 'error', 
          message: 'Token de segurança inválido' 
        });
      }

      // Register revenue conversion
      await db.insert(schema.conversions).values({
        userId: affiliate.id,
        houseId: house.id,
        type: 'profit',
        amount: revenueAmount.toString(),
        commission: commission.toString(),
        customerId: customer_id as string,
        conversionData: {
          source: 'postback_revenue',
          ip,
          token,
          timestamp: new Date().toISOString(),
          houseName: house.name,
        },
      });

      console.log(`✅ Receita registrada para ${affiliate.username} - Valor: R$ ${revenueAmount} - Comissão: R$ ${commission}`);
      res.json({ 
        status: 'ok', 
        event: 'revenue',
        message: 'Receita registrada com sucesso',
        affiliate: affiliate.username,
        amount: revenueAmount,
        commission: commission
      });

    } catch (error) {
      console.error("❌ Erro no postback revenue:", error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Erro interno do servidor' 
      });
    }
  });

  // Postback logs API endpoint
  app.get("/api/admin/postback-logs", requireAdmin, async (req, res) => {
    try {
      const { casa, status, limit = 50, offset = 0 } = req.query;
      
      // Get conversions with house and user information
      const logs = await db
        .select()
        .from(schema.conversions)
        .leftJoin(schema.bettingHouses, eq(schema.conversions.houseId, schema.bettingHouses.id))
        .leftJoin(schema.users, eq(schema.conversions.userId, schema.users.id))
        .orderBy(desc(schema.conversions.convertedAt))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));

      // Transform data for frontend
      const transformedLogs = logs.map(log => ({
        id: log.conversions.id,
        event_type: log.conversions.type,
        subid: log.users?.username || 'unknown',
        casa: log.betting_houses?.name || 'unknown',
        customer_id: log.conversions.customerId,
        amount: log.conversions.amount,
        commission: log.conversions.commission,
        status: 'success',
        status_code: 200,
        created_at: log.conversions.convertedAt,
        ip: (log.conversions.conversionData as any)?.ip || 'unknown',
        house_id: log.conversions.houseId,
        user_id: log.conversions.userId,
        conversion_data: log.conversions.conversionData,
      }));

      res.json(transformedLogs);
    } catch (error) {
      console.error("❌ Erro ao buscar logs de postback:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Webhook endpoints for betting houses
  app.use('/webhook', webhookRouter);

  // Smartico Conversions API Routes
  
  // Get conversions with filters and pagination
  app.get("/api/conversions", requireAdmin, async (req, res) => {
    try {
      const { 
        date_from, 
        date_to, 
        user_id, 
        house_id, 
        page = 1, 
        limit = 50 
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const baseQueryBuilder = db
        .select({
          id: schema.conversions.id,
          type: schema.conversions.type,
          amount: schema.conversions.amount,
          commission: schema.conversions.commission,
          convertedAt: schema.conversions.convertedAt,
          userId: schema.conversions.userId,
          houseId: schema.conversions.houseId,
          affiliateName: schema.users.fullName,
          affiliateUsername: schema.users.username,
          houseName: schema.bettingHouses.name,
        })
        .from(schema.conversions)
        .leftJoin(schema.users, eq(schema.conversions.userId, schema.users.id))
        .leftJoin(schema.bettingHouses, eq(schema.conversions.houseId, schema.bettingHouses.id));

      const conditions = [];
      
      if (date_from) {
        conditions.push(gte(schema.conversions.convertedAt, new Date(date_from as string)));
      }
      
      if (date_to) {
        const endDate = new Date(date_to as string);
        endDate.setHours(23, 59, 59, 999);
        conditions.push(lt(schema.conversions.convertedAt, endDate));
      }
      
      if (user_id) {
        conditions.push(eq(schema.conversions.userId, parseInt(user_id as string)));
      }
      
      if (house_id) {
        conditions.push(eq(schema.conversions.houseId, parseInt(house_id as string)));
      }

      const finalQuery = conditions.length > 0 
        ? baseQueryBuilder.where(and(...conditions))
        : baseQueryBuilder;

      const conversions = await finalQuery
        .orderBy(desc(schema.conversions.convertedAt))
        .limit(parseInt(limit as string))
        .offset(offset);

      // Get totals with proper query structure
      const totalsQueryBuilder = db
        .select({
          totalClick: sql<number>`COUNT(CASE WHEN ${schema.conversions.type} = 'click' THEN 1 END)`,
          totalRegistration: sql<number>`COUNT(CASE WHEN ${schema.conversions.type} = 'registration' THEN 1 END)`,
          totalDeposit: sql<number>`COUNT(CASE WHEN ${schema.conversions.type} = 'deposit' THEN 1 END)`,
          totalProfit: sql<number>`COUNT(CASE WHEN ${schema.conversions.type} = 'profit' THEN 1 END)`,
          totalCommissions: sql<number>`COALESCE(SUM(CASE WHEN ${schema.conversions.commission} IS NOT NULL THEN CAST(${schema.conversions.commission} AS DECIMAL) END), 0)`,
          totalAmount: sql<number>`COALESCE(SUM(CASE WHEN ${schema.conversions.amount} IS NOT NULL THEN CAST(${schema.conversions.amount} AS DECIMAL) END), 0)`,
        })
        .from(schema.conversions);

      const finalTotalsQuery = conditions.length > 0 
        ? totalsQueryBuilder.where(and(...conditions))
        : totalsQueryBuilder;

      const [totals] = await finalTotalsQuery;

      res.json({
        success: true,
        data: conversions,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          hasMore: conversions.length === parseInt(limit as string)
        },
        totals
      });
    } catch (error) {
      console.error("Erro ao buscar conversões:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get affiliates for filter dropdown
  app.get("/api/conversions/affiliates", requireAdmin, async (req, res) => {
    try {
      const affiliates = await db
        .select({
          id: schema.users.id,
          name: schema.users.fullName,
          username: schema.users.username,
        })
        .from(schema.users)
        .where(eq(schema.users.role, 'affiliate'))
        .orderBy(schema.users.fullName);

      res.json({
        success: true,
        data: affiliates
      });
    } catch (error) {
      console.error("Erro ao buscar afiliados:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get houses for filter dropdown
  app.get("/api/conversions/houses", requireAdmin, async (req, res) => {
    try {
      const houses = await db
        .select({
          id: schema.bettingHouses.id,
          name: schema.bettingHouses.name,
        })
        .from(schema.bettingHouses)
        .where(eq(schema.bettingHouses.isActive, true))
        .orderBy(schema.bettingHouses.name);

      res.json({
        success: true,
        data: houses
      });
    } catch (error) {
      console.error("Erro ao buscar casas:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Manual sync endpoint
  app.post("/api/conversions/sync", requireAdmin, async (req, res) => {
    try {
      // Import here to avoid circular dependencies
      const { SmarticoFetcher } = await import('./services/smarticoFetcher');
      
      const fetcher = new SmarticoFetcher();
      await fetcher.syncAllHouses();
      
      res.json({
        success: true,
        message: "Sincronização concluída com sucesso"
      });
    } catch (error) {
      console.error("Erro na sincronização manual:", error);
      res.status(500).json({ 
        success: false, 
        error: "Erro na sincronização" 
      });
    }
  });

  // API Integration routes
  app.post("/api/admin/houses/:id/sync", requireAdmin, async (req, res) => {
    try {
      const houseId = parseInt(req.params.id);
      
      const { ApiSyncScheduler } = await import('./cron/apiSyncScheduler');
      const scheduler = ApiSyncScheduler.getInstance();
      
      const result = await scheduler.manualSync(houseId);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Erro na sincronização manual:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erro interno do servidor" 
      });
    }
  });

  app.post("/api/admin/houses/:id/test-connection", requireAdmin, async (req, res) => {
    try {
      const houseId = parseInt(req.params.id);
      
      const { ApiSyncScheduler } = await import('./cron/apiSyncScheduler');
      const scheduler = ApiSyncScheduler.getInstance();
      
      const result = await scheduler.testHouseConnection(houseId);
      res.json(result);
    } catch (error) {
      console.error("Erro no teste de conexão:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erro interno do servidor" 
      });
    }
  });

  app.get("/api/admin/houses/sync-status", requireAdmin, async (req, res) => {
    try {
      const houses = await db
        .select({
          id: schema.bettingHouses.id,
          name: schema.bettingHouses.name,
          integrationType: schema.bettingHouses.integrationType,
          syncStatus: schema.bettingHouses.syncStatus,
          lastSyncAt: schema.bettingHouses.lastSyncAt,
          syncErrorMessage: schema.bettingHouses.syncErrorMessage,
          syncInterval: schema.bettingHouses.syncInterval
        })
        .from(schema.bettingHouses)
        .where(eq(schema.bettingHouses.integrationType, 'api'));

      res.json({ success: true, data: houses });
    } catch (error) {
      console.error("Erro ao buscar status de sincronização:", error);
      res.status(500).json({ 
        success: false, 
        error: "Erro interno do servidor" 
      });
    }
  });

  // Postback endpoint for commission calculation
  app.get('/postback/:casa/:evento', handlePostback);

  // === PAYMENT MANAGEMENT ROUTES ===
  
  // Get payment statistics for admin dashboard
  app.get("/api/admin/payments/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await db
        .select({
          status: schema.payments.status,
          totalAmount: sql<string>`COALESCE(SUM(${schema.payments.amount}), 0)`,
          count: sql<number>`COUNT(*)`
        })
        .from(schema.payments)
        .innerJoin(schema.users, eq(schema.payments.userId, schema.users.id))
        .where(and(
          eq(schema.users.role, 'affiliate'),
          eq(schema.users.isActive, true)
        ))
        .groupBy(schema.payments.status);

      // Get monthly volume (current month)
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      
      const monthlyVolume = await db
        .select({
          totalAmount: sql<string>`COALESCE(SUM(${schema.payments.amount}), 0)`
        })
        .from(schema.payments)
        .innerJoin(schema.users, eq(schema.payments.userId, schema.users.id))
        .where(and(
          gte(schema.payments.createdAt, currentMonth),
          eq(schema.users.role, 'affiliate'),
          eq(schema.users.isActive, true)
        ));

      const result = {
        totalPendingAmount: stats.find(s => s.status === 'pending')?.totalAmount || '0',
        totalCompletedAmount: stats.find(s => s.status === 'completed')?.totalAmount || '0',
        totalFailedAmount: stats.find(s => s.status === 'failed')?.totalAmount || '0',
        pendingCount: stats.find(s => s.status === 'pending')?.count || 0,
        completedCount: stats.find(s => s.status === 'completed')?.count || 0,
        failedCount: stats.find(s => s.status === 'failed')?.count || 0,
        monthlyVolume: monthlyVolume[0]?.totalAmount || '0',
        averagePayment: stats.length > 0 
          ? ((parseFloat(stats.find(s => s.status === 'completed')?.totalAmount || '0') / 
              (stats.find(s => s.status === 'completed')?.count || 1))).toFixed(2)
          : '0'
      };

      res.json(result);
    } catch (error) {
      console.error("Erro ao buscar estatísticas de pagamentos:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get paginated payments with filters
  app.get("/api/admin/payments", requireAdmin, async (req, res) => {
    try {
      const {
        page = 1,
        limit = 25,
        status,
        method,
        dateFrom,
        dateTo,
        search,
        minAmount,
        maxAmount
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      
      // Build where conditions
      const conditions = [];
      
      // Only show payments from actual affiliates
      conditions.push(eq(schema.users.role, 'affiliate'));
      conditions.push(eq(schema.users.isActive, true));
      
      if (status && status !== 'all') {
        conditions.push(eq(schema.payments.status, status as string));
      }
      
      if (method && method !== 'all') {
        conditions.push(eq(schema.payments.method, method as string));
      }
      
      if (dateFrom) {
        conditions.push(gte(schema.payments.createdAt, new Date(dateFrom as string)));
      }
      
      if (dateTo) {
        const endDate = new Date(dateTo as string);
        endDate.setHours(23, 59, 59, 999);
        conditions.push(lt(schema.payments.createdAt, endDate));
      }
      
      if (minAmount) {
        conditions.push(gte(schema.payments.amount, minAmount as string));
      }
      
      if (maxAmount) {
        conditions.push(sql`${schema.payments.amount} <= ${maxAmount}`);
      }

      // Search in user data
      if (search) {
        conditions.push(
          or(
            ilike(schema.users.fullName, `%${search}%`),
            ilike(schema.users.email, `%${search}%`),
            ilike(schema.users.username, `%${search}%`),
            sql`CAST(${schema.payments.id} AS TEXT) ILIKE ${`%${search}%`}`
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get payments with user data
      const payments = await db
        .select({
          id: schema.payments.id,
          amount: schema.payments.amount,
          method: schema.payments.method,
          pixKey: schema.payments.pixKey,
          status: schema.payments.status,
          transactionId: schema.payments.transactionId,
          paidAt: schema.payments.paidAt,
          createdAt: schema.payments.createdAt,
          userId: schema.payments.userId,
          userFullName: schema.users.fullName,
          userEmail: schema.users.email,
          userUsername: schema.users.username,
          userPixKeyType: schema.users.pixKeyType,
          userPixKeyValue: schema.users.pixKeyValue
        })
        .from(schema.payments)
        .innerJoin(schema.users, eq(schema.payments.userId, schema.users.id))
        .where(whereClause)
        .orderBy(desc(schema.payments.createdAt))
        .limit(Number(limit))
        .offset(offset);

      // Get total count
      const totalResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(schema.payments)
        .innerJoin(schema.users, eq(schema.payments.userId, schema.users.id))
        .where(whereClause);

      const total = totalResult[0]?.count || 0;

      res.json({
        payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error("Erro ao buscar pagamentos:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get payment details
  app.get("/api/admin/payments/:id", requireAdmin, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      
      const payment = await db
        .select({
          id: schema.payments.id,
          amount: schema.payments.amount,
          method: schema.payments.method,
          pixKey: schema.payments.pixKey,
          status: schema.payments.status,
          transactionId: schema.payments.transactionId,
          paidAt: schema.payments.paidAt,
          createdAt: schema.payments.createdAt,
          userId: schema.payments.userId,
          userFullName: schema.users.fullName,
          userEmail: schema.users.email,
          userUsername: schema.users.username,
          userPixKeyType: schema.users.pixKeyType,
          userPixKeyValue: schema.users.pixKeyValue,
          userPhone: schema.users.phone,
          userCity: schema.users.city,
          userState: schema.users.state
        })
        .from(schema.payments)
        .innerJoin(schema.users, eq(schema.payments.userId, schema.users.id))
        .where(eq(schema.payments.id, paymentId))
        .limit(1);

      if (!payment.length) {
        return res.status(404).json({ error: "Pagamento não encontrado" });
      }

      res.json(payment[0]);
    } catch (error) {
      console.error("Erro ao buscar detalhes do pagamento:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Update payment
  app.put("/api/admin/payments/:id", requireAdmin, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const { status, transactionId, pixKey, method } = req.body;

      const updateData: any = {};
      
      if (status !== undefined) {
        updateData.status = status;
        if (status === 'completed') {
          updateData.paidAt = new Date();
        }
      }
      
      if (transactionId !== undefined) {
        updateData.transactionId = transactionId;
      }
      
      if (pixKey !== undefined) {
        updateData.pixKey = pixKey;
      }
      
      if (method !== undefined) {
        updateData.method = method;
      }

      const result = await db
        .update(schema.payments)
        .set(updateData)
        .where(eq(schema.payments.id, paymentId))
        .returning();

      if (!result.length) {
        return res.status(404).json({ error: "Pagamento não encontrado" });
      }

      res.json({ success: true, payment: result[0] });
    } catch (error) {
      console.error("Erro ao atualizar pagamento:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Individual payment update
  app.patch("/api/admin/payments/:id", requireAdmin, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const updateData = req.body;

      if (!paymentId || isNaN(paymentId)) {
        return res.status(400).json({ error: "ID do pagamento inválido" });
      }

      // Set processedAt timestamp for status changes
      if (updateData.status && (updateData.status === 'approved' || updateData.status === 'rejected')) {
        updateData.processedAt = new Date().toISOString();
      }

      const [updatedPayment] = await db
        .update(schema.payments)
        .set(updateData)
        .where(eq(schema.payments.id, paymentId))
        .returning();

      if (!updatedPayment) {
        return res.status(404).json({ error: "Pagamento não encontrado" });
      }

      res.json({ success: true, payment: updatedPayment });
    } catch (error) {
      console.error("Erro ao atualizar pagamento:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Bulk update payments
  app.patch("/api/admin/payments/bulk-update", requireAdmin, async (req, res) => {
    try {
      const { ids, status } = req.body;

      if (!ids || !Array.isArray(ids) || !status) {
        return res.status(400).json({ error: "Dados inválidos" });
      }

      const updateData: any = {
        status,
        processedAt: new Date().toISOString()
      };

      const result = await db
        .update(schema.payments)
        .set(updateData)
        .where(inArray(schema.payments.id, ids))
        .returning({ id: schema.payments.id });

      res.json({ 
        success: true, 
        message: `${result.length} pagamentos atualizados`,
        updatedIds: result.map(r => r.id)
      });
    } catch (error) {
      console.error("Erro na ação em lote:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Export payments
  app.get("/api/admin/payments/export", requireAdmin, async (req, res) => {
    try {
      const payments = await db
        .select({
          id: schema.payments.id,
          amount: schema.payments.amount,
          status: schema.payments.status,
          method: schema.payments.method,
          userName: schema.users.fullName,
          userEmail: schema.users.email,
          pixKey: schema.payments.pixKey,
          transactionId: schema.payments.transactionId,
          createdAt: schema.payments.createdAt,
          paidAt: schema.payments.paidAt
        })
        .from(schema.payments)
        .leftJoin(schema.users, eq(schema.payments.userId, schema.users.id))
        .orderBy(desc(schema.payments.createdAt));

      // Convert to CSV
      const csvHeader = 'ID,Valor,Status,Método,Usuário,Email,Chave PIX,ID Transação,Data Solicitação,Data Processamento\n';
      const csvData = payments.map(p => 
        `${p.id},"R$ ${parseFloat(p.amount).toFixed(2)}",${p.status},${p.method},"${p.userName}","${p.userEmail}","${p.pixKey || ''}","${p.transactionId || ''}","${p.createdAt}","${p.paidAt || ''}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="pagamentos.csv"');
      res.send(csvHeader + csvData);
    } catch (error) {
      console.error("Erro ao exportar pagamentos:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Legacy bulk actions for payments (keeping for compatibility)
  app.post("/api/admin/payments/bulk", requireAdmin, async (req, res) => {
    try {
      const { action, paymentIds, transactionId } = req.body;

      if (!action || !paymentIds || !Array.isArray(paymentIds)) {
        return res.status(400).json({ error: "Dados inválidos" });
      }

      let updateData: any = {};
      
      switch (action) {
        case 'approve':
          updateData = {
            status: 'completed',
            paidAt: new Date(),
            ...(transactionId && { transactionId })
          };
          break;
        case 'reject':
          updateData = { status: 'failed' };
          break;
        default:
          return res.status(400).json({ error: "Ação inválida" });
      }

      const result = await db
        .update(schema.payments)
        .set(updateData)
        .where(inArray(schema.payments.id, paymentIds))
        .returning({ id: schema.payments.id });

      res.json({ 
        success: true, 
        message: `${result.length} pagamentos atualizados`,
        updatedIds: result.map(r => r.id)
      });
    } catch (error) {
      console.error("Erro na ação em lote:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Enhanced payment management endpoints
  
  // Approve payment with detailed logging
  app.post("/api/admin/payments/:id/approve", requireAdmin, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const { notes, adminName, transactionId, estimatedProcessingTime } = req.body;

      if (!notes || !adminName) {
        return res.status(400).json({ error: "Observações e nome do admin são obrigatórios" });
      }

      // Update payment status
      const [updatedPayment] = await db
        .update(schema.payments)
        .set({
          status: 'completed',
          paidAt: new Date(),
          transactionId: transactionId || null
        })
        .where(eq(schema.payments.id, paymentId))
        .returning();

      if (!updatedPayment) {
        return res.status(404).json({ error: "Pagamento não encontrado" });
      }

      // Log the action for audit trail
      console.log(`💳 Pagamento ${paymentId} aprovado por ${adminName}: ${notes}`);

      res.json({ 
        success: true, 
        payment: updatedPayment,
        message: "Pagamento aprovado com sucesso" 
      });
    } catch (error) {
      console.error("Erro ao aprovar pagamento:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Reject payment with detailed logging
  app.post("/api/admin/payments/:id/reject", requireAdmin, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const { notes, adminName } = req.body;

      if (!notes || !adminName) {
        return res.status(400).json({ error: "Motivo da rejeição e nome do admin são obrigatórios" });
      }

      // Update payment status
      const [updatedPayment] = await db
        .update(schema.payments)
        .set({
          status: 'failed'
        })
        .where(eq(schema.payments.id, paymentId))
        .returning();

      if (!updatedPayment) {
        return res.status(404).json({ error: "Pagamento não encontrado" });
      }

      // Log the action for audit trail
      console.log(`❌ Pagamento ${paymentId} rejeitado por ${adminName}: ${notes}`);

      res.json({ 
        success: true, 
        payment: updatedPayment,
        message: "Pagamento rejeitado com sucesso" 
      });
    } catch (error) {
      console.error("Erro ao rejeitar pagamento:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Enhanced bulk actions with logging
  app.post("/api/admin/payments/bulk-action", requireAdmin, async (req, res) => {
    try {
      const { paymentIds, action, notes } = req.body;

      if (!paymentIds || !Array.isArray(paymentIds) || !action) {
        return res.status(400).json({ error: "Dados inválidos para ação em lote" });
      }

      let updateData: any = {};

      switch (action) {
        case 'approve':
          updateData.status = 'completed';
          updateData.paidAt = new Date();
          break;
        case 'reject':
          updateData.status = 'failed';
          break;
        default:
          return res.status(400).json({ error: "Ação inválida" });
      }

      const result = await db
        .update(schema.payments)
        .set(updateData)
        .where(inArray(schema.payments.id, paymentIds))
        .returning({ id: schema.payments.id });

      console.log(`📊 Ação em lote '${action}' aplicada a ${result.length} pagamentos`);

      res.json({ 
        success: true, 
        message: `${result.length} pagamentos processados com sucesso`,
        updatedIds: result.map(r => r.id)
      });
    } catch (error) {
      console.error("Erro na ação em lote:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get user commission data
  app.get("/api/admin/users/commissions/:userId", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);

      if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: "ID do usuário inválido" });
      }

      // Get user data - only allow affiliate accounts
      const [user] = await db
        .select()
        .from(schema.users)
        .where(and(
          eq(schema.users.id, userId),
          eq(schema.users.role, 'affiliate'),
          eq(schema.users.isActive, true)
        ));

      if (!user) {
        return res.status(404).json({ error: "Afiliado não encontrado ou inativo" });
      }

      // Calculate commission totals
      const commissionStats = await db
        .select({
          totalEarned: sql<string>`COALESCE(SUM(${schema.conversions.commission}), 0)`,
        })
        .from(schema.conversions)
        .where(eq(schema.conversions.userId, userId));

      // Calculate payment totals
      const paymentStats = await db
        .select({
          totalWithdrawn: sql<string>`COALESCE(SUM(CASE WHEN ${schema.payments.status} = 'completed' THEN ${schema.payments.amount} ELSE 0 END), 0)`,
          pendingPayments: sql<string>`COALESCE(SUM(CASE WHEN ${schema.payments.status} = 'pending' THEN ${schema.payments.amount} ELSE 0 END), 0)`
        })
        .from(schema.payments)
        .where(eq(schema.payments.userId, userId));

      const commissionData = commissionStats[0];
      const paymentData = paymentStats[0];
      
      const totalEarned = parseFloat(commissionData?.totalEarned) || 0;
      const totalWithdrawn = parseFloat(paymentData?.totalWithdrawn) || 0;
      const pendingPayments = parseFloat(paymentData?.pendingPayments) || 0;
      const availableBalance = Math.max(0, totalEarned - totalWithdrawn - pendingPayments);

      // Get payment history
      const paymentHistory = await db
        .select({
          totalPayments: sql<number>`COUNT(*)`,
          successfulPayments: sql<number>`SUM(CASE WHEN ${schema.payments.status} = 'approved' THEN 1 ELSE 0 END)`
        })
        .from(schema.payments)
        .where(eq(schema.payments.userId, userId));

      const history = paymentHistory[0];
      const successRate = history.totalPayments > 0 
        ? ((history.successfulPayments / history.totalPayments) * 100).toFixed(1)
        : '0';

      // Get latest payment date
      const [latestPayment] = await db
        .select({ paidAt: schema.payments.paidAt })
        .from(schema.payments)
        .where(and(
          eq(schema.payments.userId, userId),
          eq(schema.payments.status, 'completed')
        ))
        .orderBy(desc(schema.payments.paidAt))
        .limit(1);

      const result = {
        userId,
        availableBalance: availableBalance.toFixed(2),
        totalEarned: totalEarned.toFixed(2),
        totalWithdrawn: totalWithdrawn.toFixed(2),
        pendingPayments: pendingPayments.toFixed(2),
        lastPaymentDate: latestPayment?.paidAt || null,
        commissionBreakdown: {
          revShare: totalEarned.toFixed(2), // Simplified - all as revshare for now
          cpa: '0.00',
          bonus: '0.00'
        },
        paymentHistory: {
          totalPayments: history.totalPayments,
          successRate: successRate + '%',
          averageAmount: history.totalPayments > 0 
            ? (totalWithdrawn / Math.max(1, history.successfulPayments)).toFixed(2)
            : '0.00'
        }
      };

      res.json(result);
    } catch (error) {
      console.error("Erro ao buscar dados de comissão:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  console.log("✅ Rotas registradas com sucesso");
}