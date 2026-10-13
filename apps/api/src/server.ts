import { createDb } from '@pixpedia/db';
import { buildApp } from './app';

const port = Number(process.env.API_PORT ?? 3014);
const corsOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const { db, pool } = createDb();
const app = await buildApp(
  {
    db,
    corsOrigins,
    cookieSecure: process.env.COOKIE_SECURE !== 'false',
    pack: {
      max: Number(process.env.PACK_MAX ?? 10),
      regenMs: Number(process.env.PACK_REGEN_MINUTES ?? 5) * 60_000,
    },
  },
  { logger: true, trustProxy: true },
);

const shutdown = async () => {
  await app.close();
  await pool.end();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

await app.listen({ host: '0.0.0.0', port });
