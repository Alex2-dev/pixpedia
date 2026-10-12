import cors from '@fastify/cors';
import Fastify, { type FastifyServerOptions } from 'fastify';
import { sql } from 'drizzle-orm';
import type { Db } from '@pixpedia/db';
import { gamesRoutes } from './routes/games';

export interface AppDeps {
  db: Db;
  corsOrigins?: string[];
}

export async function buildApp(deps: AppDeps, opts: FastifyServerOptions = {}) {
  const app = Fastify(opts);
  await app.register(cors, { origin: deps.corsOrigins ?? false });

  app.get('/health', async (_req, reply) => {
    try {
      await deps.db.execute(sql`select 1`);
      return { status: 'ok', db: 'ok' };
    } catch (err) {
      app.log.error(err, 'healthcheck: base injoignable');
      return reply.code(503).send({ status: 'degraded', db: 'down' });
    }
  });

  await app.register(gamesRoutes(deps.db));
  return app;
}
