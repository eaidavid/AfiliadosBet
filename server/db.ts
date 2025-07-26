import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Initialize connection pool with regular PostgreSQL driver
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });

// Safe database query wrapper with error handling
export async function safeDbQuery<T>(queryFn: () => Promise<T>): Promise<T | null> {
  try {
    return await queryFn();
  } catch (error) {
    console.error('Database query failed:', error);
    return null;
  }
}