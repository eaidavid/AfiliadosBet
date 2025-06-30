import { db } from './db';
import bcrypt from 'bcrypt';
import { users, bettingHouses } from '../shared/schema';

export async function initializeDatabase() {
  try {
    console.log('Inicializando banco de dados SQLite...');

    // Insert default admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    try {
      await db.insert(users).values({
        username: 'admin',
        email: 'admin@afiliadosbet.com.br',
        password: adminPassword,
        fullName: 'Administrador do Sistema',
        cpf: '00000000000',
        birthDate: '1990-01-01',
        role: 'admin'
      }).onConflictDoNothing();
    } catch (error) {
      // User already exists, that's fine
    }

    // Insert default affiliate user
    try {
      await db.insert(users).values({
        username: 'afiliado1',
        email: 'afiliado@afiliadosbet.com.br',
        password: adminPassword,
        fullName: 'Afiliado Teste',
        cpf: '11111111111',
        birthDate: '1995-05-15',
        role: 'affiliate'
      }).onConflictDoNothing();
    } catch (error) {
      // User already exists, that's fine
    }

    console.log('✅ Banco de dados SQLite inicializado com sucesso!');
    console.log('✅ Usuários padrão criados:');
    console.log('   - Admin: admin@afiliadosbet.com.br / admin123');
    console.log('   - Afiliado: afiliado@afiliadosbet.com.br / admin123');

    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    return false;
  }
}