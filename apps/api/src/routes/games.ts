import { sql } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { gamesSearchQuerySchema, type GamesSearchResponse } from '@pixpedia/shared';
import type { Db } from '@pixpedia/db';
import { escapeLike, toGameDto, type GameSearchRow } from '../games';

export const gamesRoutes =
  (db: Db): FastifyPluginAsync =>
  async (app) => {
    app.get('/games', async (req, reply) => {
      const parsed = gamesSearchQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return reply.code(400).send({ error: 'invalid_query', issues: parsed.error.issues });
      }
      const { search, limit } = parsed.data;
      const pattern = `%${escapeLike(search)}%`;

      // Jeux éligibles, avec la carte de leur série la plus récente.
      const { rows } = await db.execute<GameSearchRow & Record<string, unknown>>(sql`
        select g.id, g.name, g.slug, g.first_release_date, g.cover_image_id, g.developer_name,
               g.total_rating, g.total_rating_count,
               c.id as card_id, s.code as series_code, c.rarity, c.family,
               c.atk, c.def, c.hp, c.spd, c.score_at_print
        from games g
        left join lateral (
          select * from cards where cards.game_id = g.id order by cards.series_id desc limit 1
        ) c on true
        left join series s on s.id = c.series_id
        where g.status = 'eligible'
          and (g.name ilike ${pattern} or g.name % ${search})
        order by (g.name ilike ${`${escapeLike(search)}%`}) desc,
                 similarity(g.name, ${search}) desc,
                 g.total_rating_count desc,
                 g.id
        limit ${limit}
      `);

      const body: GamesSearchResponse = { games: rows.map(toGameDto) };
      return body;
    });
  };
