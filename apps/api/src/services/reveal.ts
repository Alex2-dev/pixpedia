import { and, eq } from 'drizzle-orm';
import { dropEvents, packOpenings, type Db } from '@pixpedia/db';
import { ApiError } from '../errors';
import type { DrawnCard } from './open-pack';

export interface RevealResult {
  /** Cartes révélées jusqu'ici, dans l'ordre. */
  cards: DrawnCard[];
  total: number;
}

/**
 * Révèle les cartes d'une ouverture jusqu'à `upTo` (exclu), dans l'ordre : on ne peut pas
 * sauter en avant (règle anti-fuite). Les Hall of Fame nouvellement révélés sont annoncés
 * à la communauté (card_drop_hof) à ce moment-là, jamais avant.
 */
export async function revealOpening(
  db: Db,
  userId: number,
  openingId: number,
  upTo: number,
  now: Date = new Date(),
): Promise<RevealResult> {
  return db.transaction(async (tx) => {
    const [opening] = await tx
      .select()
      .from(packOpenings)
      .where(and(eq(packOpenings.id, openingId), eq(packOpenings.userId, userId)))
      .for('update');
    if (!opening) throw new ApiError(404, 'opening_not_found');
    const cards = opening.cards as DrawnCard[];
    const target = Math.min(upTo, cards.length);
    if (target > opening.revealedCount + 1 && upTo !== Infinity) {
      throw new ApiError(409, 'reveal_out_of_order');
    }
    if (target > opening.revealedCount) {
      const newly = cards.slice(opening.revealedCount, target);
      const hofs = newly.filter((c) => c.rarity === 'hof');
      if (hofs.length) {
        await tx
          .insert(dropEvents)
          .values(
            hofs.map((c) => ({ kind: 'card_drop_hof', userId, cardId: c.cardId, createdAt: now })),
          );
      }
      await tx
        .update(packOpenings)
        .set({ revealedCount: target })
        .where(eq(packOpenings.id, openingId));
    }
    return { cards: cards.slice(0, Math.max(target, opening.revealedCount)), total: cards.length };
  });
}
