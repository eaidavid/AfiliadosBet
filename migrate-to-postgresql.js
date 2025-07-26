#!/usr/bin/env node

import { db } from './server/db.js';
import { users, bettingHouses, affiliateLinks, conversions, payments, clickTracking } from './shared/schema.js';
import bcrypt from 'bcrypt';

console.log('🚀 Iniciando migração para PostgreSQL...');

async function createDefaultUsers() {
  try {
    console.log('👤 Criando usuários padrão...');
    
    // Admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await db.insert(users).values({
      username: 'admin',
      email: 'admin@afiliadosbet.com.br',
      password: adminPassword,
      fullName: 'Administrador',
      cpf: '00000000000',
      birthDate: '1990-01-01',
      role: 'admin',
      isActive: true,
      country: 'BR'
    }).onConflictDoNothing();

    // Test affiliate user
    const affiliatePassword = await bcrypt.hash('admin123', 10);
    await db.insert(users).values({
      username: 'afiliado',
      email: 'afiliado@afiliadosbet.com.br',
      password: affiliatePassword,
      fullName: 'Afiliado Teste',
      cpf: '11111111111',
      birthDate: '1990-01-01',
      role: 'affiliate',
      isActive: true,
      country: 'BR'
    }).onConflictDoNothing();

    console.log('✅ Usuários padrão criados com sucesso');
  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error);
  }
}

async function createDefaultBettingHouses() {
  try {
    console.log('🏠 Criando casas de apostas padrão...');
    
    await db.insert(bettingHouses).values({
      name: 'Brazino777',
      description: 'Casa de apostas líder no Brasil',
      baseUrl: 'https://brazino777.com/pt/?btag=VALUE',
      primaryParam: 'btag',
      commissionType: 'CPA',
      commissionValue: '150',
      cpaValue: '150',
      revshareAffiliatePercent: 30,
      cpaAffiliatePercent: 100,
      minDeposit: '20',
      paymentMethods: 'PIX, Cartão de Crédito, Boleto',
      isActive: true,
      identifier: 'brazino777',
      securityToken: 'token_brazino_' + Date.now(),
      enabledPostbacks: JSON.stringify(['registration', 'deposit', 'first_deposit']),
      parameterMapping: JSON.stringify({
        subid: 'subid',
        amount: 'amount',
        customer_id: 'customer_id'
      })
    }).onConflictDoNothing();

    await db.insert(bettingHouses).values({
      name: 'Blaze',
      description: 'Plataforma de jogos online',
      baseUrl: 'https://blaze.com/r/VALUE',
      primaryParam: 'r',
      commissionType: 'RevShare',
      commissionValue: '40',
      revshareValue: '40',
      revshareAffiliatePercent: 40,
      cpaAffiliatePercent: 100,
      minDeposit: '10',
      paymentMethods: 'PIX, Cartão de Crédito',
      isActive: true,
      identifier: 'blaze',
      securityToken: 'token_blaze_' + Date.now(),
      enabledPostbacks: JSON.stringify(['registration', 'deposit', 'first_deposit']),
      parameterMapping: JSON.stringify({
        subid: 'subid',
        amount: 'amount',
        customer_id: 'customer_id'
      })
    }).onConflictDoNothing();

    console.log('✅ Casas de apostas padrão criadas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao criar casas de apostas:', error);
  }
}

async function createSampleData() {
  try {
    console.log('📊 Criando dados de exemplo...');
    
    // Buscar usuário afiliado e casas
    const affiliate = await db.select().from(users).where(eq(users.email, 'afiliado@afiliadosbet.com.br')).limit(1);
    const houses = await db.select().from(bettingHouses).limit(2);
    
    if (affiliate.length > 0 && houses.length > 0) {
      const affiliateId = affiliate[0].id;
      
      // Criar links de afiliado
      for (const house of houses) {
        const linkUrl = house.baseUrl.replace('VALUE', `${affiliateId}_${house.identifier}`);
        
        await db.insert(affiliateLinks).values({
          userId: affiliateId,
          houseId: house.id,
          generatedUrl: linkUrl,
          isActive: true
        }).onConflictDoNothing();
      }
      
      // Criar algumas conversões de exemplo
      await db.insert(conversions).values({
        userId: affiliateId,
        houseId: houses[0].id,
        type: 'registration',
        amount: '0',
        commission: '150',
        status: 'approved'
      }).onConflictDoNothing();
      
      await db.insert(conversions).values({
        userId: affiliateId,
        houseId: houses[0].id,
        type: 'deposit',
        amount: '100',
        commission: '30',
        status: 'approved'
      }).onConflictDoNothing();
      
      await db.insert(conversions).values({
        userId: affiliateId,
        houseId: houses[1].id,
        type: 'registration',
        amount: '0',
        commission: '80',
        status: 'pending'
      }).onConflictDoNothing();
      
      console.log('✅ Dados de exemplo criados com sucesso');
    }
  } catch (error) {
    console.error('❌ Erro ao criar dados de exemplo:', error);
  }
}

async function main() {
  try {
    await createDefaultUsers();
    await createDefaultBettingHouses();
    await createSampleData();
    
    console.log('🎉 Migração para PostgreSQL concluída com sucesso!');
    console.log('📝 Credenciais de acesso:');
    console.log('   Admin: admin@afiliadosbet.com.br / admin123');
    console.log('   Afiliado: afiliado@afiliadosbet.com.br / admin123');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  } finally {
    process.exit(0);
  }
}

main();