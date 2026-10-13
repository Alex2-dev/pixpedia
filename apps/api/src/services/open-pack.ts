import { and, eq, inArray, sql } from 'drizzle-orm';
import {
  cards,
  currencyLedger,
  drawPool,
  drawPoolCounts,
  games,
  packOpenings,
  packTypes,
  userCards,
  users,
  type Db,
} from '@pixpedia/db';
import {
  PACK_SIZE,
  applyPity,
  computePackStock,
  lowerRarity,
  packOddsSchema,
  resetsPity,
  rollFinish,
  rollRarity,
  type Finish,
  type Rarity,
} from '@pixpedia/shared';
import { ApiError } from '../errors';

export interface PackConfig {
  max: number;
  regenMs: number;
}

export interface OpenPackDeps {
  db: Db;
  /** Entier dans [0, max) : `crypto.randomInt` en production (spec §8.4). */
  randomInt: (max: number) => number;
  now: () => Date;
  pack: PackConfig;
}

export interface DrawnCard {
  cardId: number;
  gameId: number;
  rarity: Rarity;
  finish: Finish;
  isNew: boolean;
}

export interface OpenPackResult {
  openingId: number;
  cards: DrawnCard[];
  replayed: boolean;
  packsAvailable: number;
  nextPackAt: Date | null;
  pityCounter: number;
  shards: number;
}

/** Tirages maximum pour éviter un doublon dans le même pack avant d'abandonner. */
const MAX_REDRAWS = 50;

/**
 * Ouvre un pack dans une transaction (spec §8.3). Le résultat n'existe qu'après le COMMIT ;
 * rejouer la même clé d'idempotence renvoie le tirage enregistré.
 * Packs gratuits ⇒ cartes libres (`is_bound = false`) : aucun paiement, règle JONUM respectée.
 */
