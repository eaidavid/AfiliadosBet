import express from "express";
import { db } from "./db";
import { eq, sql, and, desc } from "drizzle-orm";
import * as schema from "../shared/schema";
import { handlePostback } from "./postback-simple";

export async function registerRoutes(app: express.Application) {
  
  // === ROTA PRINCIPAL DE POSTBACK CORRIGIDA ===
  app.get("/api/postback/:casa/:evento", handlePostback);

  // === ESTATÍSTICAS DO USUÁRIO ===
  app.get("/api/stats/user", async (req: any, res: any) => {
    try {
      const userId = 2; // ID do usuário eaidavid
      
      // Buscar links do usuário
      const userLinks = await db.select()
        .from(schema.affiliateLinks)
        .where(eq(schema.affiliateLinks.userId, userId));

      console.log(`Buscando links para userId: ${userId} ${typeof userId}`);
      console.log(`Resultado da busca: ${userLinks.length}`, userLinks);

      // Buscar conversões do usuário
      const userConversions = await db.select()
        .from(schema.conversions)
        .where(eq(schema.conversions.userId, userId));

      console.log(`User ${userId} conversions found: ${userConversions.length}`);

      // Calcular estatísticas
      const totalClicks = userLinks.length;
      const totalRegistrations = userConversions.filter(c => c.type === 'registration').length;
      const totalDeposits = userConversions.filter(c => c.type === 'deposit').length;
      
      // Calcular comissão total
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

      console.log(`Final stats for user ${userId}:`, stats);
      res.json(stats);

    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // === ESTATÍSTICAS DO ADMIN ===
  app.get("/api/stats/admin", async (req: any, res: any) => {
    try {
      // Buscar todos os dados
      const allUsers = await db.select().from(schema.users);
      const allHouses = await db.select().from(schema.bettingHouses);
      const allLinks = await db.select().from(schema.affiliateLinks);
      const allConversions = await db.select().from(schema.conversions);

      // Calcular totais
      const totalUsers = allUsers.length;
      const totalHouses = allHouses.length;
      const totalLinks = allLinks.length;
      const totalConversions = allConversions.length;

      // Calcular volume total
      const totalVolume = allConversions.reduce((sum, conversion) => {
        return sum + parseFloat(conversion.amount || '0');
      }, 0);

      // Calcular comissões totais
      const totalCommissions = allConversions.reduce((sum, conversion) => {
        return sum + parseFloat(conversion.commission || '0');
      }, 0);

      const stats = {
        totalUsers,
        totalHouses,
        totalLinks,
        totalConversions,
        totalVolume: totalVolume.toFixed(2),
        totalCommissions: totalCommissions.toFixed(2)
      };

      res.json(stats);

    } catch (error) {
      console.error("Erro ao buscar estatísticas do admin:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // === OUTRAS ROTAS ESSENCIAIS ===

  // Buscar casas disponíveis
  app.get("/api/betting-houses", async (req: any, res: any) => {
    try {
      const userId = 2; // eaidavid
      
      // Buscar links existentes do usuário
      const existingLinks = await db.select()
        .from(schema.affiliateLinks)
        .where(eq(schema.affiliateLinks.userId, userId));

      const linkedHouseIds = existingLinks.map(link => link.houseId);

      // Buscar casas não vinculadas
      let availableHouses;
      if (linkedHouseIds.length > 0) {
        availableHouses = await db.select()
          .from(schema.bettingHouses)
          .where(sql`${schema.bettingHouses.id} NOT IN (${sql.join(linkedHouseIds, sql`,`)})`);
      } else {
        availableHouses = await db.select().from(schema.bettingHouses);
      }

      console.log(`Casas disponíveis para afiliamento (usuário ${userId}): ${availableHouses.length}`);
      res.json(availableHouses);

    } catch (error) {
      console.error("Erro ao buscar casas:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Buscar links do usuário
  app.get("/api/my-links", async (req: any, res: any) => {
    try {
      const userId = 2; // eaidavid
      
      console.log(`Buscando links para usuário: ${userId} tipo: ${typeof userId}`);
      
      const links = await db.select()
        .from(schema.affiliateLinks)
        .where(eq(schema.affiliateLinks.userId, userId))
        .orderBy(desc(schema.affiliateLinks.createdAt));

      console.log(`Buscando links para userId: ${userId} ${typeof userId}`);
      console.log(`Resultado da busca: ${links.length}`, links);
      console.log(`Links encontrados: ${links.length}`);

      res.json(links);

    } catch (error) {
      console.error("Erro ao buscar links:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Relatórios do usuário
  app.get("/api/user/reports", async (req: any, res: any) => {
    try {
      const userId = 2; // eaidavid
      
      const conversions = await db.select()
        .from(schema.conversions)
        .where(eq(schema.conversions.userId, userId))
        .orderBy(desc(schema.conversions.createdAt));

      res.json(conversions);

    } catch (error) {
      console.error("Erro ao buscar relatórios:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Relatórios do admin
  app.get("/api/admin/reports", async (req: any, res: any) => {
    try {
      const allConversions = await db.select()
        .from(schema.conversions)
        .orderBy(desc(schema.conversions.createdAt));

      res.json(allConversions);

    } catch (error) {
      console.error("Erro ao buscar relatórios do admin:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  console.log("✅ Rotas registradas com sucesso");
}