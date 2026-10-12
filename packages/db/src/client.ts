import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

export type Db = NodePgDatabase<typeof schema>;

export function createDb(connectionString = process.env.DATABASE_URL): { db: Db; pool: pg.Pool } {
  if (!connectionString) throw new Error('DATABASE_URL manquante (voir .env.example)');
  const pool = new pg.Pool({ connectionString, max: 10 });
  return { db: drizzle(pool, { schema }), pool };
}
