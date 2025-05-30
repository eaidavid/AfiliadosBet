const bcrypt = require('bcrypt');
const { Pool } = require('pg');

async function createAdmin() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://afiliadosbet:AfiliadosBet1001@localhost:5432/afiliadosbet'
  });

  try {
    // Hash da senha "admin123"
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Deletar usuário admin existente se houver
    await pool.query('DELETE FROM users WHERE email = $1', ['admin@afiliadosbet.com']);
    
    // Criar novo usuário admin
    const result = await pool.query(
      'INSERT INTO users (name, email, cpf, password, role, city, is_active, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING id, email',
      ['Administrador', 'admin@afiliadosbet.com', '00000000000', hashedPassword, 'admin', 'São Paulo', true]
    );
    
    console.log('Usuário admin criado com sucesso!');
    console.log('Email: admin@afiliadosbet.com');
    console.log('Senha: admin123');
    console.log('ID:', result.rows[0].id);
    
  } catch (error) {
    console.error('Erro ao criar admin:', error);
  } finally {
    await pool.end();
  }
}

createAdmin();