import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon for serverless environments
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Enhanced database configuration with retry logic
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

// Create database instance with enhanced error handling
export const db = drizzle({ client: pool, schema });

// Database wrapper with enhanced error handling for Neon serverless
export async function safeDbQuery<T>(queryFn: () => Promise<T>): Promise<T | null> {
  try {
    return await queryFn();
  } catch (error: any) {
    console.error('Database query failed:', error.message);
    
    // Handle specific Neon endpoint disabled error
    if (error.code === 'XX000' && error.message?.includes('endpoint is disabled')) {
      console.warn('Neon database endpoint is disabled - this may be a temporary issue');
      throw new Error('DATABASE_ENDPOINT_DISABLED');
    }
    
    // Handle other connection errors
    if (error.message?.includes('Control plane request failed')) {
      throw new Error('DATABASE_CONNECTION_FAILED');
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

// Test database connection
export async function testDatabaseConnection() {
  try {
    await safeDbQuery(() => db.select().from(schema.users).limit(1));
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

export { pool };