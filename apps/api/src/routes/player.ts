import { randomInt } from 'node:crypto';
import { and, asc, desc, eq, ilike, sql, type SQL } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { cards, events, games, packTypes, userCards, users, type Db } from '@pixpedia/db';
import {
  EXTRA_STANDARD_PACK_SHARDS,
  collectionQuerySchema,
  computePackStock,
  openPackSchema,
  recycleSchema,
  settingsSchema,
} from '@pixpedia/shared';
import { requireUser } from '../auth/plugin';
import { loadCardViews } from '../cards';
import { ApiError, sendInvalid } from '../errors';
import { escapeLike } from '../games';
import { openPack, type PackConfig } from '../services/open-pack';
import { listDuplicates, recycle } from '../services/recycle';

export interface PlayerRouteOptions {
  db: Db;
  pack: PackConfig;
  randomInt?: (max: number) => number;
  now?: () => Date;
}

const cardIdParams = z.object({ id: z.coerce.number().int().positive() });

export const playerRoutes: FastifyPluginAsync<PlayerRouteOptions> = async (app, opts) => {
  const { db, pack } = opts;
  const now = opts.now ?? (() => new Date());
  const rng = opts.randomInt ?? ((max: number) => randomInt(max));

  app.get('/me', { preHandler: requireUser }, async (req) => {
    const [u] = await db.select().from(users).where(eq(users.id, req.user!.id));
    const stock = computePackStock(
      { available: u!.packsAvailable, updatedAt: u!.packsUpdatedAt },
      now(),
      pack,
    );
    return {
      id: u!.id,
      username: u!.username,
      role: u!.role,
      countryCode: u!.countryCode,
      emailVerified: u!.emailVerifiedAt !== null,
      packsAvailable: stock.available,
      packsMax: pack.max,
      nextPackAt: stock.nextPackAt,
      pityCounter: u!.pityCounter,
      shards: u!.shards,
      coins: u!.coins,
      reducedMotion: u!.reducedMotion,
      /** false tant que le joueur n'a jamais vu d'animation Hall of Fame. */
      hofSeen: u!.firstHofSeenAt !== null,
    };
  });

  app.patch('/me/settings', { preHandler: requireUser }, async (req, reply) => {
    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) return sendInvalid(reply, parsed.error);
    await db.update(users).set(parsed.data).where(eq(users.id, req.user!.id));
    return parsed.data;
  });

  /** Le joueur a vu son premier Hall of Fame : les suivants pourront être sautés tout de suite. */
  app.post('/me/hof-seen', { preHandler: requireUser }, async (req) => {
    const [row] = await db
      .update(users)
      .set({ firstHofSeenAt: sql`coalesce(${users.firstHofSeenAt}, now())` })
      .where(eq(users.id, req.user!.id))
      .returning({ firstHofSeenAt: users.firstHofSeenAt });
    return { firstHofSeenAt: row!.firstHofSeenAt };
  });

  // Les taux de drop sont publics (spec §5.4).
  app.get('/packs', async () => {
    const types = await db
      .select({
        id: packTypes.id,
        code: packTypes.code,
        name: packTypes.name,
        cost: packTypes.cost,
        odds: packTypes.odds,
        finishOdds: packTypes.finishOdds,
        bindsCards: packTypes.bindsCards,
      })
      .from(packTypes)
      .where(eq(packTypes.isActive, true))
      .orderBy(asc(packTypes.id));
    return { packs: types, extraStandardPackShards: EXTRA_STANDARD_PACK_SHARDS };
  });

  /** Doublons recyclables : nombre d'exemplaires et éclats qu'ils rapporteraient. */
  app.get('/collection/duplicates', { preHandler: requireUser }, async (req) => {
    const { copies, shards } = await listDuplicates(db, req.user!.id);
    return { copies, shards };
  });

  app.post('/cards/recycle', { preHandler: requireUser }, async (req, reply) => {
    const parsed = recycleSchema.safeParse(req.body);
    if (!parsed.success) return sendInvalid(reply, parsed.error);
    try {
      return await recycle(db, req.user!.id, [parsed.data]);
    } catch (err) {
      if (err instanceof ApiError) return reply.code(err.status).send({ error: err.code });
      throw err;
    }
  });

  app.post('/cards/recycle-duplicates', { preHandler: requireUser }, async (req, reply) => {
    const { items } = await listDuplicates(db, req.user!.id);
    if (!items.length) return { copies: 0, shardsGained: 0, shards: null };
    try {
      return await recycle(db, req.user!.id, items);
    } catch (err) {
      if (err instanceof ApiError) return reply.code(err.status).send({ error: err.code });
      throw err;
    }
  });

  app.post(
    '/packs/open',
    { preHandler: requireUser, config: { rateLimit: { max: 30, timeWindow: '1 minute' } } },
    async (req, reply) => {
      const parsed = openPackSchema.safeParse(req.body);
      if (!parsed.success) return sendInvalid(reply, parsed.error);
      try {
        const result = await openPack(
          { db, randomInt: rng, now, pack },
          req.user!.id,
          parsed.data.packTypeId,
          parsed.data.idempotencyKey,
          parsed.data.useShards,
        );
        const views = await loadCardViews(
          db,
          result.cards.map((c) => c.cardId),
        );
        return {
          ...result,
          cards: result.cards.map((c) => ({
            ...views.get(c.cardId)!,
            finish: c.finish,
            isNew: c.isNew,
          })),
        };
      } catch (err) {
        if (err instanceof ApiError) return reply.code(err.status).send({ error: err.code });
        throw err;
      }
    },
  );

  app.get('/collection', { preHandler: requireUser }, async (req, reply) => {
    const parsed = collectionQuerySchema.safeParse(req.query);
    if (!parsed.success) return sendInvalid(reply, parsed.error);
    const q = parsed.data;

    const filters: SQL[] = [eq(userCards.userId, req.user!.id)];
    if (q.rarity) filters.push(eq(cards.rarity, q.rarity));
    if (q.family) filters.push(eq(cards.family, q.family));
    if (q.finish) filters.push(eq(userCards.finish, q.finish));
    if (q.search) filters.push(ilike(games.name, `%${escapeLike(q.search)}%`));
    const where = and(...filters);

    const rarityOrder = sql`array_position(array['hof','final','boss','combo','bonus','starter'], ${cards.rarity})`;
    const orderBy = {
      recent: [desc(userCards.firstObtainedAt)],
      rarity: [asc(rarityOrder), asc(games.name)],
      name: [asc(games.name)],
      year: [desc(games.firstReleaseDate), asc(games.name)],
    }[q.sort];

    const [rows, [total]] = await Promise.all([
      db
        .select({
          copyId: userCards.id,
          cardId: userCards.cardId,
          finish: userCards.finish,
          isBound: userCards.isBound,
          eventName: events.name,
          quantity: userCards.quantity,
          isFavorite: userCards.isFavorite,
          firstObtainedAt: userCards.firstObtainedAt,
        })
        .from(userCards)
        .innerJoin(cards, eq(cards.id, userCards.cardId))
        .innerJoin(games, eq(games.id, cards.gameId))
        .leftJoin(events, eq(events.id, userCards.eventId))
        .where(where)
        .orderBy(...orderBy, asc(userCards.cardId), asc(userCards.finish))
        .limit(q.pageSize)
        .offset((q.page - 1) * q.pageSize),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(userCards)
        .innerJoin(cards, eq(cards.id, userCards.cardId))
        .innerJoin(games, eq(games.id, cards.gameId))
        .where(where),
    ]);
    const views = await loadCardViews(
      db,
      rows.map((r) => r.cardId),
    );

    return {
      page: q.page,
      pageSize: q.pageSize,
      total: total!.n,
      cards: rows.map((r) => ({ ...views.get(r.cardId)!, ...r })),
    };
  });

  // Détail d'une carte : public si le jeu est éligible, sinon réservé à ceux qui la possèdent.
  app.get('/cards/:id', async (req, reply) => {
    const parsed = cardIdParams.safeParse(req.params);
    if (!parsed.success) return sendInvalid(reply, parsed.error);
    const cardId = parsed.data.id;

    const [view] = (await loadCardViews(db, [cardId])).values();
    if (!view) return reply.code(404).send({ error: 'card_not_found' });
    const [game] = await db
      .select({
        slug: games.slug,
        summary: games.summary,
        developer: games.developerName,
        status: games.status,
      })
      .from(games)
      .where(eq(games.id, view.gameId));
    const owned = req.user
      ? await db
          .select({
            copyId: userCards.id,
            finish: userCards.finish,
            isBound: userCards.isBound,
            quantity: userCards.quantity,
            firstObtainedAt: userCards.firstObtainedAt,
            eventName: events.name,
          })
          .from(userCards)
          .leftJoin(events, eq(events.id, userCards.eventId))
          .where(and(eq(userCards.userId, req.user.id), eq(userCards.cardId, cardId)))
          .orderBy(asc(userCards.firstObtainedAt))
      : [];
    if (game!.status !== 'eligible' && owned.length === 0) {
      return reply.code(404).send({ error: 'card_not_found' });
    }
    const { rows: platforms } = await db.execute<{ name: string }>(sql`
      select p.name from game_platforms gp join platforms p on p.id = gp.platform_id
      where gp.game_id = ${view.gameId} and p.is_official order by p.id
    `);

    return {
      ...view,
      summary: game!.summary,
      developer: game!.developer,
      platforms: platforms.map((p) => p.name),
      // Attribution et lien vers la fiche IGDB (spec §20.2).
      igdbUrl: `https://www.igdb.com/games/${game!.slug}`,
      owned,
    };
  });
};
