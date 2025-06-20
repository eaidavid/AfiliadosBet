import express from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';

export function setupPostbackRoutes(app: express.Application) {
  
  // Interceptar TODAS as requisições de postback para Brazino ANTES das rotas principais
  app.use('/api/postback/brazzino', (req, res, next) => {
    console.log('🚀 INTERCEPTANDO POSTBACK BRAZINO - Sistema simplificado ativo');
    next();
  });
  
  // Rota de postback simplificada para Brazino
  app.get('/api/postback/brazzino/:evento', async (req, res) => {
    const { evento } = req.params;
    const { subid, customer_id, amount } = req.query;
    
    console.log(`🔔 POSTBACK BRAZINO: ${evento}`);
    console.log(`📋 Dados: subid=${subid}, customer_id=${customer_id}, amount=${amount}`);
    
    try {
      // Log do postback
      await db.execute(sql`
        INSERT INTO postback_logs (casa, evento, subid, valor, ip, raw, status)
        VALUES ('brazzino', ${evento}, ${subid}, ${amount || 0}, ${req.ip}, ${req.originalUrl}, 'SUCCESS')
      `);
      
      // Buscar afiliado
      const affiliateResult = await db.execute(sql`
        SELECT id FROM users WHERE username = ${subid}
      `);
      
      if (affiliateResult.rows.length === 0) {
        console.log(`❌ Afiliado não encontrado: ${subid}`);
        return res.status(404).json({ error: 'Afiliado não encontrado' });
      }
      
      const affiliateId = affiliateResult.rows[0].id;
      
      // Registrar conversão baseada no evento usando a coluna correta 'type'
      if (evento === 'register') {
        await db.execute(sql`
          INSERT INTO conversions (user_id, house_id, affiliate_link_id, type, amount, commission, customer_id, conversion_data)
          VALUES (${affiliateId}, 3, 1, 'registration', ${amount || 0}, 25.00, ${customer_id}, ${JSON.stringify({ event: evento, processed_at: new Date().toISOString() })})
        `);
        
        console.log(`✅ Registro processado para afiliado ${subid}`);
        return res.json({ 
          status: 'success', 
          message: 'Registro processado com sucesso',
          commission: 10
        });
      }
      
      if (evento === 'deposit') {
        const depositAmount = parseFloat(amount as string) || 0;
        const commission = Math.round(depositAmount * 0.30); // 30% RevShare
        
        await db.execute(sql`
          INSERT INTO conversions (user_id, house_id, affiliate_link_id, type, amount, commission, customer_id, conversion_data)
          VALUES (${affiliateId}, 3, 1, 'deposit', ${depositAmount}, ${commission}, ${customer_id}, ${JSON.stringify({ event: evento, processed_at: new Date().toISOString() })})
        `);
        
        console.log(`✅ Depósito processado: R$ ${depositAmount}, comissão: R$ ${commission}`);
        return res.json({ 
          status: 'success', 
          message: 'Depósito processado com sucesso',
          commission: commission
        });
      }
      
      if (evento === 'profit') {
        const profitAmount = parseFloat(amount as string) || 0;
        const commission = Math.round(profitAmount * 0.30); // 30% RevShare
        
        await db.execute(sql`
          INSERT INTO conversions (user_id, house_id, affiliate_link_id, type, amount, commission, customer_id, conversion_data)
          VALUES (${affiliateId}, 3, 1, 'profit', ${profitAmount}, ${commission}, ${customer_id}, ${JSON.stringify({ event: evento, processed_at: new Date().toISOString() })})
        `);
        
        console.log(`✅ Lucro processado: R$ ${profitAmount}, comissão: R$ ${commission}`);
        return res.json({ 
          status: 'success', 
          message: 'Lucro processado com sucesso',
          commission: commission
        });
      }
      
      if (evento === 'payout') {
        await db.execute(sql`
          INSERT INTO conversions (user_id, house_id, affiliate_link_id, type, amount, commission, customer_id, conversion_data)
          VALUES (${affiliateId}, 3, 1, 'payout', 0, 0, ${customer_id}, ${JSON.stringify({ event: evento, processed_at: new Date().toISOString() })})
        `);
        
        console.log(`✅ Payout processado para cliente ${customer_id}`);
        return res.json({ 
          status: 'success', 
          message: 'Payout processado com sucesso'
        });
      }
      
      return res.status(400).json({ error: 'Evento não suportado' });
      
    } catch (error) {
      console.error('❌ Erro no postback:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });
}