export async function openPack(
  deps: OpenPackDeps,
  userId: number,
  packTypeId: number,
  idempotencyKey: string,
): Promise<OpenPackResult> {
  const { db, randomInt, pack } = deps;
  const now = deps.now();

  return db.transaction(async (tx) => {
    // 1. Verrou sur le joueur : deux ouvertures simultanées passent l'une après l'autre.
    const [user] = await tx.select().from(users).where(eq(users.id, userId)).for('update');
    if (!user) throw new ApiError(401, 'unauthenticated');

    const stock = computePackStock(
      { available: user.packsAvailable, updatedAt: user.packsUpdatedAt },
      now,
      pack,
    );

    // 2. Rejeu de la même requête (double clic, réseau) : on renvoie le tirage déjà fait.
    const [previous] = await tx
      .select()
      .from(packOpenings)
      .where(and(eq(packOpenings.userId, userId), eq(packOpenings.idempotencyKey, idempotencyKey)));
    if (previous) {
      return {
        openingId: previous.id,
        cards: previous.cards as DrawnCard[],
        replayed: true,
        packsAvailable: stock.available,
        nextPackAt: stock.nextPackAt,
        pityCounter: user.pityCounter,
        shards: user.shards,
      };
    }

    // 3. Stock ou éclats.
    const [type] = await tx.select().from(packTypes).where(eq(packTypes.id, packTypeId));
    if (!type || !type.isActive) throw new ApiError(404, 'pack_type_not_found');
    const odds = packOddsSchema.parse(type.odds);
    const isFree = type.cost === 0;
    if (isFree && stock.available < 1) throw new ApiError(409, 'no_packs_available');
    if (!isFree && user.shards < type.cost) throw new ApiError(409, 'not_enough_shards');

    const counts = new Map(
      (
        await tx
          .select({ rarity: drawPoolCounts.rarity, n: drawPoolCounts.n })
          .from(drawPoolCounts)
          .where(eq(drawPoolCounts.packTypeId, type.id))
      ).map((c) => [c.rarity as Rarity, c.n]),
    );

    // 4. Tirage des 5 emplacements.
    const drawn: { cardId: number; rarity: Rarity; finish: Finish }[] = [];
    for (let slot = 0; slot < PACK_SIZE; slot++) {
      let rarity: Rarity | null = rollRarity(odds[slot]!, randomInt);
      if (slot === PACK_SIZE - 1) rarity = applyPity(rarity, user.pityCounter);

      let cardId: number | null = null;
      for (let attempt = 0; rarity && cardId === null && attempt < MAX_REDRAWS; attempt++) {
        const n = counts.get(rarity) ?? 0;
        if (n === 0) {
          // Pool vide pour cette rareté : on descend d'un cran.
          rarity = lowerRarity(rarity);
          continue;
        }
        const idx = randomInt(n) + 1;
        const [row] = await tx
          .select({ cardId: drawPool.cardId })
          .from(drawPool)
          .where(
            and(
              eq(drawPool.packTypeId, type.id),
              eq(drawPool.rarity, rarity),
              eq(drawPool.idx, idx),
            ),
          );
        if (row && !drawn.some((d) => d.cardId === row.cardId)) cardId = row.cardId;
      }
      if (cardId === null || rarity === null) throw new ApiError(503, 'draw_pool_unavailable');
      drawn.push({ cardId, rarity, finish: rollFinish(randomInt) });
    }

    // 5. Collection : une carte est « nouvelle » si le joueur ne l'avait dans aucune finition.
    const ids = drawn.map((d) => d.cardId);
    const owned = new Set(
      (
        await tx
          .select({ cardId: userCards.cardId })
          .from(userCards)
          .where(and(eq(userCards.userId, userId), inArray(userCards.cardId, ids)))
      ).map((r) => r.cardId),
    );
    for (const d of drawn) {
      await tx
        .insert(userCards)
        .values({ userId, cardId: d.cardId, finish: d.finish, isBound: false })
        .onConflictDoUpdate({
          target: [userCards.userId, userCards.cardId, userCards.finish, userCards.isBound],
          set: { quantity: sql`${userCards.quantity} + 1` },
        });
    }
    const gameIds = new Map(
      (
        await tx
          .select({ id: cards.id, gameId: cards.gameId })
          .from(cards)
          .where(inArray(cards.id, ids))
      ).map((c) => [c.id, c.gameId]),
    );
    const result: DrawnCard[] = drawn.map((d) => ({
      ...d,
      gameId: gameIds.get(d.cardId) as number,
      isNew: !owned.has(d.cardId),
    }));

    // 6. Garantie, stock, éclats.
    const pityCounter = resetsPity(drawn.map((d) => d.rarity)) ? 0 : user.pityCounter + 1;
    const after = isFree
      ? computePackStock(
          // Stock plein : computePackStock a déjà remis updatedAt à maintenant.
          { available: stock.available - 1, updatedAt: stock.updatedAt },
          now,
          pack,
        )
      : stock;
    const shards = isFree ? user.shards : user.shards - type.cost;
    await tx
      .update(users)
      .set({
        pityCounter,
        packsAvailable: after.available,
        packsUpdatedAt: after.updatedAt,
        shards,
      })
      .where(eq(users.id, userId));

    // 7. Journal du tirage.
    const [opening] = await tx
      .insert(packOpenings)
      .values({ userId, packTypeId: type.id, idempotencyKey, cards: result, openedAt: now })
      .returning({ id: packOpenings.id });
    if (!isFree) {
      await tx.insert(currencyLedger).values({
        userId,
        currency: 'shards',
        delta: -type.cost,
        reason: 'pack_purchase',
        refId: opening!.id,
      });
    }

    return {
      openingId: opening!.id,
      cards: result,
      replayed: false,
      packsAvailable: after.available,
      nextPackAt: after.nextPackAt,
      pityCounter,
      shards,
    };
  });
}

/** Infos d'affichage des cartes tirées (nom, jaquette, stats). */
export async function describeCards(db: Db, cardIds: number[]) {
  if (!cardIds.length) return new Map();
  const rows = await db
    .select({
      cardId: cards.id,
      name: games.name,
      coverImageId: games.coverImageId,
      releaseDate: games.firstReleaseDate,
      family: cards.family,
      atk: cards.atk,
      def: cards.def,
      hp: cards.hp,
      spd: cards.spd,
    })
    .from(cards)
    .innerJoin(games, eq(games.id, cards.gameId))
    .where(inArray(cards.id, cardIds));
  return new Map(rows.map((r) => [r.cardId, r]));
}
