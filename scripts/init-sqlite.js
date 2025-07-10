import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(path.dirname(__dirname), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'afiliadosbet.db');
const db = new Database(dbPath);

console.log('Initializing SQLite database...');

// Enable foreign key constraints
db.exec('PRAGMA foreign_keys = ON;');

// Create tables
const createTables = `
-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  sid TEXT PRIMARY KEY,
  sess TEXT NOT NULL,
  expire TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  is_active INTEGER DEFAULT 1,
  pix_key_type TEXT,
  pix_key_value TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Betting houses table
CREATE TABLE IF NOT EXISTS betting_houses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  base_url TEXT NOT NULL,
  primary_param TEXT NOT NULL,
  additional_params TEXT,
  commission_type TEXT NOT NULL,
  commission_value TEXT,
  cpa_value TEXT,
  revshare_value TEXT,
  revshare_affiliate_percent REAL,
  cpa_affiliate_percent REAL,
  min_deposit TEXT,
  payment_methods TEXT,
  is_active INTEGER DEFAULT 1,
  identifier TEXT NOT NULL UNIQUE,
  enabled_postbacks TEXT,
  security_token TEXT NOT NULL,
  parameter_mapping TEXT,
  integration_type TEXT NOT NULL DEFAULT 'postback',
  api_config TEXT,
  api_base_url TEXT,
  api_key TEXT,
  api_secret TEXT,
  api_version TEXT DEFAULT 'v1',
  sync_interval INTEGER DEFAULT 30,
  last_sync_at TEXT,
  sync_status TEXT DEFAULT 'pending',
  sync_error_message TEXT,
  endpoint_mapping TEXT,
  auth_type TEXT DEFAULT 'bearer',
  auth_headers TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Affiliate links table
CREATE TABLE IF NOT EXISTS affiliate_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  house_id INTEGER NOT NULL REFERENCES betting_houses(id),
  generated_url TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Click tracking table
CREATE TABLE IF NOT EXISTS click_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id INTEGER NOT NULL REFERENCES affiliate_links(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  house_id INTEGER NOT NULL REFERENCES betting_houses(id),
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Conversions table
CREATE TABLE IF NOT EXISTS conversions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  house_id INTEGER NOT NULL REFERENCES betting_houses(id),
  affiliate_link_id INTEGER REFERENCES affiliate_links(id),
  event_type TEXT NOT NULL,
  amount REAL,
  commission_amount REAL,
  commission_type TEXT,
  customer_id TEXT,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending',
  processed_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  amount REAL NOT NULL,
  method TEXT NOT NULL,
  pix_key TEXT,
  status TEXT DEFAULT 'pending',
  requested_at TEXT DEFAULT CURRENT_TIMESTAMP,
  paid_at TEXT,
  transaction_id TEXT,
  notes TEXT
);
`;

try {
  db.exec(createTables);
  console.log('✅ Database tables created successfully');

  // Insert default users
  const adminPassword = bcrypt.hashSync('admin123', 10);

  const insertAdmin = db.prepare(`
    INSERT OR IGNORE INTO users 
    (username, email, password, full_name, cpf, birth_date, role) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertAdmin.run(
    'admin',
    'admin@afiliadosbet.com.br',
    adminPassword,
    'Administrador do Sistema',
    '00000000000',
    '1990-01-01',
    'admin'
  );

  insertAdmin.run(
    'afiliado1',
    'afiliado@afiliadosbet.com.br',
    adminPassword,
    'Afiliado Teste',
    '11111111111',
    '1995-05-15',
    'affiliate'
  );

  console.log('✅ Default users created successfully');
  console.log('   - Admin: admin@afiliadosbet.com.br / admin123');
  console.log('   - Afiliado: afiliado@afiliadosbet.com.br / admin123');

} catch (error) {
  console.error('❌ Error initializing database:', error);
  process.exit(1);
} finally {
  db.close();
}