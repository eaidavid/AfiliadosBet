import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;

// Create a direct connection bypassing Drizzle
async function createDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false // Try without SSL first
  });

  try {
    console.log('Connecting to database...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Create sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      )
    `);

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        birth_date TEXT NOT NULL,
        phone TEXT,
        city TEXT,
        state TEXT,
        country TEXT DEFAULT 'BR',
        role TEXT DEFAULT 'affiliate',
        is_active BOOLEAN DEFAULT true,
        pix_key_type TEXT,
        pix_key_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create betting_houses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS betting_houses (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        logo_url TEXT,
        base_url TEXT NOT NULL,
        primary_param TEXT NOT NULL,
        additional_params JSONB,
        commission_type TEXT NOT NULL,
        commission_value TEXT,
        cpa_value TEXT,
        revshare_value TEXT,
        revshare_affiliate_percent DECIMAL(5,2),
        cpa_affiliate_percent DECIMAL(5,2),
        min_deposit TEXT,
        payment_methods TEXT,
        is_active BOOLEAN DEFAULT true,
        identifier TEXT NOT NULL UNIQUE,
        enabled_postbacks JSONB DEFAULT '[]',
        security_token TEXT NOT NULL,
        parameter_mapping JSONB DEFAULT '{}',
        integration_type TEXT NOT NULL DEFAULT 'postback',
        api_config JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create affiliate_links table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS affiliate_links (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        house_id INTEGER NOT NULL REFERENCES betting_houses(id),
        generated_url TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create conversions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        house_id INTEGER NOT NULL REFERENCES betting_houses(id),
        affiliate_link_id INTEGER REFERENCES affiliate_links(id),
        type TEXT NOT NULL,
        amount TEXT NOT NULL,
        commission TEXT NOT NULL,
        conversion_data JSONB,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create click_tracking table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS click_tracking (
        id SERIAL PRIMARY KEY,
        link_id INTEGER NOT NULL REFERENCES affiliate_links(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        house_id INTEGER NOT NULL REFERENCES betting_houses(id),
        ip_address TEXT NOT NULL,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create payments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        payment_method TEXT,
        pix_key TEXT,
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP
      )
    `);

    // Insert admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO users (username, email, password, full_name, cpf, birth_date, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO NOTHING
    `, ['admin', 'admin@afiliadosbet.com.br', adminPassword, 'Administrador do Sistema', '00000000000', '1990-01-01', 'admin']);

    // Insert affiliate user
    await pool.query(`
      INSERT INTO users (username, email, password, full_name, cpf, birth_date, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO NOTHING
    `, ['afiliado1', 'afiliado@afiliadosbet.com.br', adminPassword, 'Afiliado Teste', '11111111111', '1995-05-15', 'affiliate']);

    console.log('✅ Database schema created successfully');
    console.log('✅ Default users created:');
    console.log('   - Admin: admin@afiliadosbet.com.br / admin123');
    console.log('   - Affiliate: afiliado@afiliadosbet.com.br / admin123');

  } catch (error) {
    console.error('❌ Database creation failed:', error.message);
    
    // Try with a fresh database URL if available
    if (process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE) {
      console.log('Trying with individual connection parameters...');
      
      const altPool = new Pool({
        host: process.env.PGHOST,
        port: process.env.PGPORT || 5432,
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        ssl: false
      });
      
      try {
        await altPool.query('SELECT NOW()');
        console.log('✅ Alternative connection successful');
        
        // Update DATABASE_URL for the application
        const newUrl = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE}`;
        console.log('New DATABASE_URL would be:', newUrl);
        
      } catch (altError) {
        console.error('❌ Alternative connection also failed:', altError.message);
      } finally {
        await altPool.end();
      }
    }
  } finally {
    await pool.end();
  }
}

createDatabase();