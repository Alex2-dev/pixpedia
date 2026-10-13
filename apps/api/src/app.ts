import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyServerOptions } from 'fastify';
import { sql } from 'drizzle-orm';
import type { Db } from '@pixpedia/db';
import { PACK_MAX, PACK_REGEN_MINUTES } from '@pixpedia/shared';
import { authPlugin } from './auth/plugin';
import { authRoutes } from './routes/auth';
import { gamesRoutes } from './routes/games';
import { playerRoutes } from './routes/player';
import { setsRoutes } from './routes/sets';
import type { PackConfig } from './services/open-pack';

export interface AppDeps {
  db: Db;
  corsOrigins?: string[];
  /** false seulement en dev HTTP hors localhost. */
  cookieSecure?: boolean;
  /** Désactivé dans les tests. */
  rateLimit?: boolean;
  pack?: PackConfig;
  randomInt?: (max: number) => number;
  now?: () => Date;
}

export async function buildApp(deps: AppDeps, opts: FastifyServerOptions = {}) {
  const app = Fastify(opts);
  await app.register(cors, { origin: deps.corsOrigins ?? false, credentials: true });
  await app.register(cookie);
  // Sans le plugin (tests), les limites déclarées par les routes sont simplement ignorées.
  if (deps.rateLimit !== false) {
    await app.register(rateLimit, { global: false, enableDraftSpec: true });
  }
  await app.register(authPlugin, { db: deps.db });

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
  await app.register(authRoutes, { db: deps.db, cookieSecure: deps.cookieSecure ?? true });
  await app.register(setsRoutes, { db: deps.db });
  await app.register(playerRoutes, {
    db: deps.db,
    pack: deps.pack ?? { max: PACK_MAX, regenMs: PACK_REGEN_MINUTES * 60_000 },
    randomInt: deps.randomInt,
    now: deps.now,
  });
  return app;
}
