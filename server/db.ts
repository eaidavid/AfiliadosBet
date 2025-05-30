import pg from 'pg';
const { Pool } = pg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://afiliadosbet:AfiliadosBet1001@localhost:5432/afiliadosbet";

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle(pool, { schema });