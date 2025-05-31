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

    // Calcular comissão
    let commissionAmount = 0;
    const eventAmount = parseFloat(amount as string) || 0;

    console.log(`💰 Calculando comissão: Casa ${house.name} (${house.commissionType}), Evento: ${evento}, Valor: R$ ${eventAmount}`);

    // Aplicar lógica de comissão baseada no tipo da casa
    if (house.commissionType === 'RevShare') {
      const percentage = parseFloat(house.commissionValue || '30');
      
      if (['deposit', 'revenue', 'profit'].includes(evento) && eventAmount > 0) {
        commissionAmount = (eventAmount * percentage) / 100;
        console.log(`💰 RevShare sobre ${evento}: ${percentage}% de R$ ${eventAmount} = R$ ${commissionAmount}`);
      } else if (evento === 'registration') {
        commissionAmount = 50.00; // R$ 50 por registro
        console.log(`💰 Comissão fixa por registro: R$ ${commissionAmount}`);
      } else if (evento === 'click') {
        commissionAmount = 5.00; // R$ 5 por click
        console.log(`💰 Comissão por click: R$ ${commissionAmount}`);
      }
    } else if (house.commissionType === 'CPA') {
      if (evento === 'deposit' && eventAmount >= parseFloat(house.minDeposit || '0')) {
        commissionAmount = parseFloat(house.commissionValue || '0');
        console.log(`💰 CPA válido: Depósito R$ ${eventAmount} >= Mínimo R$ ${house.minDeposit}, Comissão: R$ ${commissionAmount}`);
      }
    }

    console.log(`💰 Comissão final: R$ ${commissionAmount.toFixed(2)} (Tipo: ${house.commissionType})`);

    // Registrar conversão
    await db.execute(sql`
      INSERT INTO conversions (user_id, house_id, type, amount, commission, customer_id, conversion_data)
      VALUES (2, ${house.id}, ${evento}, ${eventAmount || 0}, ${commissionAmount}, ${subid}, ${JSON.stringify({ 
        customer_id: subid, 
        event: evento, 
        house_name: house.name,
        processed_at: new Date().toISOString() 
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