import { and, eq, gt, sql } from 'drizzle-orm';
import { cards, currencyLedger, userCards, users, type Db } from '@pixpedia/db';
import { recyclableCopies, recycleValue, type Rarity } from '@pixpedia/shared';
import { ApiError } from '../errors';

export interface RecycleItem {
  cardId: number;
  finish: string;
  quantity: number;
}

export interface RecycleResult {
  copies: number;
  shardsGained: number;
  shards: number;
}

/**
 * Recycle des doublons en éclats (spec §5.6), dans une transaction tracée dans `currency_ledger`.
 * Seules les cartes libres se recyclent, et un exemplaire est toujours gardé.
 */
export async function recycle(
  db: Db,
  userId: number,
  items: RecycleItem[],
): Promise<RecycleResult> {
  return db.transaction(async (tx) => {
    const [user] = await tx.select().from(users).where(eq(users.id, userId)).for('update');
    if (!user) throw new ApiError(401, 'unauthenticated');

    let copies = 0;
    let gained = 0;
    for (const item of items) {
      const [row] = await tx
        .select({ quantity: userCards.quantity, rarity: cards.rarity })
        .from(userCards)
        .innerJoin(cards, eq(cards.id, userCards.cardId))
        .where(
          and(
            eq(userCards.userId, userId),
            eq(userCards.cardId, item.cardId),
            eq(userCards.finish, item.finish),
            eq(userCards.isBound, false),
          ),
        );
      if (!row || item.quantity > recyclableCopies({ quantity: row.quantity, isBound: false })) {
        throw new ApiError(409, 'not_enough_duplicates');
      }
      const value = recycleValue(row.rarity as Rarity, item.quantity);
      await tx
        .update(userCards)
        .set({ quantity: sql`${userCards.quantity} - ${item.quantity}` })
        .where(
          and(
            eq(userCards.userId, userId),
            eq(userCards.cardId, item.cardId),
            eq(userCards.finish, item.finish),
            eq(userCards.isBound, false),
          ),
        );
      await tx.insert(currencyLedger).values({
        userId,
        currency: 'shards',
        delta: value,
        reason: 'recycle',
        refId: item.cardId,
      });
      copies += item.quantity;
      gained += value;
    }

    const shards = user.shards + gained;
    await tx.update(users).set({ shards }).where(eq(users.id, userId));
    return { copies, shardsGained: gained, shards };
  });
}

/** Tous les doublons libres du joueur, prêts à être recyclés. */
export async function listDuplicates(db: Db, userId: number) {
  const rows = await db
    .select({
      cardId: userCards.cardId,
      finish: userCards.finish,
      quantity: userCards.quantity,
      rarity: cards.rarity,
    })
    .from(userCards)
    .innerJoin(cards, eq(cards.id, userCards.cardId))
    .where(
      and(eq(userCards.userId, userId), eq(userCards.isBound, false), gt(userCards.quantity, 1)),
    );
  const items = rows.map((r) => ({
    cardId: r.cardId,
    finish: r.finish,
    quantity: recyclableCopies({ quantity: r.quantity, isBound: false }),
    value: recycleValue(r.rarity as Rarity, r.quantity - 1),
  }));
  return {
    items,
    copies: items.reduce((a, i) => a + i.quantity, 0),
    shards: items.reduce((a, i) => a + i.value, 0),
  };
}
