import type { FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import type { Db } from '@pixpedia/db';
import { SESSION_COOKIE, findSessionUser, type SessionUser } from './sessions';

declare module 'fastify' {
  interface FastifyRequest {
    user: SessionUser | null;
  }
}

/** Lit le cookie de session et remplit `request.user`. */
export const authPlugin = fp<{ db: Db }>(async (app, { db }) => {
  app.decorateRequest('user', null);
  app.addHook('onRequest', async (req) => {
    const token = req.cookies[SESSION_COOKIE];
    req.user = token ? await findSessionUser(db, token) : null;
  });
});

/** preHandler des routes réservées aux joueurs connectés. */
export async function requireUser(req: FastifyRequest, reply: FastifyReply) {
  if (!req.user) return reply.code(401).send({ error: 'unauthenticated' });
}
