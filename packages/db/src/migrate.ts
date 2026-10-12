import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDb } from './client';

const migrationsFolder = fileURLToPath(new URL('../drizzle', import.meta.url));

const { db, pool } = createDb();
try {
  await migrate(db, { migrationsFolder });
  console.log('Migrations appliquées.');
} finally {
  await pool.end();
}
