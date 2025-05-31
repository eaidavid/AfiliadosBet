import { Request, Response } from "express";
import { storage } from "./storage";
import { db } from "./db";
import * as schema from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export class PostbackHandler {
  
  // Função principal para processar postbacks
  static async processPostback(req: Request, res: Response) {
    const startTime = Date.now();
    console.log(`🔔 POSTBACK RECEBIDO - ${new Date().toISOString()}`);
    console.log(`URL: ${req.url}`);
    console.log(`Query params:`, req.query);
    console.log(`IP: ${req.ip}`);

    try {
      const { event, subid, amount, house, customer_id } = req.query;
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      
      // Validações básicas
      if (!event || !subid || !house) {
        return res.status(400).json({ 
          error: "Parâmetros obrigatórios: event, subid, house" 
        });
      }

      // Processar usando o storage
      const result = await storage.processPostbackEvent({
        subid: subid as string,
        event: event as string,
        amount: parseFloat(amount as string) || 0,
        house: house as string,
        customerId: customer_id as string,
        rawData: req.url,
        ip
      });

      if (result.success) {
        console.log(`✅ Postback processado - Comissão: R$ ${result.commission || 0}`);
        res.json({
          success: true,
          message: "Postback processado com sucesso",
          commission: result.commission,
          logId: result.logId,
          processingTime: Date.now() - startTime
        });
      } else {
        console.log(`❌ Erro no processamento - Log ID: ${result.logId}`);
        res.status(400).json({
          success: false,
          error: "Erro no processamento do postback",
          logId: result.logId
        });
      }

    } catch (error) {
      console.error("Erro no postback:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno do servidor"
      });
    }
  }

  // Função para gerar URLs de postback para as casas
  static async getPostbackUrls(req: Request, res: Response) {
    try {
      const houseId = parseInt(req.params.houseId);
      
      if (!houseId) {
        return res.status(400).json({ error: "ID da casa é obrigatório" });
      }

      const house = await storage.getBettingHouseById(houseId);
      if (!house) {
        return res.status(404).json({ error: "Casa não encontrada" });
      }

      const baseUrl = process.env.BASE_URL || `https://${req.get('host')}`;
      
      const postbackUrls = {
        // URL básica
        basic: `${baseUrl}/api/postback?event={event}&subid={subid}&amount={amount}&house=${house.name}&customer_id={customer_id}`,
        
        // URL com token de segurança
        secure: `${baseUrl}/api/postback/${house.securityToken}?event={event}&subid={subid}&amount={amount}&customer_id={customer_id}`,
        
        // Exemplos práticos
        examples: {
          registration: `${baseUrl}/api/postback?event=registration&subid=usuario123&house=${house.name}&customer_id=12345`,
          deposit: `${baseUrl}/api/postback?event=deposit&subid=usuario123&amount=100&house=${house.name}&customer_id=12345`
        }
      };

      res.json({
        house: house.name,
        postbackUrls,
        instructions: {
          subid: "ID do usuário afiliado (username)",
          event: "Tipo do evento: registration, deposit, first_deposit, revenue, profit",
          amount: "Valor do depósito/receita (obrigatório para eventos com valor)",
          customer_id: "ID do cliente na casa de apostas (opcional)"
        }
      });

    } catch (error) {
      console.error("Erro ao gerar URLs:", error);
      res.status(500).json({ error: "Erro interno" });
    }
  }

  // Função para listar logs de postback com filtros
  static async getPostbackLogs(req: Request, res: Response) {
    try {
      const { casa, status, limit = 50, offset = 0 } = req.query;
      
      let query = db.select().from(schema.postbackLogs);
      
      if (casa) {
        query = query.where(eq(schema.postbackLogs.casa, casa as string));
      }
      
      if (status) {
        query = query.where(eq(schema.postbackLogs.status, status as string));
      }

      const logs = await query
        .orderBy(sql`${schema.postbackLogs.criadoEm} DESC`)
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));

      res.json({
        logs,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total: logs.length
        }
      });

    } catch (error) {
      console.error("Erro ao buscar logs:", error);
      res.status(500).json({ error: "Erro interno" });
    }
  }

  // Função para estatísticas de postbacks
  static async getPostbackStats(req: Request, res: Response) {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : null;
      
      // Estatísticas gerais de logs
      const logStats = await db.select({
        status: schema.postbackLogs.status,
        count: sql<number>`count(*)`
      })
      .from(schema.postbackLogs)
      .groupBy(schema.postbackLogs.status);

      // Estatísticas de eventos por usuário (se especificado)
      let userEventStats = {};
      if (userId) {
        userEventStats = await storage.getEventStats(userId);
      }

      // Estatísticas de comissões
      const commissionStats = await db.select({
        tipo: schema.comissoes.tipo,
        total: sql<number>`sum(CAST(${schema.comissoes.valor} AS DECIMAL))`,
        count: sql<number>`count(*)`
      })
      .from(schema.comissoes)
      .groupBy(schema.comissoes.tipo);

      res.json({
        logStats: logStats.reduce((acc, stat) => {
          acc[stat.status] = stat.count;
          return acc;
        }, {} as any),
        userEventStats,
        commissionStats: commissionStats.reduce((acc, stat) => {
          acc[stat.tipo] = {
            total: stat.total || 0,
            count: stat.count || 0
          };
          return acc;
        }, {} as any)
      });

    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      res.status(500).json({ error: "Erro interno" });
    }
  }
}