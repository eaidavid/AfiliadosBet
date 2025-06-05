// Teste simples para verificar se conseguimos acessar o banco
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './shared/schema.js';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

async function testHouseSearch() {
  try {
    console.log('🔍 Testando busca de casas...');
    
    // Buscar todas as casas
    const allHouses = await db.select().from(schema.bettingHouses);
    console.log('Todas as casas:', allHouses);
    
    // Buscar especificamente a brazzino
    const houses = await db.select()
      .from(schema.bettingHouses)
      .where(schema.bettingHouses.name.eq('brazzino'));
    console.log('Casa brazzino encontrada:', houses);
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await pool.end();
  }
}

testHouseSearch();