import type { FastifyPluginAsync, FastifyReply } from 'fastify';
import { sql } from 'drizzle-orm';
import { users, type Db } from '@pixpedia/db';
import { loginSchema, registerSchema } from '@pixpedia/shared';
import { hashPassword, verifyAgainstDummy, verifyPassword } from '../auth/password';
import { SESSION_COOKIE, createSession, deleteSession } from '../auth/sessions';
import { sendInvalid } from '../errors';

export interface AuthRouteOptions {
  db: Db;
  cookieSecure: boolean;
}

export const authRoutes: FastifyPluginAsync<AuthRouteOptions> = async (
  app,
  { db, cookieSecure },
) => {
  const setSessionCookie = (reply: FastifyReply, token: string, expires: Date) =>
    reply.setCookie(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: 'lax',
      path: '/',
      expires,
    });

  // Limites anti-abus : inscriptions et tentatives de connexion par IP (spec §11).
  app.post(
    '/auth/register',
    { config: { rateLimit: { max: 5, timeWindow: '1 hour' } } },
    async (req, reply) => {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) return sendInvalid(reply, parsed.error);
      const input = parsed.data;

      const [taken] = await db
        .select({
          username: sql<boolean>`lower(${users.username}) = lower(${input.username})`,
        })
        .from(users)
        .where(
          sql`lower(${users.username}) = lower(${input.username}) or lower(${users.email}) = ${input.email}`,
        )
        .limit(1);
      if (taken) {
        // Pas de distinction pseudo / email pris côté email, pour ne pas révéler les comptes existants.
        return reply
          .code(409)
          .send({ error: taken.username ? 'username_taken' : 'account_exists' });
      }

      const [user] = await db
        .insert(users)
        .values({
          username: input.username,
          email: input.email,
          passwordHash: await hashPassword(input.password),
          countryCode: input.countryCode,
          ageConfirmedAt: new Date(),
        })
        .returning({ id: users.id, username: users.username });
      const session = await createSession(db, user!.id);
      setSessionCookie(reply, session.token, session.expiresAt);
      return reply.code(201).send({ user });
    },
  );

  app.post(
    '/auth/login',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (req, reply) => {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) return sendInvalid(reply, parsed.error);
      const { email, password } = parsed.data;

      const [user] = await db
        .select({ id: users.id, username: users.username, passwordHash: users.passwordHash })
        .from(users)
        .where(sql`lower(${users.email}) = ${email}`);
      const ok = user
        ? await verifyPassword(user.passwordHash, password)
        : await verifyAgainstDummy(password);
      if (!user || !ok) return reply.code(401).send({ error: 'invalid_credentials' });

      const session = await createSession(db, user.id);
      setSessionCookie(reply, session.token, session.expiresAt);
      return { user: { id: user.id, username: user.username } };
    },
  );

  app.post('/auth/logout', async (req, reply) => {
    const token = req.cookies[SESSION_COOKIE];
    if (token) await deleteSession(db, token);
    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return reply.code(204).send();
  });
};
