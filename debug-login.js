import bcrypt from 'bcrypt';
import { Pool } from 'pg';

async function debugLogin() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://afiliadosbet:AfiliadosBet1001@localhost:5432/afiliadosbet'
  });

  try {
    console.log('=== DEBUG LOGIN ===');
    
    // Verificar usuários existentes
    const users = await pool.query('SELECT id, email, role, password FROM users WHERE role = $1', ['admin']);
    console.log('Usuários admin encontrados:', users.rows.length);
    
    for (const user of users.rows) {
      console.log(`ID: ${user.id}, Email: ${user.email}`);
      console.log(`Password hash: ${user.password.substring(0, 20)}...`);
      
      // Testar senha
      const testPassword = 'admin123';
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`Senha "${testPassword}" válida para ${user.email}:`, isValid);
      
      // Testar outras senhas comuns
      const commonPasswords = ['password', 'admin', '123456', 'admin123'];
      for (const pwd of commonPasswords) {
        const valid = await bcrypt.compare(pwd, user.password);
        if (valid) {
          console.log(`✓ SENHA ENCONTRADA: "${pwd}" funciona para ${user.email}`);
        }
      }
    }
    
    // Criar novo admin com senha conhecida
    console.log('\n=== CRIANDO NOVO ADMIN ===');
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Deletar admin existente
    await pool.query('DELETE FROM users WHERE email = $1', ['admin@admin.com']);
    
    // Criar novo
    const result = await pool.query(
      'INSERT INTO users (name, email, cpf, password, role, city, is_active, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING id, email',
      ['Admin Sistema', 'admin@admin.com', '99999999999', hashedPassword, 'admin', 'São Paulo', true]
    );
    
    console.log('✓ Novo admin criado:');
    console.log('Email: admin@admin.com');
    console.log('Senha: admin123');
    console.log('ID:', result.rows[0].id);
    
    // Verificar se a senha funciona
    const testUser = await pool.query('SELECT password FROM users WHERE email = $1', ['admin@admin.com']);
    const passwordWorks = await bcrypt.compare('admin123', testUser.rows[0].password);
    console.log('✓ Verificação de senha:', passwordWorks ? 'FUNCIONA' : 'FALHOU');
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await pool.end();
  }
}

debugLogin();