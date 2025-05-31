import express from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';

export function setupBrazinoPostback(app: express.Application) {
  
  // Sistema de postback dedicado para Brazino
  app.get('/api/postback/brazino/:evento', async (req, res) => {
    const { evento } = req.params;
    const { subid, customer_id, amount } = req.query;
    
    console.log(`🎯 BRAZINO POSTBACK: ${evento}`);
    console.log(`📊 Dados: subid=${subid}, customer_id=${customer_id}, amount=${amount}`);
    
    try {
      // Verificar se o afiliado existe
      const affiliateResult = await db.execute(sql`
        SELECT id FROM users WHERE username = ${subid}
      `);
      
      if (affiliateResult.rows.length === 0) {
        console.log(`❌ Afiliado não encontrado: ${subid}`);
        return res.status(404).json({ error: 'Afiliado não encontrado' });
      }
      
      const affiliateId = affiliateResult.rows[0].id;
      
      // Processar evento de registro
      if (evento === 'register') {
        await db.execute(sql`
          INSERT INTO conversions (user_id, house_id, affiliate_link_id, type, amount, commission, customer_id, conversion_data, converted_at)
          VALUES (${affiliateId}, 3, 1, 'registration', ${amount || 0}, 25.00, ${customer_id}, '{"event":"register","source":"brazino"}', NOW())
        `);
        
        console.log(`✅ Registro processado - Afiliado: ${subid}, Cliente: ${customer_id}`);
        return res.json({ 
          status: 'success', 
          message: 'Registro processado',
          commission: 25
        });
      }
      
      // Processar depósito
      if (evento === 'deposit') {
        const depositAmount = parseFloat(amount as string) || 0;
        const commission = Math.round(depositAmount * 0.30);
        
        await db.execute(sql`
          INSERT INTO conversions (user_id, house_id, affiliate_link_id, type, amount, commission, customer_id, conversion_data, converted_at)
          VALUES (${affiliateId}, 3, 1, 'deposit', ${depositAmount}, ${commission}, ${customer_id}, '{"event":"deposit","source":"brazino"}', NOW())
        `);
        
        console.log(`✅ Depósito processado - Valor: R$ ${depositAmount}, Comissão: R$ ${commission}`);
        return res.json({ 
          status: 'success', 
          message: 'Depósito processado',
          commission: commission
        });
      }
      
      return res.status(400).json({ error: 'Evento não suportado' });
      
    } catch (error) {
      console.error('❌ Erro no postback Brazino:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });
}