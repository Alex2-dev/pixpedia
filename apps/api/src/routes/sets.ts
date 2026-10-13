import type { FastifyPluginAsync } from 'fastify';
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import type { Db } from '@pixpedia/db';
import { SET_TYPE_KEYS, setCardsQuerySchema, setsQuerySchema } from '@pixpedia/shared';
import { loadCardViews } from '../cards';
import { sendInvalid } from '../errors';
import { escapeLike } from '../games';

const setParams = z.object({ type: z.enum(SET_TYPE_KEYS), key: z.string().min(1).max(200) });

/** Série la plus récente : c'est elle que les sets et le tirage utilisent. */
const CURRENT_SERIES = sql`(select id from series order by id desc limit 1)`;

/**
 * Cartes distinctes possédées par le joueur, par set. On part de ses cartes (quelques
 * centaines) et non des sets : un set comme « PC » contient plus de 100 000 cartes.
 */
const ownedCounts = (userId: number) => sql`
  select sc.set_id, count(distinct sc.card_id)::int as n
  from user_cards uc join set_cards sc on sc.card_id = uc.card_id
  where uc.user_id = ${userId}
  group by sc.set_id
`;

export const setsRoutes: FastifyPluginAsync<{ db: Db }> = async (app, { db }) => {
  app.get('/sets', async (req, reply) => {
    const parsed = setsQuerySchema.safeParse(req.query);
    if (!parsed.success) return sendInvalid(reply, parsed.error);
    const q = parsed.data;
    const userId = req.user?.id ?? 0;

    const order = {
      progress: sql`coalesce(oc.n, 0)::float / s.total desc, coalesce(oc.n, 0) desc, s.total desc, s.name`,
      size: sql`s.total desc, s.name`,
      name: sql`s.name`,
    }[q.sort];
    const search = q.search ? sql`and s.name ilike ${`%${escapeLike(q.search)}%`}` : sql``;

    const { rows } = await db.execute<{
      type: string;
      key: string;
      name: string;
      total: number;
      owned: number;
      matching: number;
    }>(sql`
      with oc as (${ownedCounts(userId)})
      select s.type, s.key, s.name, s.total, coalesce(oc.n, 0)::int as owned,
             count(*) over ()::int as matching
      from sets s left join oc on oc.set_id = s.id
      where s.series_id = ${CURRENT_SERIES} and s.type = ${q.type} ${search}
      order by ${order}
      limit ${q.pageSize} offset ${(q.page - 1) * q.pageSize}
    `);
    return {
      page: q.page,
      pageSize: q.pageSize,
      total: rows[0]?.matching ?? 0,
      sets: rows.map(({ matching: _m, ...s }) => s),
    };
  });

  /** Résumé par type : nombre de sets, commencés et complétés par le joueur. */
  app.get('/sets/summary', async (req) => {
    const userId = req.user?.id ?? 0;
    const { rows } = await db.execute<{
      type: string;
      sets: number;
      started: number;
      completed: number;
    }>(sql`
      with oc as (${ownedCounts(userId)})
      select s.type, count(*)::int as sets,
             count(oc.n)::int as started,
             count(*) filter (where oc.n = s.total)::int as completed
      from sets s left join oc on oc.set_id = s.id
      where s.series_id = ${CURRENT_SERIES}
      group by s.type
    `);
    return { types: rows };
  });

  app.get('/sets/:type/:key', async (req, reply) => {
    const params = setParams.safeParse(req.params);
    if (!params.success) return sendInvalid(reply, params.error);
    const query = setCardsQuerySchema.safeParse(req.query);
    if (!query.success) return sendInvalid(reply, query.error);
    const { type, key } = params.data;
    const q = query.data;
    const userId = req.user?.id ?? 0;

    const { rows: found } = await db.execute<{ id: number; name: string; total: number }>(sql`
      select id, name, total from sets
      where series_id = ${CURRENT_SERIES} and type = ${type} and key = ${key}
    `);
    const set = found[0];
    if (!set) return reply.code(404).send({ error: 'set_not_found' });

    const filter = {
      all: sql``,
      owned: sql`and o.card_id is not null`,
      missing: sql`and o.card_id is null`,
    }[q.missing];
    const { rows } = await db.execute<{ card_id: number; owned: boolean; matching: number }>(sql`
      with o as (select distinct card_id from user_cards where user_id = ${userId})
      select sc.card_id, (o.card_id is not null) as owned, count(*) over ()::int as matching
      from set_cards sc
      join cards c on c.id = sc.card_id
      left join o on o.card_id = sc.card_id
      where sc.set_id = ${set.id} ${filter}
      order by c.number
      limit ${q.pageSize} offset ${(q.page - 1) * q.pageSize}
    `);
    const { rows: ownedRows } = await db.execute<{ n: number }>(sql`
      select count(distinct sc.card_id)::int as n
      from set_cards sc join user_cards uc on uc.card_id = sc.card_id and uc.user_id = ${userId}
      where sc.set_id = ${set.id}
    `);
    const views = await loadCardViews(
      db,
      rows.map((r) => r.card_id),
    );

    return {
      type,
      key,
      name: set.name,
      total: set.total,
      owned: ownedRows[0]?.n ?? 0,
      page: q.page,
      pageSize: q.pageSize,
      matching: rows[0]?.matching ?? 0,
      cards: rows.map((r) => ({ ...views.get(r.card_id)!, owned: r.owned })),
    };
  });
};
