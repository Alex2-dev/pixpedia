import { createDb } from '@pixpedia/db';
import { buildApp } from './app';

const port = Number(process.env.API_PORT ?? 3014);
const corsOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const { db, pool } = createDb();
const app = await buildApp({ db, corsOrigins }, { logger: true });

const shutdown = async () => {
  await app.close();
  await pool.end();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

await app.listen({ host: '0.0.0.0', port });
