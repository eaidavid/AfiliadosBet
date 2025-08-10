import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema";
import path from "path";

// SQLite fallback configuration
const dbPath = path.join(process.cwd(), "data", "afiliadosbet.db");
console.log("🗄️ Usando banco SQLite:", dbPath);

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });

// Safe database query wrapper
export async function safeDbQuery<T>(queryFn: () => Promise<T> | T): Promise<T | null> {
  try {
    const result = await queryFn();
    return result;
  } catch (error) {
    console.error('Database query failed:', error);
    return null;
  }
}