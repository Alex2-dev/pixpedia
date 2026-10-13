import { randomInt } from 'node:crypto';
import { and, asc, desc, eq, ilike, sql, type SQL } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { cards, games, packTypes, userCards, users, type Db } from '@pixpedia/db';
import {
  FAMILY_LABELS,
  RARITIES,
  collectionQuerySchema,
  computePackStock,
  igdbCoverUrl,
  openPackSchema,
  type Family,
  type Rarity,
} from '@pixpedia/shared';
import { requireUser } from '../auth/plugin';
import { ApiError, sendInvalid } from '../errors';
import { escapeLike } from '../games';
import { describeCards, openPack, type PackConfig } from '../services/open-pack';

export interface PlayerRouteOptions {
  db: Db;
  pack: PackConfig;
  randomInt?: (max: number) => number;
  now?: () => Date;
}

const cardView = (rarity: Rarity, family: Family) => ({
  rarity,
  rarityLabel: RARITIES[rarity].label,
  rarityColor: RARITIES[rarity].color,
  cost: RARITIES[rarity].cost,
  family,
  familyLabel: FAMILY_LABELS[family],
});

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
    };
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
      })
      .from(packTypes)
      .where(eq(packTypes.isActive, true))
      .orderBy(asc(packTypes.id));
    return { packs: types };
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
        );
        const details = await describeCards(
          db,
          result.cards.map((c) => c.cardId),
        );
        return {
          ...result,
          cards: result.cards.map((c) => {
            const d = details.get(c.cardId);
            return {
              ...c,
              ...cardView(c.rarity, d.family as Family),
              name: d.name,
              coverUrl: d.coverImageId ? igdbCoverUrl(d.coverImageId) : null,
              releaseYear: d.releaseDate ? d.releaseDate.getUTCFullYear() : null,
              atk: d.atk,
              def: d.def,
              hp: d.hp,
              spd: d.spd,
            };
          }),
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
          cardId: cards.id,
          gameId: games.id,
          name: games.name,
          coverImageId: games.coverImageId,
          releaseDate: games.firstReleaseDate,
          rarity: cards.rarity,
          family: cards.family,
          atk: cards.atk,
          def: cards.def,
          hp: cards.hp,
          spd: cards.spd,
          finish: userCards.finish,
          isBound: userCards.isBound,
          quantity: userCards.quantity,
          isFavorite: userCards.isFavorite,
          firstObtainedAt: userCards.firstObtainedAt,
        })
        .from(userCards)
        .innerJoin(cards, eq(cards.id, userCards.cardId))
        .innerJoin(games, eq(games.id, cards.gameId))
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

    return {
      page: q.page,
      pageSize: q.pageSize,
      total: total!.n,
      cards: rows.map(({ coverImageId, releaseDate, rarity, family, ...r }) => ({
        ...r,
        ...cardView(rarity as Rarity, family as Family),
        coverUrl: coverImageId ? igdbCoverUrl(coverImageId) : null,
        releaseYear: releaseDate ? releaseDate.getUTCFullYear() : null,
      })),
    };
  });
};
