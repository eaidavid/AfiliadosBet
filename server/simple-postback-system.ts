import { Request, Response } from "express";
import { db } from "./db";
import * as schema from "@shared/schema";
import { eq, sql } from "drizzle-orm";

// Sistema de Postbacks Personalizado
export class PostbackSystem {
  
  // Processar postback recebido das casas
  static async handlePostback(req: Request, res: Response) {
    console.log(`📩 Postback recebido: ${new Date().toISOString()}`);
    console.log(`URL: ${req.url}`);
    console.log(`Parâmetros:`, req.query);
    
    try {
      const { event, subid, amount = "0", house, customer_id } = req.query;
      const ip = req.ip || "unknown";
      
      // Validações obrigatórias
      if (!event || !subid || !house) {
        return res.status(400).json({
          success: false,
          error: "Parâmetros obrigatórios: event, subid, house"
        });
      }

      // 1. Registrar log do postback
      const [logEntry] = await db.insert(schema.postbackLogs).values({
        casa: house as string,
        evento: event as string,
        subid: subid as string,
        valor: amount as string,
        ip,
        raw: req.url,
        status: 'PROCESSING'
      }).returning();

      // 2. Buscar afiliado pelo subid (username)
      const [affiliate] = await db.select()
        .from(schema.users)
        .where(eq(schema.users.username, subid as string))
        .limit(1);

      if (!affiliate) {
        await db.update(schema.postbackLogs)
          .set({ status: 'ERROR_AFFILIATE_NOT_FOUND' })
          .where(eq(schema.postbackLogs.id, logEntry.id));
        
        return res.status(404).json({
          success: false,
          error: "Afiliado não encontrado",
          logId: logEntry.id
        });
      }

      // 3. Buscar casa de apostas
      const [houseRecord] = await db.select()
        .from(schema.bettingHouses)
        .where(sql`LOWER(${schema.bettingHouses.name}) = ${(house as string).toLowerCase()}`)
        .limit(1);

      if (!houseRecord) {
        await db.update(schema.postbackLogs)
          .set({ status: 'ERROR_HOUSE_NOT_FOUND' })
          .where(eq(schema.postbackLogs.id, logEntry.id));
        
        return res.status(404).json({
          success: false,
          error: "Casa de apostas não encontrada",
          logId: logEntry.id
        });
      }

      // 4. Registrar evento
      const [eventRecord] = await db.insert(schema.eventos).values({
        afiliadoId: affiliate.id,
        casa: house as string,
        evento: event as string,
        valor: amount as string
      }).returning();

      // 5. Calcular comissão conforme sua regra (Casa paga 40%, você repassa 30%)
      let commissionValue = 0;
      let commissionType = '';
      const depositAmount = parseFloat(amount as string) || 0;

      switch (event as string) {
        case 'registration':
          // CPA fixo para registro
          commissionValue = 50; // R$ 50 por registro
          commissionType = 'CPA';
          break;

        case 'deposit':
        case 'first_deposit':
          // RevShare sobre depósito: 30% de 40% = 12% do valor
          if (depositAmount > 0) {
            commissionValue = depositAmount * 0.12; // 12% do depósito
            commissionType = 'RevShare';
          }
          break;

        case 'revenue':
        case 'profit':
          // RevShare sobre receita: 30% de 40% = 12% do valor
          if (depositAmount > 0) {
            commissionValue = depositAmount * 0.12;
            commissionType = 'RevShare';
          }
          break;

        default:
          // Outros eventos não geram comissão
          commissionType = 'Event';
          break;
      }

      // 6. Salvar comissão se aplicável
      if (commissionValue > 0) {
        await db.insert(schema.comissoes).values({
          afiliadoId: affiliate.id,
          eventoId: eventRecord.id,
          tipo: commissionType,
          valor: commissionValue.toString(),
          affiliate: affiliate.username
        });

        // 7. Criar registro de conversão
        await db.insert(schema.conversions).values({
          userId: affiliate.id,
          houseId: houseRecord.id,
          type: event as string,
          amount: depositAmount.toString(),
          commission: commissionValue.toString(),
          customerId: customer_id as string || null,
          affiliateLinkId: null,
          conversionData: { rawPostback: req.url }
        });

        console.log(`💰 Comissão ${commissionType}: R$ ${commissionValue.toFixed(2)} para ${affiliate.username}`);
      }

      // 8. Atualizar log como processado com sucesso
      await db.update(schema.postbackLogs)
        .set({ status: 'SUCCESS' })
        .where(eq(schema.postbackLogs.id, logEntry.id));

      // 9. Resposta de sucesso
      res.json({
        success: true,
        message: "Postback processado com sucesso",
        data: {
          affiliate: affiliate.username,
          event: event,
          house: house,
          commission: commissionValue,
          type: commissionType,
          logId: logEntry.id
        }
      });

    } catch (error) {
      console.error("Erro no processamento do postback:", error);
      res.status(500).json({
        success: false,
        error: "Erro interno no processamento"
      });
    }
  }

