import { Request, Response } from 'express';
import { db } from './db';
import { sql, eq, and } from 'drizzle-orm';
import * as schema from '../shared/schema';

// Rota principal de postback com cálculo correto de comissões
export async function handlePostback(req: Request, res: Response) {
  try {
    const { casa, evento } = req.params;
    const { subid, amount, customer_id } = req.query;
    const ip = req.ip || 'unknown';
    const rawUrl = req.url;

    console.log(`🔔 === POSTBACK RECEBIDO === ${new Date().toISOString()}`);
    console.log(`URL completa: ${rawUrl}`);
    console.log(`Parâmetros: casa=${casa}, evento=${evento}`);
    console.log(`Query: ${JSON.stringify(req.query)}`);
    console.log(`IP: ${ip}`);

    // Registrar log inicial
    const logEntry = await db.insert(schema.postbackLogs).values({
      status: 'PROCESSING',
      casa: casa,
      evento: evento,
      subid: subid as string || '',
      valor: parseFloat(amount as string) || 0,
      ip: ip,
      raw: rawUrl
    }).returning({ id: schema.postbackLogs.id });

    console.log(`✅ Log criado com ID: ${logEntry[0].id}`);

    // Buscar casa pelo identificador
    console.log(`🔍 Buscando casa pelo identificador: "${casa}"`);
    const houses = await db.select()
      .from(schema.bettingHouses)
      .where(eq(schema.bettingHouses.identifier, casa))
      .limit(1);

    console.log(`🔍 Resultado da busca: ${houses.length} casa(s) encontrada(s)`);

    if (houses.length === 0) {
      await db.update(schema.postbackLogs)
        .set({ status: 'ERROR_HOUSE_NOT_FOUND' })
        .where(eq(schema.postbackLogs.id, logEntry[0].id));
      
      return res.status(404).json({
        status: 'error',
        message: `Casa '${casa}' não encontrada`,
        logId: logEntry[0].id
      });
    }

    const house = houses[0];
    console.log(`✅ Casa encontrada: ${house.name} (ID: ${house.id})`);

    // Importar calculadora de comissões
    const { CommissionCalculator } = await import('./services/commissionCalculator');

    // Calcular comissão usando valor do postback
    const eventAmount = parseFloat(amount as string) || 0;
    console.log(`💰 Calculando comissão: Casa ${house.name} (${house.commissionType}), Evento: ${evento}, Valor: R$ ${eventAmount}`);

    let affiliateCommission = 0;
    let masterCommission = 0;
    let calculationDetails = {};

    // Aplicar lógica de comissão baseada no tipo da casa e usar calculadora
    if (house.commissionType === 'RevShare' && ['deposit', 'revenue', 'profit'].includes(evento) && eventAmount > 0) {
      try {
        const calculation = await CommissionCalculator.calculateCommission(house.id, eventAmount, 'RevShare');
        affiliateCommission = calculation.affiliateCommission;
        masterCommission = calculation.masterCommission;
        calculationDetails = calculation.calculationDetails;
        
        console.log(`💰 RevShare calculado: Afiliado R$ ${affiliateCommission.toFixed(2)}, Master R$ ${masterCommission.toFixed(2)}`);
      } catch (error) {
        console.error(`❌ Erro no cálculo RevShare: ${error.message}`);
        // Fallback para lógica anterior se configuração estiver incompleta
        const percentage = parseFloat(house.commissionValue || '30');
        affiliateCommission = (eventAmount * percentage) / 100;
        masterCommission = 0;
      }
    } else if (house.commissionType === 'CPA' && evento === 'deposit' && eventAmount >= parseFloat(house.minDeposit || '0')) {
      try {
        const cpaValue = parseFloat(house.cpaValue || house.commissionValue || '0');
        const calculation = await CommissionCalculator.calculateCommission(house.id, cpaValue, 'CPA');
        affiliateCommission = calculation.affiliateCommission;
        masterCommission = calculation.masterCommission;
        calculationDetails = calculation.calculationDetails;
        
        console.log(`💰 CPA calculado: Afiliado R$ ${affiliateCommission.toFixed(2)}, Master R$ ${masterCommission.toFixed(2)}`);
      } catch (error) {
        console.error(`❌ Erro no cálculo CPA: ${error.message}`);
        // Fallback para lógica anterior se configuração estiver incompleta
        affiliateCommission = parseFloat(house.commissionValue || '0');
        masterCommission = 0;
      }
    } else if (evento === 'registration') {
      affiliateCommission = 50.00; // R$ 50 por registro
      masterCommission = 0;
      console.log(`💰 Comissão fixa por registro: R$ ${affiliateCommission}`);
    } else if (evento === 'click') {
      affiliateCommission = 5.00; // R$ 5 por click
      masterCommission = 0;
      console.log(`💰 Comissão por click: R$ ${affiliateCommission}`);
    }

    console.log(`💰 Comissão final - Afiliado: R$ ${affiliateCommission.toFixed(2)}, Master: R$ ${masterCommission.toFixed(2)}`);

    // Registrar conversão com divisão de comissões
    await db.execute(sql`
      INSERT INTO conversions (user_id, house_id, type, amount, commission, master_commission, customer_id, conversion_data)
      VALUES (2, ${house.id}, ${evento}, ${eventAmount || 0}, ${affiliateCommission}, ${masterCommission}, ${subid}, ${JSON.stringify({ 
        customer_id: subid, 
        event: evento, 
        house_name: house.name,
        processed_at: new Date().toISOString(),
        commission_calculation: calculationDetails
      })})
    `);

    // Atualizar status do log
    await db.update(schema.postbackLogs)
      .set({ status: 'SUCCESS_CONVERSION_REGISTERED' })
      .where(eq(schema.postbackLogs.id, logEntry[0].id));

    console.log(`✅ Conversão registrada com sucesso para ${house.name} - evento: ${evento}`);

    return res.json({
      status: 'success',
      message: `Postback processado com sucesso - ${house.name}`,
      event: evento,
      commission: commissionAmount,
      house: house.name,
      logId: logEntry[0].id
    });

  } catch (error) {
    console.error('❌ Erro no processamento do postback:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
}