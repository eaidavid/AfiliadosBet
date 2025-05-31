import bcrypt from 'bcrypt';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './shared/schema.js';
import { eq } from 'drizzle-orm';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

async function createAdmin() {
  try {
    console.log('Criando usuário admin...');
    
    // Criar hash da senha "admin123"
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Deletar usuários admin existentes
    await db.delete(schema.users).where(eq(schema.users.role, 'admin'));
    
    // Criar novo usuário admin
    const [admin] = await db.insert(schema.users).values({
      username: 'admin',
      email: 'admin@afiliadosbet.com',
      password: hashedPassword,
      fullName: 'Administrador',
      cpf: '00000000000',
      birthDate: '1990-01-01',
      phone: '11999999999',
      city: 'São Paulo',
      state: 'SP',
      country: 'BR',
      role: 'admin',
      isActive: true
    }).returning();
    
    console.log('✅ Admin criado com sucesso!');
    console.log('📧 Email: admin@afiliadosbet.com');
    console.log('🔑 Senha: admin123');
    console.log('🆔 ID:', admin.id);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

createAdmin();