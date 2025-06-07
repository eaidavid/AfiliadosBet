import { Router } from 'express';
import { DatabaseStorage } from '../storage';
import { bettingHouses, users, conversions } from '../../shared/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { SmarticoSyncScheduler } from '../cron/smarticoSync';

export function createConversionsRoutes(storage: DatabaseStorage, syncScheduler: SmarticoSyncScheduler): Router {
  const router = Router();

  // GET /api/conversions - Buscar conversões com filtros
  router.get('/', async (req, res) => {
    try {
      const { date_from, date_to, user_id, house_id, page = '1', limit = '50' } = req.query;
      
      let query = storage.db
        .select({
          id: conversions.id,
          type: conversions.type,
          amount: conversions.amount,
          commission: conversions.commission,
          convertedAt: conversions.convertedAt,
          affiliateName: users.fullName,
          affiliateUsername: users.username,
          houseName: bettingHouses.name,
          houseId: conversions.houseId,
          userId: conversions.userId
        })
        .from(conversions)
        .leftJoin(users, eq(conversions.userId, users.id))
        .leftJoin(bettingHouses, eq(conversions.houseId, bettingHouses.id))
        .orderBy(desc(conversions.convertedAt));

      // Aplicar filtros
      const conditions = [];
      
      if (date_from) {
        conditions.push(gte(conversions.convertedAt, new Date(date_from as string)));
      }
      
      if (date_to) {
        conditions.push(lte(conversions.convertedAt, new Date(date_to as string)));
      }
      
      if (user_id) {
        conditions.push(eq(conversions.userId, parseInt(user_id as string)));
      }
      
      if (house_id) {
        conditions.push(eq(conversions.houseId, parseInt(house_id as string)));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      // Paginação
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      const results = await query.limit(limitNum).offset(offset);

      // Calcular totais
      const totals = await storage.db
        .select({
          totalClick: storage.db.raw(`SUM(CASE WHEN type = 'click' THEN 1 ELSE 0 END)`),
          totalRegistration: storage.db.raw(`SUM(CASE WHEN type = 'registration' THEN 1 ELSE 0 END)`),
          totalDeposit: storage.db.raw(`SUM(CASE WHEN type = 'deposit' THEN 1 ELSE 0 END)`),
          totalProfit: storage.db.raw(`SUM(CASE WHEN type = 'profit' THEN 1 ELSE 0 END)`),
          totalCommissions: storage.db.raw(`SUM(CAST(commission AS DECIMAL))`),
          totalAmount: storage.db.raw(`SUM(CAST(amount AS DECIMAL))`)
        })
        .from(conversions)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      res.json({
        success: true,
        data: results,
        pagination: {
          page: pageNum,
          limit: limitNum,
          hasMore: results.length === limitNum
        },
        totals: totals[0] || {
          totalClick: 0,
          totalRegistration: 0,
          totalDeposit: 0,
          totalProfit: 0,
          totalCommissions: 0,
          totalAmount: 0
        }
      });

    } catch (error) {
      console.error('Erro ao buscar conversões:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // GET /api/conversions/affiliates - Listar afiliados para filtro
  router.get('/affiliates', async (req, res) => {
    try {
      const affiliates = await storage.db
        .select({
          id: users.id,
          name: users.fullName,
          username: users.username
        })
        .from(users)
        .where(eq(users.role, 'affiliate'))
        .orderBy(users.fullName);

      res.json({
        success: true,
        data: affiliates
      });
    } catch (error) {
      console.error('Erro ao buscar afiliados:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // GET /api/conversions/houses - Listar casas para filtro
  router.get('/houses', async (req, res) => {
    try {
      const houses = await storage.db
        .select({
          id: bettingHouses.id,
          name: bettingHouses.name
        })
        .from(bettingHouses)
        .where(eq(bettingHouses.isActive, true))
        .orderBy(bettingHouses.name);

      res.json({
        success: true,
        data: houses
      });
    } catch (error) {
      console.error('Erro ao buscar casas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // POST /api/conversions/sync - Executar sincronização manual
  router.post('/sync', async (req, res) => {
    try {
      await syncScheduler.runManualSync();
      res.json({
        success: true,
        message: 'Sincronização executada com sucesso'
      });
    } catch (error) {
      console.error('Erro na sincronização manual:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  });

  return router;
}