  // Gerar URLs de postback para as casas
  static async generatePostbackUrls(req: Request, res: Response) {
    try {
      const houseId = parseInt(req.params.houseId);
      
      const [house] = await db.select()
        .from(schema.bettingHouses)
        .where(eq(schema.bettingHouses.id, houseId))
        .limit(1);

      if (!house) {
        return res.status(404).json({ error: "Casa não encontrada" });
      }

      const baseUrl = process.env.BASE_URL || `https://${req.get('host')}`;
      
      const urls = {
        basic: `${baseUrl}/api/postback?event={event}&subid={subid}&amount={amount}&house=${house.name}&customer_id={customer_id}`,
        examples: {
          registration: `${baseUrl}/api/postback?event=registration&subid=usuario123&house=${house.name}&customer_id=12345`,
          deposit: `${baseUrl}/api/postback?event=deposit&subid=usuario123&amount=100&house=${house.name}&customer_id=12345`,
          revenue: `${baseUrl}/api/postback?event=revenue&subid=usuario123&amount=50&house=${house.name}&customer_id=12345`
        },
        instructions: {
          subid: "Username do afiliado no sistema",
          event: "Tipos: registration, deposit, first_deposit, revenue, profit",
          amount: "Valor em reais (obrigatório para eventos com valor)",
          house: `Nome da casa: ${house.name}`,
          customer_id: "ID do cliente na casa (opcional)"
        }
      };

      res.json({
        house: house.name,
        postbackUrls: urls,
        commissionRules: {
          registration: "R$ 50,00 fixo por registro",
          deposit: "12% do valor do depósito",
          revenue: "12% do valor da receita"
        }
      });

    } catch (error) {
      console.error("Erro ao gerar URLs:", error);
      res.status(500).json({ error: "Erro interno" });
    }
  }

  // Visualizar logs de postback
  static async viewLogs(req: Request, res: Response) {
    try {
      const { casa, status, limit = 50 } = req.query;
      
      let query = db.select().from(schema.postbackLogs);
      
      if (casa) {
        query = query.where(eq(schema.postbackLogs.casa, casa as string));
      }
      
      if (status) {
        query = query.where(eq(schema.postbackLogs.status, status as string));
      }

      const logs = await query
        .orderBy(sql`${schema.postbackLogs.criadoEm} DESC`)
        .limit(parseInt(limit as string));

      res.json({
        logs,
        summary: {
          total: logs.length,
          filters: { casa, status }
        }
      });

    } catch (error) {
      console.error("Erro ao buscar logs:", error);
      res.status(500).json({ error: "Erro interno" });
    }
  }

  // Estatísticas de postbacks para um afiliado
  static async getAffiliateStats(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      
      // Buscar eventos do afiliado
      const events = await db.select({
        evento: schema.eventos.evento,
        count: sql<number>`count(*)`,
        totalValor: sql<number>`sum(CAST(${schema.eventos.valor} AS DECIMAL))`
      })
      .from(schema.eventos)
      .where(eq(schema.eventos.afiliadoId, userId))
      .groupBy(schema.eventos.evento);

      // Buscar comissões do afiliado
      const commissions = await db.select({
        tipo: schema.comissoes.tipo,
        count: sql<number>`count(*)`,
        total: sql<number>`sum(CAST(${schema.comissoes.valor} AS DECIMAL))`
      })
      .from(schema.comissoes)
      .where(eq(schema.comissoes.afiliadoId, userId))
      .groupBy(schema.comissoes.tipo);

      res.json({
        userId,
        events: events.reduce((acc, event) => {
          acc[event.evento] = {
            count: event.count,
            totalValue: event.totalValor || 0
          };
          return acc;
        }, {} as any),
        commissions: commissions.reduce((acc, comm) => {
          acc[comm.tipo] = {
            count: comm.count,
            total: comm.total || 0
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