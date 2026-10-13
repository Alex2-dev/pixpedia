import type { FastifyPluginAsync } from 'fastify';
import { sql } from 'drizzle-orm';
import type { Db } from '@pixpedia/db';
import { hofDropsQuerySchema } from '@pixpedia/shared';
import { sendInvalid } from '../errors';

/**
 * Annonces « pseudo a tiré Jeu » (événement card_drop_hof). Lecture simple pour l'instant :
 * le bandeau interroge cette route ; le temps réel (SSE ou WebSocket) la remplacera.
 */
export const dropsRoutes: FastifyPluginAsync<{ db: Db }> = async (app, { db }) => {
  app.get('/drops/hof', async (req, reply) => {
    const parsed = hofDropsQuerySchema.safeParse(req.query);
    if (!parsed.success) return sendInvalid(reply, parsed.error);
    const { since, limit } = parsed.data;
    const after = since ? sql`and e.created_at > ${since}` : sql``;
    const { rows } = await db.execute<{
      id: number;
      username: string;
      card_id: number;
      name: string;
      created_at: string;
    }>(sql`
      select e.id, u.username, e.card_id, g.name, e.created_at
      from drop_events e
      join users u on u.id = e.user_id
      join cards c on c.id = e.card_id
      join games g on g.id = c.game_id
      where e.kind = 'card_drop_hof' ${after}
      order by e.created_at desc
      limit ${limit}
    `);
    return {
      drops: rows.map((r) => ({
        id: Number(r.id),
        username: r.username,
        cardId: r.card_id,
        name: r.name,
        createdAt: new Date(r.created_at).toISOString(),
      })),
    };
  });
};
