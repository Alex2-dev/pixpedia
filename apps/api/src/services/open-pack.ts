import { and, eq, inArray, sql } from 'drizzle-orm';
import {
  cards,
  currencyLedger,
  drawPool,
  drawPoolCounts,
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
  rarityFallbackOrder,
  rarityRank,
  EXTRA_STANDARD_PACK_SHARDS,
  packOddsSchema,
  resetsPity,
  finishOddsSchema,
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
  /** Toutes les cartes : à ne JAMAIS renvoyer telles quelles au client (règle anti-fuite). */
  cards: DrawnCard[];
  /** Nombre de cartes déjà révélées (rejeu après un rechargement). */
  revealedCount: number;
  replayed: boolean;
  packsAvailable: number;
  nextPackAt: Date | null;
  pityCounter: number;
  shards: number;
}

/** Tirages maximum par rareté pour éviter un doublon dans le même pack. */
const MAX_REDRAWS = 20;

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
  useShards = false,
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
        revealedCount: previous.revealedCount,
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
    const finishOdds = finishOddsSchema.parse(type.finishOdds);
    // Pack gratuit : pris sur le stock, ou payé en éclats si le joueur le demande (spec §5.6).
    // Les éclats se gagnent en jouant : aucun argent réel, les cartes restent libres.
    const fromStock = type.cost === 0 && stock.available > 0 && !useShards;
    const shardCost = fromStock ? 0 : type.cost === 0 ? EXTRA_STANDARD_PACK_SHARDS : type.cost;
    if (type.cost === 0 && stock.available < 1 && !useShards) {
      throw new ApiError(409, 'no_packs_available');
    }
    if (user.shards < shardCost) throw new ApiError(409, 'not_enough_shards');

    const counts = new Map(
      (
        await tx
          .select({ rarity: drawPoolCounts.rarity, n: drawPoolCounts.n })
          .from(drawPoolCounts)
          .where(eq(drawPoolCounts.packTypeId, type.id))
      ).map((c) => [c.rarity as Rarity, c.n]),
    );

    // 4. Tirage des 5 emplacements. Si une rareté manque au pool (ou n'a plus de carte
    // différente), on essaie en dessous puis au-dessus : utile aux packs thématiques.
    const drawn: { cardId: number; rarity: Rarity; finish: Finish }[] = [];
    for (let slot = 0; slot < PACK_SIZE; slot++) {
      let rolled = rollRarity(odds[slot]!, randomInt);
      if (slot === PACK_SIZE - 1) rolled = applyPity(rolled, user.pityCounter);

      let pick: { cardId: number; rarity: Rarity } | null = null;
      for (const rarity of rarityFallbackOrder(rolled)) {
        const n = counts.get(rarity) ?? 0;
        for (let attempt = 0; n > 0 && !pick && attempt < MAX_REDRAWS; attempt++) {
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
          if (row && !drawn.some((d) => d.cardId === row.cardId))
            pick = { cardId: row.cardId, rarity };
        }
        if (pick) break;
      }
      if (!pick) throw new ApiError(503, 'draw_pool_unavailable');
      drawn.push({ ...pick, finish: rollFinish(randomInt, finishOdds) });
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
    // Règle JONUM : un pack qui lie ses cartes (VIP, événement…) les lie quelle que soit la finition.
    const isBound = type.bindsCards;
    for (const d of drawn) {
      // Doublons comptés par carte, finition et liaison (index user_cards_copy_unique).
      await tx.execute(sql`
        insert into user_cards (user_id, card_id, finish, is_bound)
        values (${userId}, ${d.cardId}, ${d.finish}, ${isBound})
        on conflict (user_id, card_id, finish, is_bound, (coalesce(event_id, 0)))
        do update set quantity = user_cards.quantity + 1
      `);
    }
    const gameIds = new Map(
      (
        await tx
          .select({ id: cards.id, gameId: cards.gameId })
          .from(cards)
          .where(inArray(cards.id, ids))
      ).map((c) => [c.id, c.gameId]),
    );
    // Ordre de révélation, décidé par le serveur : la carte la plus rare du pack en dernier.
    const result: DrawnCard[] = drawn
      .map((d, slot) => ({
        ...d,
        gameId: gameIds.get(d.cardId) as number,
        isNew: !owned.has(d.cardId),
        slot,
      }))
      .sort((a, b) => rarityRank(a.rarity) - rarityRank(b.rarity) || a.slot - b.slot)
      .map(({ slot: _slot, ...c }) => c);

    // 6. Garantie, stock, éclats.
    const pityCounter = resetsPity(drawn.map((d) => d.rarity)) ? 0 : user.pityCounter + 1;
    const after = fromStock
      ? computePackStock(
          // Stock plein : computePackStock a déjà remis updatedAt à maintenant.
          { available: stock.available - 1, updatedAt: stock.updatedAt },
          now,
          pack,
        )
      : stock;
    const shards = user.shards - shardCost;
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
    // L'annonce d'un Hall of Fame (card_drop_hof) n'est écrite qu'à la révélation de la carte.
    if (shardCost > 0) {
      await tx.insert(currencyLedger).values({
        userId,
        currency: 'shards',
        delta: -shardCost,
        reason: 'pack_purchase',
        refId: opening!.id,
      });
    }

    return {
      openingId: opening!.id,
      cards: result,
      revealedCount: 0,
      replayed: false,
      packsAvailable: after.available,
      nextPackAt: after.nextPackAt,
      pityCounter,
      shards,
    };
  });
}
