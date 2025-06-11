// Script to add test payment data for demonstration
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './shared/schema.js';

async function addTestPayments() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await client.connect();
  const db = drizzle(client, { schema });

  console.log('🔄 Adding test payment data...');

  // Get some existing users
  const users = await db.select().from(schema.users).limit(5);
  
  if (users.length === 0) {
    console.log('❌ No users found. Please add users first.');
    await client.end();
    return;
  }

  // Test payments with different statuses and methods
  const testPayments = [
    {
      userId: users[0].id,
      amount: '150.00',
      method: 'pix',
      pixKey: 'usuario1@email.com',
      status: 'pending',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      userId: users[1].id,
      amount: '250.75',
      method: 'pix',
      pixKey: '+5511999999999',
      status: 'completed',
      transactionId: 'TXN_' + Date.now() + '_001',
      paidAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000) // 2 days ago
    },
    {
      userId: users[2].id,
      amount: '75.50',
      method: 'bank_transfer',
      status: 'failed',
      createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000) // 1.5 days ago
    },
    {
      userId: users[0].id,
      amount: '320.00',
      method: 'pix',
      pixKey: '12345678901',
      status: 'pending',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
    },
    {
      userId: users[3].id,
      amount: '89.99',
      method: 'pix',
      pixKey: 'chave.pix.aleatoria.123',
      status: 'completed',
      transactionId: 'TXN_' + Date.now() + '_002',
      paidAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000) // 3 days ago
    },
    {
      userId: users[1].id,
      amount: '500.00',
      method: 'bank_transfer',
      status: 'pending',
      createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    },
    {
      userId: users[4].id,
      amount: '1250.00',
      method: 'pix',
      pixKey: 'empresa@dominio.com.br',
      status: 'completed',
      transactionId: 'TXN_' + Date.now() + '_003',
      paidAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000) // 4 days ago
    },
    {
      userId: users[2].id,
      amount: '45.00',
      method: 'pix',
      pixKey: '98765432109',
      status: 'failed',
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000) // 18 hours ago
    },
    {
      userId: users[3].id,
      amount: '180.25',
      method: 'bank_transfer',
      status: 'pending',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
    },
    {
      userId: users[4].id,
      amount: '350.00',
      method: 'pix',
      pixKey: 'contato@empresa.com',
      status: 'completed',
      transactionId: 'TXN_' + Date.now() + '_004',
      paidAt: new Date(),
      createdAt: new Date(Date.now() - 120 * 60 * 60 * 1000) // 5 days ago
    }
  ];

  try {
    // Insert test payments
    const insertedPayments = await db.insert(schema.payments).values(testPayments).returning();
    
    console.log(`✅ Successfully added ${insertedPayments.length} test payments:`);
    console.log('📊 Payment Statistics:');
    
    const pending = testPayments.filter(p => p.status === 'pending').length;
    const completed = testPayments.filter(p => p.status === 'completed').length;
    const failed = testPayments.filter(p => p.status === 'failed').length;
    const pixPayments = testPayments.filter(p => p.method === 'pix').length;
    const bankTransfers = testPayments.filter(p => p.method === 'bank_transfer').length;
    
    console.log(`   • Pendentes: ${pending}`);
    console.log(`   • Pagos: ${completed}`);
    console.log(`   • Falhados: ${failed}`);
    console.log(`   • PIX: ${pixPayments}`);
    console.log(`   • TED: ${bankTransfers}`);
    
    const totalAmount = testPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    console.log(`   • Valor Total: R$ ${totalAmount.toFixed(2)}`);
    
    console.log('\n🎉 Test data ready! You can now test the payment management system at /admin/payments');
    
  } catch (error) {
    console.error('❌ Error adding test payments:', error);
  } finally {
    await client.end();
  }
}

addTestPayments().catch(console.error);