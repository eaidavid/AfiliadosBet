import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create SQLite database connection
const dbPath = path.join(dataDir, 'afiliadosbet.db');
const sqlite = new Database(dbPath);

// Enable foreign key constraints
sqlite.exec('PRAGMA foreign_keys = ON;');

// Create database instance with enhanced error handling
export const db = drizzle(sqlite, { schema });

// Database wrapper with enhanced error handling
export async function safeDbQuery<T>(queryFn: () => Promise<T>): Promise<T | null> {
  try {
    return await queryFn();
  } catch (error: any) {
    console.error('Database query failed:', error.message);
    
    // Handle connection errors
    if (error.message?.includes('Connection refused') || error.message?.includes('ECONNREFUSED')) {
      throw new Error('DATABASE_CONNECTION_REFUSED');
    }
    
    if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
      throw new Error('DATABASE_CONNECTION_TIMEOUT');
    }
    
    throw error;
  }
}

// Initialize database with connection validation
export async function initializeDatabase() {
  try {
    console.log('Initializing database connection...');
    await testDatabaseConnection();
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}

// Test database connection with simple query
export async function testDatabaseConnection() {
  try {
    const result = sqlite.prepare('SELECT datetime("now") as current_time').get();
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

export { sqlite };